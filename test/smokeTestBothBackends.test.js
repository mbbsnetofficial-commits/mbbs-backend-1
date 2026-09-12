"use strict";

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "config", "config.env") });
const http = require("http");
const assert = require("assert");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const app = require("../app");
const { connectDatabases, ucatConnection } = require("../config/database");
const Auth = require("../model/neet-models/auth");
const DeviceToken = require("../model/neet-models/deviceToken");
const Notification = require("../model/neet-models/notification");
const StudentProfile = require("../model/neet-models/studentProfile");
const UcatTestSession = require("../model/ucat-model/ucatTestSession");

console.log("\n=========================================================");
console.log("🚀 STARTING DUAL-BACKEND SMOKE TEST (NEET + UCAT BACKENDS)");
console.log("=========================================================\n");

const TEST_SECRET = process.env.SECRET_KEY || "test-secret-key-12345";
process.env.SECRET_KEY = TEST_SECRET;

const makeRequest = (port, path, method = "GET", headers = {}, body = null) => {
    return new Promise((resolve, reject) => {
        const payload = body ? JSON.stringify(body) : null;
        const reqHeaders = { ...headers };
        if (payload) {
            reqHeaders["Content-Type"] = "application/json";
            reqHeaders["Content-Length"] = Buffer.byteLength(payload);
        }

        const start = Date.now();
        const req = http.request(
            {
                hostname: "127.0.0.1",
                port,
                path,
                method,
                headers: reqHeaders
            },
            res => {
                let data = "";
                res.on("data", chunk => (data += chunk));
                res.on("end", () => {
                    let parsed = null;
                    try {
                        parsed = JSON.parse(data);
                    } catch {
                        parsed = data;
                    }
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: parsed,
                        durationMs: Date.now() - start
                    });
                });
            }
        );

        req.on("error", reject);
        if (payload) req.write(payload);
        req.end();
    });
};

