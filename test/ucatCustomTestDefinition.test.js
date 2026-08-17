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
const UcatPlatformTest = require("../model/ucat-model/ucatPlatformTest");
const UcatTestSession = require("../model/ucat-model/ucatTestSession");

console.log("=== Running UCAT Custom-Test Definition & Ownership Security Tests ===");

const server = app.listen(0, async () => {
    const port = server.address().port;

    const makeRequest = (reqPath, body = null, method = "GET", token = null) => {
        return new Promise((resolve, reject) => {
            const reqHeaders = { "Content-Type": "application/json" };
            if (token) {
                reqHeaders["Authorization"] = `Bearer ${token}`;
            }

            const req = http.request({
                hostname: "127.0.0.1",
                port,
                path: reqPath,
                method,
                headers: reqHeaders
            }, (res) => {
                let data = "";
                res.on("data", chunk => data += chunk);
                res.on("end", () => {
                    let parsed = null;
                    try { parsed = JSON.parse(data); } catch { parsed = data; }
                    resolve({
                        statusCode: res.statusCode,
                        body: parsed
                    });
                });
            });
            req.on("error", reject);
            if (body) req.write(JSON.stringify(body));
            req.end();
        });
    };

    try {
        if (process.env.CONNECTION_STRING) {
            if (mongoose.connection.readyState !== 1 || ucatConnection.readyState !== 1) {
                await connectDatabases();
                console.log("✔ Connected to Databases (including mbbs-UCAT)");
            }
        }
        if (mongoose.connection.readyState !== 1 || ucatConnection.readyState !== 1) {
            console.log("ℹ Databases not ready; skipping live UCAT custom test assertions.");
            server.close();
            return;
        }

        const studentA_Id = `STU_UCAT_CUST_A_${Date.now()}`;
        const studentB_Id = `STU_UCAT_CUST_B_${Date.now()}`;

        // 1. Create Mock User A in Auth collection
        const userA = await Auth.create({
            fullName: "UCAT Student Alpha",
            student_id: studentA_Id,
            phoneNumber: `+91977777${Math.floor(1000 + Math.random() * 9000)}`,
            auth_providers: ["whatsapp"],
            is_active: true
        });

        // 2. Create Mock User B in Auth collection
        const userB = await Auth.create({
            fullName: "UCAT Student Beta",
            student_id: studentB_Id,
            phoneNumber: `+91988888${Math.floor(1000 + Math.random() * 9000)}`,
            auth_providers: ["whatsapp"],
            is_active: true
        });

        const tokenA = jwt.sign(
            { id: userA._id.toString(), student_id: userA.student_id },
            process.env.SECRET_KEY,
            { expiresIn: "1h" }
        );

        const tokenB = jwt.sign(
            { id: userB._id.toString(), student_id: userB.student_id },
            process.env.SECRET_KEY,
            { expiresIn: "1h" }
        );

        console.log(`✔ Created test users: Student A (${studentA_Id}) & Student B (${studentB_Id})`);

        // =========================================================================
        // Test 1: Student A saves a UCAT custom test definition
        // =========================================================================
        const saveRes = await makeRequest("/api/v1/ucat/test/custom/save", {
            title: "Verbal Reasoning Mastery",
            subjects: ["VERBAL_REASONING"],
            total_questions: 5,
            duration: 15,
            level: "Intermediate"
        }, "POST", tokenA);

        assert.strictEqual(saveRes.statusCode, 201, `Expected 201, got ${saveRes.statusCode}: ${JSON.stringify(saveRes.body)}`);
        assert.ok(saveRes.body.data);
        const customTestIdA = saveRes.body.data.custom_test_id;
        assert.ok(customTestIdA, "Response must include custom_test_id");
        assert.strictEqual(saveRes.body.data.status, "not_started");

        // Verify in DB
        const savedDoc = await UcatPlatformTest.findOne({ id: customTestIdA }).lean();
        assert.strictEqual(savedDoc.student_id, studentA_Id, "Custom test definition in DB must be owned by Student A");
        console.log(`✔ Test 1 PASS: Student A saved custom test definition (ID: ${customTestIdA})`);

        // =========================================================================
        // Test 2: Student A lists custom tests -> sees A's test
        // =========================================================================
        const listResA = await makeRequest("/api/v1/ucat/test/custom", null, "GET", tokenA);
        assert.strictEqual(listResA.statusCode, 200);
        const foundInA = listResA.body.data.some(t => t.custom_test_id === customTestIdA);
        assert.ok(foundInA, "Student A list should include their saved custom test");
        console.log("✔ Test 2 PASS: Student A lists custom tests and sees own test");

        // =========================================================================
        // Test 3: Student B lists custom tests -> does NOT see A's test
        // =========================================================================
        const listResB = await makeRequest("/api/v1/ucat/test/custom", null, "GET", tokenB);
        assert.strictEqual(listResB.statusCode, 200);
        const foundInB = (listResB.body.data || []).some(t => t.custom_test_id === customTestIdA);
        assert.ok(!foundInB, "Student B list must NOT include Student A's custom test");
        console.log("✔ Test 3 PASS: Student B does NOT see Student A's custom test");

        // =========================================================================
        // Test 4: Student A gets A's custom test definition -> 200
        // =========================================================================
        const getResA = await makeRequest(`/api/v1/ucat/test/custom/${customTestIdA}`, null, "GET", tokenA);
        assert.strictEqual(getResA.statusCode, 200);
        assert.strictEqual(getResA.body.data.custom_test_id, customTestIdA);
        console.log("✔ Test 4 PASS: Student A successfully fetches own custom test definition");

        // =========================================================================
        // Test 5: Student B gets A's custom test definition -> 403
        // =========================================================================
        const getResB = await makeRequest(`/api/v1/ucat/test/custom/${customTestIdA}`, null, "GET", tokenB);
        assert.strictEqual(getResB.statusCode, 403, `Expected 403 Forbidden, got ${getResB.statusCode}`);
        console.log("✔ Test 5 PASS: Student B forbidden from fetching Student A's custom test (403)");

        // =========================================================================
        // Test 6: Student A starts A's saved custom test -> creates new session
        // =========================================================================
        const startResA = await makeRequest("/api/v1/ucat/test/start", {
            custom_test_id: customTestIdA
        }, "POST", tokenA);

        assert.ok([200, 201].includes(startResA.statusCode), `Expected 200/201, got ${startResA.statusCode}`);
        const sessionIdA = startResA.body.data?.sessionId || startResA.body.sessionId;
        assert.ok(sessionIdA, "Session ID must be returned");

        const sessionDocA = await UcatTestSession.findOne({ sessionId: sessionIdA }).lean();
        assert.strictEqual(sessionDocA.student_id, studentA_Id, "Session must belong to Student A");
        assert.strictEqual(sessionDocA.custom_test_id, customTestIdA, "Session must reference custom_test_id");
        console.log(`✔ Test 6 PASS: Student A started saved custom test (Session: ${sessionIdA})`);

        // =========================================================================
        // Test 7: Student B starts A's saved custom test -> 403
        // =========================================================================
        const startResB = await makeRequest("/api/v1/ucat/test/start", {
            custom_test_id: customTestIdA
        }, "POST", tokenB);

        assert.strictEqual(startResB.statusCode, 403, `Expected 403, got ${startResB.statusCode}`);
        console.log("✔ Test 7 PASS: Student B forbidden from starting Student A's saved custom test (403)");

        // =========================================================================
        // Test 8: Student A retakes custom test after submit -> new session created
        // =========================================================================
        await makeRequest("/api/v1/ucat/test/submit", {
            sessionId: sessionIdA,
            answers: []
        }, "POST", tokenA);

        const retakeResA = await makeRequest("/api/v1/ucat/test/start", {
            custom_test_id: customTestIdA
        }, "POST", tokenA);

        assert.ok([200, 201].includes(retakeResA.statusCode));
        const retakeSessionId = retakeResA.body.data?.sessionId || retakeResA.body.sessionId;
        assert.ok(retakeSessionId);
        assert.notStrictEqual(retakeSessionId, sessionIdA, "Retake must generate a new session ID");
        console.log(`✔ Test 8 PASS: Retake created new session (${retakeSessionId}) owned by Student A`);

        // =========================================================================
        // Test 9: Student B retakes A's custom test -> 403
        // =========================================================================
        const retakeResB = await makeRequest("/api/v1/ucat/test/start", {
            custom_test_id: customTestIdA
        }, "POST", tokenB);

        assert.strictEqual(retakeResB.statusCode, 403);
        console.log("✔ Test 9 PASS: Student B forbidden from retaking Student A's custom test (403)");

        // =========================================================================
        // Test 10: Validation checks (missing title, invalid subject)
        // =========================================================================
        const invalid1 = await makeRequest("/api/v1/ucat/test/custom/save", {
            subjects: ["VERBAL_REASONING"],
            total_questions: 5,
            duration: 10
        }, "POST", tokenA);
        assert.strictEqual(invalid1.statusCode, 400);

        const invalid2 = await makeRequest("/api/v1/ucat/test/custom/save", {
            title: "Bad Subject",
            subjects: ["INVALID_SUBJECT"],
            total_questions: 5,
            duration: 10
        }, "POST", tokenA);
        assert.strictEqual(invalid2.statusCode, 400);
        console.log("✔ Test 10 PASS: Input validation strictly enforces required title and valid subjects");

        // Cleanup
        await Auth.deleteMany({ _id: { $in: [userA._id, userB._id] } });
        await UcatPlatformTest.deleteMany({ id: customTestIdA });
        await UcatTestSession.deleteMany({ sessionId: { $in: [sessionIdA, retakeSessionId] } });

        console.log("\nALL UCAT CUSTOM-TEST DEFINITION SECURITY TESTS PASSED! 🎉");
    } catch (err) {
        console.error("\n❌ UCAT CUSTOM TEST SECURITY TEST FAILED:", err);
        process.exitCode = 1;
    } finally {
        server.close();
        process.exit(process.exitCode || 0);
    }
});
