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
const UcatTestSession = require("../model/ucat-model/ucatTestSession");

console.log("=== Running UCAT Custom-Test & Session Ownership Security Tests ===");

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
            console.log("ℹ Databases not ready; skipping live UCAT assertions.");
            server.close();
            return;
        }

        const studentA_Id = `STU_UCAT_A_${Date.now()}`;
        const studentB_Id = `STU_UCAT_B_${Date.now()}`;

        // 1. Create Mock User A in Auth collection
        const userA = await Auth.create({
            fullName: "UCAT Student Alpha",
            student_id: studentA_Id,
            phoneNumber: `+91933333${Math.floor(1000 + Math.random() * 9000)}`,
            auth_providers: ["whatsapp"],
            is_active: true
        });

        // 2. Create Mock User B in Auth collection
        const userB = await Auth.create({
            fullName: "UCAT Student Beta",
            student_id: studentB_Id,
            phoneNumber: `+91944444${Math.floor(1000 + Math.random() * 9000)}`,
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
        // Test 1: Built-in UCAT tests visible to both Student A and Student B
        // =========================================================================
        const builtinResA = await makeRequest("/api/v1/ucat/test/tests/builtin", null, "GET", tokenA);
        assert.strictEqual(builtinResA.statusCode, 200);
        assert.ok(builtinResA.body.data.length >= 6);

        const builtinResB = await makeRequest("/api/v1/ucat/test/tests/builtin", null, "GET", tokenB);
        assert.strictEqual(builtinResB.statusCode, 200);
        assert.ok(builtinResB.body.data.length >= 6);
        console.log("✔ Test 1 PASS: Built-in UCAT tests accessible to both Student A and Student B");

        // =========================================================================
        // Test 2: Student A starts custom practice test
        // =========================================================================
        const startTestARes = await makeRequest("/api/v1/ucat/test/start", {
            subjects: ["verbal_reasoning"],
            questionCount: 5,
            duration: 15
        }, "POST", tokenA);

        assert.strictEqual(startTestARes.statusCode, 201);
        const sessionA_Id = startTestARes.body.data.sessionId;
        const qIdA = startTestARes.body.data.questions[0].question_id;
        assert.ok(sessionA_Id);

        // Verify session doc ownership in MongoDB
        const sessionDocA = await UcatTestSession.findOne({ sessionId: sessionA_Id }).lean();
        assert.strictEqual(sessionDocA.student_id, studentA_Id, "Session A must be owned by Student A in DB");
        console.log(`✔ Test 2 PASS: Student A started custom practice test (Session: ${sessionA_Id})`);

        // =========================================================================
        // Test 3: Student B starts custom practice test
        // =========================================================================
        const startTestBRes = await makeRequest("/api/v1/ucat/test/start", {
            subjects: ["decision_making"],
            questionCount: 5,
            duration: 15
        }, "POST", tokenB);

        assert.strictEqual(startTestBRes.statusCode, 201);
        const sessionB_Id = startTestBRes.body.data.sessionId;
        const qIdB = startTestBRes.body.data.questions[0].question_id;
        assert.ok(sessionB_Id);

        const sessionDocB = await UcatTestSession.findOne({ sessionId: sessionB_Id }).lean();
        assert.strictEqual(sessionDocB.student_id, studentB_Id, "Session B must be owned by Student B in DB");
        console.log(`✔ Test 3 PASS: Student B started custom practice test (Session: ${sessionB_Id})`);

        // =========================================================================
        // Test 4: Session Read Ownership (GET /api/v1/ucat/test/sessions/:sessionId)
        // =========================================================================
        const getSessionAByA = await makeRequest(`/api/v1/ucat/test/sessions/${sessionA_Id}`, null, "GET", tokenA);
        assert.strictEqual(getSessionAByA.statusCode, 200);

        const getSessionAByB = await makeRequest(`/api/v1/ucat/test/sessions/${sessionA_Id}`, null, "GET", tokenB);
        assert.strictEqual(getSessionAByB.statusCode, 403, "Student B reading Student A's session must return 403");
        assert.strictEqual(getSessionAByB.body.message, "Unauthorized access to this test session.");

        const getSessionBByA = await makeRequest(`/api/v1/ucat/test/sessions/${sessionB_Id}`, null, "GET", tokenA);
        assert.strictEqual(getSessionBByA.statusCode, 403, "Student A reading Student B's session must return 403");
        console.log("✔ Test 4 PASS: Reading unauthorized UCAT test sessions rejected with HTTP 403");

        // =========================================================================
        // Test 5: Session Autosave / Answer Update Ownership (PATCH /api/v1/ucat/test/sessions/:sessionId)
        // =========================================================================
        const patchAByA = await makeRequest(`/api/v1/ucat/test/sessions/${sessionA_Id}`, {
            question_id: qIdA,
            selected_option: "B",
            time_spent: 10
        }, "PATCH", tokenA);
        assert.strictEqual(patchAByA.statusCode, 200);

        const patchAByB = await makeRequest(`/api/v1/ucat/test/sessions/${sessionA_Id}`, {
            question_id: qIdA,
            selected_option: "C",
            time_spent: 10
        }, "PATCH", tokenB);
        assert.strictEqual(patchAByB.statusCode, 403, "Student B updating Student A's session must return 403");
        assert.strictEqual(patchAByB.body.message, "Unauthorized access to this test session.");
        console.log("✔ Test 5 PASS: Updating unauthorized UCAT test sessions rejected with HTTP 403");

        // =========================================================================
        // Test 6: Submit Test Ownership (POST /api/v1/ucat/test/submit)
        // =========================================================================
        const submitAByB = await makeRequest("/api/v1/ucat/test/submit", { sessionId: sessionA_Id, answers: [] }, "POST", tokenB);
        assert.strictEqual(submitAByB.statusCode, 403, "Student B submitting Student A's session must return 403");
        assert.strictEqual(submitAByB.body.message, "Unauthorized access to this test session.");

        const submitAByA = await makeRequest("/api/v1/ucat/test/submit", { sessionId: sessionA_Id, answers: [] }, "POST", tokenA);
        assert.strictEqual(submitAByA.statusCode, 200);
        console.log("✔ Test 6 PASS: Submitting unauthorized UCAT test sessions rejected with HTTP 403");

        // =========================================================================
        // Test 7: Result Read Ownership (GET /api/v1/ucat/test/sessions/:sessionId/result)
        // =========================================================================
        const resultAByA = await makeRequest(`/api/v1/ucat/test/sessions/${sessionA_Id}/result`, null, "GET", tokenA);
        assert.strictEqual(resultAByA.statusCode, 200);

        const resultAByB = await makeRequest(`/api/v1/ucat/test/sessions/${sessionA_Id}/result`, null, "GET", tokenB);
        assert.strictEqual(resultAByB.statusCode, 403, "Student B reading Student A's result must return 403");
        assert.strictEqual(resultAByB.body.message, "Unauthorized access to this test session.");
        console.log("✔ Test 7 PASS: Reading unauthorized UCAT test results rejected with HTTP 403");

        // =========================================================================
        // Test 8: Retake Ownership
        // =========================================================================
        const retakeA = await makeRequest("/api/v1/ucat/test/start", {
            subjects: ["verbal_reasoning"],
            questionCount: 5,
            duration: 15
        }, "POST", tokenA);
        assert.strictEqual(retakeA.statusCode, 201);
        const retakeSessionA_Id = retakeA.body.data.sessionId;
        assert.notStrictEqual(retakeSessionA_Id, sessionA_Id, "Retake must create new session ID");

        const retakeSessionDoc = await UcatTestSession.findOne({ sessionId: retakeSessionA_Id }).lean();
        assert.strictEqual(retakeSessionDoc.student_id, studentA_Id, "Retake session must belong to Student A");

        const readRetakeByB = await makeRequest(`/api/v1/ucat/test/sessions/${retakeSessionA_Id}`, null, "GET", tokenB);
        assert.strictEqual(readRetakeByB.statusCode, 403, "Student B accessing Student A's retake must return 403");
        console.log("✔ Test 8 PASS: Retake flow generates a new session owned by Student A and blocks Student B");

        // =========================================================================
        // Test 9: Learning Report Isolation (GET /api/v1/student/dashboard/ucat-learning-report)
        // =========================================================================
        const reportA = await makeRequest("/api/v1/student/dashboard/ucat-learning-report", null, "GET", tokenA);
        assert.strictEqual(reportA.statusCode, 200);
        const reportASessionIds = reportA.body.data.map(d => d.sessionId).filter(Boolean);
        assert.ok(reportASessionIds.includes(sessionA_Id), "Student A report must include Session A");
        assert.ok(!reportASessionIds.includes(sessionB_Id), "Student A report must NOT include Session B");

        const reportB = await makeRequest("/api/v1/student/dashboard/ucat-learning-report", null, "GET", tokenB);
        assert.strictEqual(reportB.statusCode, 200);
        const reportBSessionIds = reportB.body.data.map(d => d.sessionId).filter(Boolean);
        assert.ok(reportBSessionIds.includes(sessionB_Id), "Student B report must include Session B");
        assert.ok(!reportBSessionIds.includes(sessionA_Id), "Student B report must NOT include Session A");
        console.log("✔ Test 9 PASS: Learning report strictly isolated between Student A and Student B");

        // =========================================================================
        // Cleanup Test Artifacts
        // =========================================================================
        await Promise.all([
            Auth.deleteMany({ _id: { $in: [userA._id, userB._id] } }),
            UcatTestSession.deleteMany({ sessionId: { $in: [sessionA_Id, sessionB_Id, retakeSessionA_Id] } })
        ]);

        console.log("\nALL UCAT OWNERSHIP & ISOLATION SECURITY TESTS PASSED! 🎉");

    } catch (err) {
        console.error("\n❌ UCAT OWNERSHIP TEST FAILED:", err);
        process.exitCode = 1;
    } finally {
        server.close();
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect().catch(() => {});
        }
        if (ucatConnection.readyState !== 0) {
            await ucatConnection.close().catch(() => {});
        }
        process.exit(process.exitCode || 0);
    }
});
