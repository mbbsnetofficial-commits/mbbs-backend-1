"use strict";

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "config", "config.env") });
const http = require("http");
const assert = require("assert");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const app = require("../app");
const { connectDatabases } = require("../config/database");
const Auth = require("../model/neet-models/auth");
const PlatformTest = require("../model/neet-models/platformTest");
const TestSession = require("../model/neet-models/testSession");

console.log("=== Running NEET Custom-Test Ownership & Isolation Security Tests ===");

const server = app.listen(0, async () => {
    const port = server.address().port;

    if (process.env.CONNECTION_STRING && mongoose.connection.readyState === 0) {
        try {
            await connectDatabases();
            console.log("✔ Connected to Databases");
        } catch (e) {
            console.log("ℹ DB connection skipped:", e.message);
        }
    }

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
        if (mongoose.connection.readyState !== 1) {
            console.log("ℹ Database not available; skipping live database security assertions.");
            server.close();
            return;
        }

        const studentA_Id = `STU_A_${Date.now()}`;
        const studentB_Id = `STU_B_${Date.now()}`;

        // 1. Create Mock User A in Auth collection
        const userA = await Auth.create({
            fullName: "Student Alpha",
            student_id: studentA_Id,
            phoneNumber: `+91911111${Math.floor(1000 + Math.random() * 9000)}`,
            auth_providers: ["whatsapp"],
            is_active: true
        });

        // 2. Create Mock User B in Auth collection
        const userB = await Auth.create({
            fullName: "Student Beta",
            student_id: studentB_Id,
            phoneNumber: `+91922222${Math.floor(1000 + Math.random() * 9000)}`,
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

        console.log("✔ Created test users: Student A (" + studentA_Id + ") & Student B (" + studentB_Id + ")");

        // =========================================================================
        // Test 1: Built-in tests visible to both Student A and Student B
        // =========================================================================
        const builtinResA = await makeRequest("/api/v1/neet/tests/builtin", null, "GET", tokenA);
        assert.strictEqual(builtinResA.statusCode, 200);
        assert.ok(builtinResA.body.data.length >= 5);

        const builtinResB = await makeRequest("/api/v1/neet/tests/builtin", null, "GET", tokenB);
        assert.strictEqual(builtinResB.statusCode, 200);
        assert.ok(builtinResB.body.data.length >= 5);
        console.log("✔ Test 1 PASS: Built-in NEET tests accessible to both Student A and Student B");

        // =========================================================================
        // Test 2: Student A creates a Custom Test
        // =========================================================================
        const createTestARes = await makeRequest("/api/v1/test/save", {
            title: "Physics Mechanics Alpha",
            subjects: ["Physics"],
            questionCount: 10,
            duration: 30
        }, "POST", tokenA);

        assert.strictEqual(createTestARes.statusCode, 201);
        const customTestA_Id = createTestARes.body.data.id;
        assert.ok(customTestA_Id);
        console.log(`✔ Test 2 PASS: Student A created custom test (ID: ${customTestA_Id})`);

        // =========================================================================
        // Test 3: Student B creates a Custom Test
        // =========================================================================
        const createTestBRes = await makeRequest("/api/v1/test/save", {
            title: "Chemistry Organic Beta",
            subjects: ["Chemistry"],
            questionCount: 10,
            duration: 30
        }, "POST", tokenB);

        assert.strictEqual(createTestBRes.statusCode, 201);
        const customTestB_Id = createTestBRes.body.data.id;
        assert.ok(customTestB_Id);
        console.log(`✔ Test 3 PASS: Student B created custom test (ID: ${customTestB_Id})`);

        // =========================================================================
        // Test 4: Custom Test Listing Isolation (Learning Report)
        // =========================================================================
        const reportARes = await makeRequest("/api/v1/student/dashboard/neet-learning-report?source=custom", null, "GET", tokenA);
        assert.strictEqual(reportARes.statusCode, 200);
        const reportAIds = reportARes.body.data.map(t => t.id);
        assert.ok(reportAIds.includes(customTestA_Id), "Student A must see Test A");
        assert.ok(!reportAIds.includes(customTestB_Id), "Student A must NOT see Test B");

        const reportBRes = await makeRequest("/api/v1/student/dashboard/neet-learning-report?source=custom", null, "GET", tokenB);
        assert.strictEqual(reportBRes.statusCode, 200);
        const reportBIds = reportBRes.body.data.map(t => t.id);
        assert.ok(reportBIds.includes(customTestB_Id), "Student B must see Test B");
        assert.ok(!reportBIds.includes(customTestA_Id), "Student B must NOT see Test A");
        console.log("✔ Test 4 PASS: Custom test listing strictly isolated between Student A and Student B");

        // =========================================================================
        // Test 5: Custom Test Start Authorization (A starts A, B starts B, cross-start blocked)
        // =========================================================================
        const startAByA = await makeRequest("/api/v1/test/start", { custom_test_id: customTestA_Id }, "POST", tokenA);
        assert.strictEqual(startAByA.statusCode, 200);
        const sessionA_Id = startAByA.body.sessionId;
        assert.ok(sessionA_Id);

        const startBByB = await makeRequest("/api/v1/test/start", { custom_test_id: customTestB_Id }, "POST", tokenB);
        assert.strictEqual(startBByB.statusCode, 200);
        const sessionB_Id = startBByB.body.sessionId;
        assert.ok(sessionB_Id);

        // Cross-start attempts must be rejected with 403
        const startBByA = await makeRequest("/api/v1/test/start", { custom_test_id: customTestB_Id }, "POST", tokenA);
        assert.strictEqual(startBByA.statusCode, 403, "Student A starting Student B's custom test must return 403");

        const startAByB = await makeRequest("/api/v1/test/start", { custom_test_id: customTestA_Id }, "POST", tokenB);
        assert.strictEqual(startAByB.statusCode, 403, "Student B starting Student A's custom test must return 403");
        console.log("✔ Test 5 PASS: Starting unauthorized custom tests rejected with HTTP 403");

        // =========================================================================
        // Test 6: Session Read Authorization (GET /test/sessions/:sessionId)
        // =========================================================================
        const getSessionAByA = await makeRequest(`/api/v1/test/sessions/${sessionA_Id}`, null, "GET", tokenA);
        assert.strictEqual(getSessionAByA.statusCode, 200);

        const getSessionAByB = await makeRequest(`/api/v1/test/sessions/${sessionA_Id}`, null, "GET", tokenB);
        assert.strictEqual(getSessionAByB.statusCode, 403, "Student B reading Student A's session must return 403");
        assert.strictEqual(getSessionAByB.body.message, "Unauthorized access to this test session.");

        const getSessionBByA = await makeRequest(`/api/v1/test/sessions/${sessionB_Id}`, null, "GET", tokenA);
        assert.strictEqual(getSessionBByA.statusCode, 403, "Student A reading Student B's session must return 403");
        console.log("✔ Test 6 PASS: Reading unauthorized test sessions rejected with HTTP 403");

        // =========================================================================
        // Test 7: Session Update / Autosave Authorization (PATCH /test/sessions/:sessionId)
        // =========================================================================
        const qIdA = startAByA.body.data[0].id;
        const patchAByA = await makeRequest(`/api/v1/test/sessions/${sessionA_Id}`, {
            question_id: qIdA,
            selected_option: "B",
            time_spent: 10
        }, "PATCH", tokenA);
        assert.strictEqual(patchAByA.statusCode, 200);

        const patchAByB = await makeRequest(`/api/v1/test/sessions/${sessionA_Id}`, {
            question_id: qIdA,
            selected_option: "C",
            time_spent: 10
        }, "PATCH", tokenB);
        assert.strictEqual(patchAByB.statusCode, 403, "Student B updating Student A's session must return 403");
        console.log("✔ Test 7 PASS: Updating unauthorized test sessions rejected with HTTP 403");

        // =========================================================================
        // Test 8: Submit Test & Result Authorization (GET /test/sessions/:sessionId/result)
        // =========================================================================
        // Cross-submission attempt
        const submitAByB = await makeRequest("/api/v1/test/submit", { sessionId: sessionA_Id, answers: [] }, "POST", tokenB);
        assert.strictEqual(submitAByB.statusCode, 403, "Student B submitting Student A's session must return 403");

        // Legitimate submission by Student A
        const submitAByA = await makeRequest("/api/v1/test/submit", { sessionId: sessionA_Id, answers: [] }, "POST", tokenA);
        assert.strictEqual(submitAByA.statusCode, 200);

        // Result retrieval
        const resultAByA = await makeRequest(`/api/v1/test/sessions/${sessionA_Id}/result`, null, "GET", tokenA);
        assert.strictEqual(resultAByA.statusCode, 200);

        const resultAByB = await makeRequest(`/api/v1/test/sessions/${sessionA_Id}/result`, null, "GET", tokenB);
        assert.strictEqual(resultAByB.statusCode, 403, "Student B viewing Student A's result must return 403");
        assert.strictEqual(resultAByB.body.message, "Unauthorized access to this test session.");
        console.log("✔ Test 8 PASS: Viewing unauthorized test results rejected with HTTP 403");

        // =========================================================================
        // Test 9: Retake Flow Preserves Ownership
        // =========================================================================
        const retakeAByA = await makeRequest("/api/v1/test/start", { custom_test_id: customTestA_Id }, "POST", tokenA);
        assert.strictEqual(retakeAByA.statusCode, 200);
        const retakeSessionId = retakeAByA.body.sessionId;
        assert.notStrictEqual(retakeSessionId, sessionA_Id, "Retake must generate fresh session ID");

        const retakeSessionDoc = await TestSession.findById(retakeSessionId).lean();
        assert.strictEqual(retakeSessionDoc.student_id, studentA_Id, "Retake session must be owned by Student A");
        console.log("✔ Test 9 PASS: Retake flow generates a new session correctly owned by Student A");

        // =========================================================================
        // Cleanup Test Artifacts
        // =========================================================================
        await Promise.all([
            Auth.deleteMany({ _id: { $in: [userA._id, userB._id] } }),
            PlatformTest.deleteMany({ id: { $in: [customTestA_Id, customTestB_Id] } }),
            TestSession.deleteMany({ _id: { $in: [sessionA_Id, sessionB_Id, retakeSessionId] } })
        ]);

        console.log("\nALL NEET OWNERSHIP & ISOLATION SECURITY TESTS PASSED! 🎉");

    } catch (err) {
        console.error("\n❌ NEET OWNERSHIP TEST FAILED:", err);
        process.exitCode = 1;
    } finally {
        server.close();
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect().catch(() => {});
        }
        process.exit(process.exitCode || 0);
    }
});