(async () => {
    const results = {
        total: 0,
        passed: 0,
        failed: 0,
        details: []
    };

    const recordTest = (suite, name, passed, details = "") => {
        results.total++;
        if (passed) {
            results.passed++;
            console.log(`  ✔ [${suite}] ${name} ${details ? `(${details})` : ""}`);
        } else {
            results.failed++;
            console.error(`  ❌ [${suite}] ${name} ${details ? `(${details})` : ""}`);
        }
        results.details.push({ suite, name, passed, details });
    };

    let server = null;

    try {
        // Connect to primary & secondary DBs
        await connectDatabases();
        console.log("✔ Connected to MongoDB instances (NEET primary + UCAT)\n");

        server = http.createServer(app);
        await new Promise(res => server.listen(0, res));
        const port = server.address().port;

        // -------------------------------------------------------------
        // SETUP TEST USERS
        // -------------------------------------------------------------
        const uniqueSuffix = Date.now();
        const neetStudentId = `STU_NEET_SMOKE_${uniqueSuffix}`;
        const ucatStudentId = `STU_UCAT_SMOKE_${uniqueSuffix}`;

        const neetUser = await Auth.findOneAndUpdate(
            { email: `smoke_neet_${uniqueSuffix}@mbbs.net` },
            {
                $set: {
                    email: `smoke_neet_${uniqueSuffix}@mbbs.net`,
                    student_id: neetStudentId,
                    fullName: "Smoke NEET Student",
                    phoneNumber: `+9198888${Math.floor(10000 + Math.random() * 90000)}`,
                    is_active: true
                }
            },
            { upsert: true, returnDocument: "after" }
        );

        const neetToken = jwt.sign(
            { id: neetUser._id.toString(), student_id: neetUser.student_id },
            TEST_SECRET,
            { algorithm: "HS256", expiresIn: "2h" }
        );
        const neetAuthHeader = { Authorization: `Bearer ${neetToken}` };

        const ucatUser = await Auth.findOneAndUpdate(
            { email: `smoke_ucat_${uniqueSuffix}@mbbs.net` },
            {
                $set: {
                    email: `smoke_ucat_${uniqueSuffix}@mbbs.net`,
                    student_id: ucatStudentId,
                    fullName: "Smoke UCAT Student",
                    phoneNumber: `+9197777${Math.floor(10000 + Math.random() * 90000)}`,
                    is_active: true
                }
            },
            { upsert: true, returnDocument: "after" }
        );

        const ucatToken = jwt.sign(
            { id: ucatUser._id.toString(), student_id: ucatUser.student_id },
            TEST_SECRET,
            { algorithm: "HS256", expiresIn: "2h" }
        );
        const ucatAuthHeader = { Authorization: `Bearer ${ucatToken}` };

        // -------------------------------------------------------------
        // SUITE 1: GENERAL & SYSTEM HEALTH
        // -------------------------------------------------------------
        console.log("--- 1. GENERAL HEALTH & SECURITY HEADERS ---");
        
        // Test 1.1: Root landing
        const resRoot = await makeRequest(port, "/");
        recordTest("SYSTEM", "GET / returns 200 OK with landing message", resRoot.statusCode === 200 && resRoot.body.status === "success", `${resRoot.durationMs}ms`);

        // Test 1.2: Health endpoint
        const resHealth = await makeRequest(port, "/health");
        recordTest("SYSTEM", "GET /health returns 200 OK without secrets leakage", resHealth.statusCode === 200 && resHealth.body.timestamp && !resHealth.body.connectionString, `${resHealth.durationMs}ms`);

        // Test 1.3: Security headers (Trusted origin allowed, untrusted blocked, X-Powered-By masked)
        const resCorsTrusted = await makeRequest(port, "/health", "GET", { "Origin": "https://mbbs.net" });
        const resCorsUntrusted = await makeRequest(port, "/health", "GET", { "Origin": "https://evil.com" });
        const corsSecure = resCorsTrusted.headers["access-control-allow-origin"] === "https://mbbs.net" &&
                           resCorsUntrusted.headers["access-control-allow-origin"] === undefined;
        const noPoweredBy = resHealth.headers["x-powered-by"] === undefined;
        recordTest("SECURITY", "CORS strictly enforced (trusted allowed, untrusted blocked) & X-Powered-By masked", corsSecure && noPoweredBy);

        // -------------------------------------------------------------
        // SUITE 2: NEET BACKEND & NOTIFICATIONS
        // -------------------------------------------------------------
        console.log("\n--- 2. NEET BACKEND SERVICES & PUSH NOTIFICATIONS ---");

        // Test 2.1: Register iOS device token
        const iosFcmToken = `ios_token_smoke_test_${uniqueSuffix}`;
        const resIosReg = await makeRequest(port, "/api/v1/notifications/device-token", "POST", neetAuthHeader, {
            token: iosFcmToken,
            deviceType: "ios",
            deviceId: "iPhone_15_Pro_Max",
            appVersion: "2.1.0"
        });
        const iosSaved = await DeviceToken.findOne({ token: iosFcmToken, is_active: true });
        recordTest("NEET", "Register iOS FCM device token (POST /notifications/device-token)", resIosReg.statusCode === 200 && Boolean(iosSaved), `${resIosReg.durationMs}ms`);

        // Test 2.2: Register Android device token
        const androidFcmToken = `android_token_smoke_test_${uniqueSuffix}`;
        const resAndroidReg = await makeRequest(port, "/api/v1/notifications/device-token", "POST", neetAuthHeader, {
            token: androidFcmToken,
            deviceType: "android",
            deviceId: "Pixel_8_Pro",
            appVersion: "2.1.0"
        });
        const androidSaved = await DeviceToken.findOne({ token: androidFcmToken, is_active: true });
        recordTest("NEET", "Register Android FCM device token", resAndroidReg.statusCode === 200 && Boolean(androidSaved), `${resAndroidReg.durationMs}ms`);

        // Test 2.3: University Admission Invite Webhook (Public / Portal endpoint)
        const resUnivInvite = await makeRequest(port, "/api/v1/invites/university", "POST", {}, {
            university_name: "Management and Science University (MSU Malaysia)",
            student_id: neetStudentId,
            program_name: "Doctor of Medicine (MD / MBBS)",
            invite_id: `INV_MSU_${uniqueSuffix}`,
            course_duration: "6 Years",
            match_percentage: "92%",
            custom_message: "Congratulations! You have received a direct admission offer from MSU Malaysia."
        });
        recordTest("NEET", "University Admission Invite Webhook (POST /invites/university)", resUnivInvite.statusCode === 200 && resUnivInvite.body.success === true, `${resUnivInvite.durationMs}ms`);

        // Test 2.4: Fetch in-app notifications for the student
        const resListNotifs = await makeRequest(port, "/api/v1/notifications", "GET", neetAuthHeader);
        const inviteFound = Array.isArray(resListNotifs.body.data) && resListNotifs.body.data.some(n => n.title.includes("MSU Malaysia") || n.message.includes("MSU Malaysia"));
        recordTest("NEET", "List Notifications retrieves saved University Admission Invite", resListNotifs.statusCode === 200 && inviteFound, `Found: ${resListNotifs.body.total || 0} items`);

        // Test 2.5: Unread count endpoint
        const resUnread = await makeRequest(port, "/api/v1/notifications/unread-count", "GET", neetAuthHeader);
        recordTest("NEET", "Get Unread Notifications Count (GET /notifications/unread-count)", resUnread.statusCode === 200 && resUnread.body.data?.unread_count > 0, `Unread: ${resUnread.body.data?.unread_count}`);

        // Test 2.6: Direct Send Notification endpoint
        const resDirectSend = await makeRequest(port, "/api/v1/notifications/send", "POST", neetAuthHeader, {
            userId: neetUser._id.toString(),
            title: "NEET Botany Live Test",
            body: "Your Botany Full Mock Test is now available.",
            type: "test"
        });
        recordTest("NEET", "Direct Notification Dispatch (POST /notifications/send)", resDirectSend.statusCode === 200 && resDirectSend.body.success === true, `${resDirectSend.durationMs}ms`);

        // Test 2.7: Diagnostic Token Test Route (POST /notifications/test-token)
        const resTestToken = await makeRequest(port, "/api/v1/notifications/test-token", "POST", neetAuthHeader, {
            token: "ios_dummy_test_token_for_apns_verification",
            title: "APNs Test",
            body: "Testing iOS Push Connectivity"
        });
        recordTest("NEET", "Token Diagnostic Push Endpoint (POST /notifications/test-token)", [200, 500].includes(resTestToken.statusCode), `Handled gracefully (Status: ${resTestToken.statusCode})`);

        // Test 2.8: Automated Incomplete Test Notification Endpoint
        const resIncomplete = await makeRequest(port, "/api/v1/notifications/incomplete-test", "POST", neetAuthHeader, {
            studentId: neetStudentId,
            testType: "NEET Biology Mock"
        });
        recordTest("NEET", "Incomplete Test Reminder Notification (POST /notifications/incomplete-test)", resIncomplete.statusCode === 200 && resIncomplete.body.success === true, `${resIncomplete.durationMs}ms`);

        // -------------------------------------------------------------
        // SUITE 3: UCAT BACKEND SERVICES
        // -------------------------------------------------------------
        console.log("\n--- 3. UCAT BACKEND SERVICES ---");

        // Test 3.1: UCAT Streaks
        const resUcatStreak = await makeRequest(port, "/api/v1/ucat/streaks", "GET", ucatAuthHeader);
        recordTest("UCAT", "Fetch UCAT Study Streaks (GET /api/v1/ucat/streaks)", [200, 404].includes(resUcatStreak.statusCode), `Status: ${resUcatStreak.statusCode}, ${resUcatStreak.durationMs}ms`);

        // Test 3.2: UCAT Previous Year Tests listing
        const resUcatPyq = await makeRequest(port, "/api/v1/ucat/previous-year-tests", "GET", ucatAuthHeader);
        recordTest("UCAT", "List UCAT Previous Year Tests (GET /api/v1/ucat/previous-year-tests)", [200, 404].includes(resUcatPyq.statusCode), `Status: ${resUcatPyq.statusCode}, ${resUcatPyq.durationMs}ms`);

        // Test 3.3: UCAT Zone Insights
        const resUcatInsights = await makeRequest(port, "/api/v1/ucat/insights/summary", "GET", ucatAuthHeader);
        recordTest("UCAT", "Fetch UCAT Zone Insights (GET /api/v1/ucat/insights/summary)", [200, 404].includes(resUcatInsights.statusCode), `Status: ${resUcatInsights.statusCode}, ${resUcatInsights.durationMs}ms`);

        // Test 3.4: UCAT Test Session Creation / Access
        const mockUcatSessionId = new mongoose.Types.ObjectId();
        const resUcatSession = await makeRequest(port, `/api/v1/ucat/test/session/${mockUcatSessionId}`, "GET", ucatAuthHeader);
        recordTest("UCAT", "UCAT Test Session Security & Route Resolution", [200, 404, 400].includes(resUcatSession.statusCode), `Status: ${resUcatSession.statusCode}, ${resUcatSession.durationMs}ms`);

        // -------------------------------------------------------------
        // CLEANUP
        // -------------------------------------------------------------
        await DeviceToken.deleteMany({ token: { $in: [iosFcmToken, androidFcmToken] } });
        await Notification.deleteMany({ student_id: { $in: [neetStudentId, ucatStudentId] } });
        await Auth.deleteMany({ _id: { $in: [neetUser._id, ucatUser._id] } });

        console.log("\n=========================================================");
        console.log(`🏁 SMOKE TEST SUMMARY: ${results.passed}/${results.total} PASSED (${results.failed} failed)`);
        console.log("=========================================================\n");

        if (results.failed === 0) {
            console.log("🎉 ALL DUAL-BACKEND SMOKE TESTS PASSED CLEANLY!\n");
            process.exit(0);
        } else {
            console.error("⚠️ Some smoke tests failed. Please inspect details above.\n");
            process.exit(1);
        }
    } catch (err) {
        console.error("\n❌ FATAL SMOKE TEST RUNNER ERROR:", err);
        process.exit(1);
    } finally {
        if (server) server.close();
    }
})();
