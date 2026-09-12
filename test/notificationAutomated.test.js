"use strict";

const http = require("http");
const assert = require("assert");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const app = require("../app");
const Auth = require("../model/neet-models/auth");
const DeviceToken = require("../model/neet-models/deviceToken");
const Notification = require("../model/neet-models/notification");
const TestSession = require("../model/neet-models/testSession");

require("dotenv").config({ path: "config/config.env" });

console.log("=== Running Automated Incomplete Test & University Invite Push Notification Tests ===");

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
                    resolve({ statusCode: res.statusCode, headers: res.headers, body: parsed });
                });
            }
        );

        req.on("error", reject);
        if (payload) req.write(payload);
        req.end();
    });
};

(async () => {
    try {
        const connStr = process.env.CONNECTION_STRING;
        if (connStr && mongoose.connection.readyState === 0) {
            await mongoose.connect(connStr);
            console.log("✔ Connected to MongoDB for Automated Push tests");
        }

        const testUser = await Auth.findOneAndUpdate(
            { email: "automated_push_student@mbbs.net" },
            {
                $set: {
                    email: "automated_push_student@mbbs.net",
                    student_id: "STU_AUTO_TEST_99",
                    is_active: true
                }
            },
            { upsert: true, returnDocument: "after" }
        );

        const token = jwt.sign(
            { id: testUser._id.toString(), student_id: testUser.student_id },
            TEST_SECRET,
            { algorithm: "HS256", expiresIn: "1h" }
        );

        const authHeaders = { Authorization: `Bearer ${token}` };

        const testFcmToken = "fcm_test_device_token_automated_777";
        await DeviceToken.findOneAndUpdate(
            { token: testFcmToken },
            {
                $set: {
                    user_id: testUser._id,
                    student_id: testUser.student_id,
                    device_type: "android",
                    is_active: true,
                    last_used_at: new Date()
                }
            },
            { upsert: true, returnDocument: "after" }
        );

        const server = http.createServer(app);
        await new Promise(res => server.listen(0, res));
        const port = server.address().port;

        // Test 1: Incomplete Test Push Notification
        const testSession = await TestSession.create({
            student_id: testUser.student_id,
            subjects: ["Biology"],
            chapters: ["Genetics"],
            total_questions: 10,
            duration: 15,
            test_type: "Quick Test",
            status: "Started",
            started_at: new Date(Date.now() - 10 * 60 * 1000)
        });

        const res1 = await makeRequest(port, "/api/v1/notifications/incomplete-test", "POST", authHeaders, {
            sessionId: testSession._id.toString(),
            testType: "Quick Test"
        });
        assert.strictEqual(res1.statusCode, 200, "Should succeed with 200");
        assert.strictEqual(res1.body.success, true);
        console.log("✔ Test 1 PASS: Incomplete test reminder push notification sent successfully");

        // Verify in-app notification created
        const savedNotif1 = await Notification.findOne({
            user_id: testUser._id,
            notification_type: "reminder",
            "data.type": "TEST_INCOMPLETE"
        });
        assert.ok(savedNotif1, "In-app reminder notification should be created");
        assert.ok(savedNotif1.message.includes("incomplete"), "Message should mention incomplete test");
        console.log("✔ Test 2 PASS: In-app reminder notification stored in MongoDB");

        // Test 3: University Invite Push Notification with University Name
        const res2 = await makeRequest(port, "/api/v1/invites/university", "POST", {}, {
            student_id: testUser.student_id,
            university_name: "Harvard Medical School",
            program_name: "Doctor of Medicine (MD)",
            invite_id: "INV_HARVARD_2026_01",
            action_url: "/invites/INV_HARVARD_2026_01"
        });
        assert.strictEqual(res2.statusCode, 200);
        assert.strictEqual(res2.body.success, true);
        assert.strictEqual(res2.body.data.university_name, "Harvard Medical School");
        console.log("✔ Test 3 PASS: University invite push notification sent with university name");

        // Verify in-app university invite notification
        const savedNotif2 = await Notification.findOne({
            user_id: testUser._id,
            notification_type: "university_invite"
        });
        assert.ok(savedNotif2, "In-app university invite notification created");
        assert.ok(savedNotif2.title.includes("Harvard Medical School"), "Title must contain university name");
        assert.ok(savedNotif2.message.includes("Harvard Medical School"), "Body must contain university name");
        console.log("✔ Test 4 PASS: In-app university invite stored with university name");

        // Test 5: Incomplete Test background scan
        const res3 = await makeRequest(port, "/api/v1/notifications/check-incomplete-tests", "POST", authHeaders, {
            inactivity_minutes: 5
        });
        assert.strictEqual(res3.statusCode, 200);
        assert.strictEqual(res3.body.success, true);
        console.log("✔ Test 5 PASS: Incomplete test session scan executed cleanly");

        // Cleanup
        await DeviceToken.deleteMany({ token: testFcmToken });
        await TestSession.findByIdAndDelete(testSession._id);
        await Notification.deleteMany({ user_id: testUser._id });
        server.close();

        console.log("\nALL AUTOMATED PUSH NOTIFICATION TESTS PASSED SUCCESSFULLY! 🎉\n");
        process.exit(0);
    } catch (err) {
        console.error("❌ Test Failed:", err);
        process.exit(1);
    }
})();
