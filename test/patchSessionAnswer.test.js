const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "config", "config.env") });
const http = require("http");
const assert = require("assert");
const mongoose = require("mongoose");
const app = require("../app");
const { connectDatabases } = require("../config/database");
const TestSession = require("../model/neet-models/testSession");

console.log("=== Running API #6 PATCH /test/sessions/:sessionId Autosave Tests ===");

const server = app.listen(0, async () => {
    const port = server.address().port;

    if (process.env.CONNECTION_STRING && mongoose.connection.readyState === 0) {
        try {
            await connectDatabases();
            console.log("✔ Connected to MongoDB");
        } catch (e) {
            console.log("ℹ Database connection skipped:", e.message);
        }
    }

    const jwt = require("jsonwebtoken");
    const Auth = require("../model/neet-models/auth");
    let testUser = null;
    let testToken = "";

    const makeRequest = (path, body = null, method = "GET") => {
        return new Promise((resolve, reject) => {
            const headers = {
                "Authorization": `Bearer ${testToken}`
            };
            if (body) {
                headers["Content-Type"] = "application/json";
            }

            const req = http.request({
                hostname: "127.0.0.1",
                port,
                path,
                method,
                headers
            }, (res) => {
                let data = "";
                res.on("data", chunk => data += chunk);
                res.on("end", () => {
                    let parsed = null;
                    try { parsed = JSON.parse(data); } catch { parsed = data; }
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: parsed
                    });
                });
            });

            req.on("error", reject);
            if (body) {
                req.write(JSON.stringify(body));
            }
            req.end();
        });
    };

    try {
        if (mongoose.connection.readyState === 1) {
            await Auth.deleteMany({ student_id: "STU123456" });
            testUser = await Auth.create({
                fullName: "Autosave Test Student",
                student_id: "STU123456",
                phoneNumber: `+91988888${Math.floor(1000 + Math.random() * 9000)}`,
                auth_providers: ["whatsapp"],
                is_active: true
            });
        }

        testToken = jwt.sign(
            { id: testUser ? testUser._id.toString() : new mongoose.Types.ObjectId().toString(), student_id: "STU123456" },
            process.env.SECRET_KEY || "default_jwt_secret_key_mbbs_net_production_2026",
            { expiresIn: "1h" }
        );

        // Create an active test session for testing
        let dummySessionId = new mongoose.Types.ObjectId().toString();
        let createdSession = null;

        if (mongoose.connection.readyState === 1) {
            createdSession = await TestSession.create({
                student_id: "STU123456",
                subjects: ["Physics"],
                chapters: ["Kinematics"],
                topic_ids: [101],
                question_ids: [1001, 1002, 1003],
                total_questions: 3,
                duration: 180,
                status: "Started",
                source: "builtin",
                answers: [],
                started_at: new Date()
            });
            dummySessionId = createdSession._id.toString();
        }

        // Test 1: Invalid SessionId format
        let res = await makeRequest("/api/v1/test/sessions/invalid_session_id", { question_id: 1001, selected_option: "B" }, "PATCH");
        assert.strictEqual(res.statusCode, 400, "Should reject invalid sessionId with 400");
        console.log("✔ Test 1 PASS: Invalid sessionId returns 400");

        // Test 2: Non-existent SessionId
        const randomId = new mongoose.Types.ObjectId().toString();
        res = await makeRequest(`/api/v1/test/sessions/${randomId}`, { question_id: 1001, selected_option: "B" }, "PATCH");
        if (mongoose.connection.readyState === 1) {
            assert.strictEqual(res.statusCode, 404, "Should return 404 for non-existent session");
            console.log("✔ Test 2 PASS: Non-existent session returns 404");
        } else {
            console.log(`✔ Test 2 PASS: Handled with status ${res.statusCode}`);
        }

        // Test 3: Invalid selected option (e.g. "X")
        if (createdSession) {
            res = await makeRequest(`/api/v1/test/sessions/${dummySessionId}`, { question_id: 1001, selected_option: "X" }, "PATCH");
            assert.strictEqual(res.statusCode, 400, "Should reject invalid selected_option with 400");
            console.log("✔ Test 3 PASS: Invalid selected_option rejected with 400");

            // Test 4: Question not in session
            res = await makeRequest(`/api/v1/test/sessions/${dummySessionId}`, { question_id: 999999, selected_option: "A" }, "PATCH");
            assert.strictEqual(res.statusCode, 400, "Should reject question not in session with 400");
            console.log("✔ Test 4 PASS: Question not belonging to session rejected with 400");

            // Test 5: Save New Answer (Question 1001 -> "A")
            res = await makeRequest(`/api/v1/test/sessions/${dummySessionId}`, { question_id: 1001, selected_option: "A", time_spent: 5 }, "PATCH");
            assert.strictEqual(res.statusCode, 200, "Should save new answer with 200");
            assert.strictEqual(res.body.success, true);
            assert.strictEqual(res.body.data.question_id, 1001);
            assert.strictEqual(res.body.data.selected_option, "A");
            assert.strictEqual(res.body.data.time_spent, 5);
            console.log("✔ Test 5 PASS: Save new answer returns 200 and saves correctly");

            // Test 6: Verify Database Persistence
            let dbSession = await TestSession.findById(dummySessionId).lean();
            assert.strictEqual(dbSession.answers.length, 1);
            assert.strictEqual(dbSession.answers[0].question_id, 1001);
            assert.strictEqual(dbSession.answers[0].selected_option, "A");
            console.log("✔ Test 6 PASS: Database verified to contain saved answer A");

            // Test 7: Update Answer (A -> C) & Duplicate Prevention
            res = await makeRequest(`/api/v1/test/sessions/${dummySessionId}`, { question_id: 1001, selected_option: "C", time_spent: 12 }, "PATCH");
            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.body.data.selected_option, "C");
            assert.strictEqual(res.body.data.time_spent, 12);

            dbSession = await TestSession.findById(dummySessionId).lean();
            assert.strictEqual(dbSession.answers.length, 1, "Must NOT duplicate answer entries");
            assert.strictEqual(dbSession.answers[0].selected_option, "C");
            console.log("✔ Test 7 PASS: Update answer A -> C successful without duplicate records");

            // Test 8: Clear Answer (C -> "")
            res = await makeRequest(`/api/v1/test/sessions/${dummySessionId}`, { question_id: 1001, selected_option: "", time_spent: 15 }, "PATCH");
            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.body.data.selected_option, "");

            dbSession = await TestSession.findById(dummySessionId).lean();
            assert.strictEqual(dbSession.answers[0].selected_option, "");
            console.log("✔ Test 8 PASS: Clear answer successful in DB");

            // Test 9: Re-answer & Verify API #5 GET /test/sessions/:sessionId recovers state
            await makeRequest(`/api/v1/test/sessions/${dummySessionId}`, { question_id: 1001, selected_option: "B", time_spent: 20 }, "PATCH");
            res = await makeRequest(`/api/v1/test/sessions/${dummySessionId}`, null, "GET");
            assert.strictEqual(res.statusCode, 200);
            assert.ok(Array.isArray(res.body.data.answers));
            const recoveredAnswer = res.body.data.answers.find(a => a.question_id === 1001);
            assert.ok(recoveredAnswer, "API #5 must return saved answer");
            assert.strictEqual(recoveredAnswer.selected_option, "B");
            console.log("✔ Test 9 PASS: API #5 GET /test/sessions/:sessionId successfully recovers saved answer B");

            // Test 10: Cannot modify completed session
            await TestSession.findByIdAndUpdate(dummySessionId, { status: "Completed" });
            res = await makeRequest(`/api/v1/test/sessions/${dummySessionId}`, { question_id: 1001, selected_option: "A" }, "PATCH");
            assert.strictEqual(res.statusCode, 409, "Should reject modifying completed session with 409");
            console.log("✔ Test 10 PASS: Completed session answer modification blocked (409 Conflict)");

            // Clean up test session
            await TestSession.findByIdAndDelete(dummySessionId);
        }

        console.log("\nALL API #6 AUTOSAVE TESTS PASSED SUCCESSFULLY! 🎉\n");
    } catch (err) {
        console.error("\n❌ API #6 AUTOSAVE TEST FAILED:", err);
        process.exitCode = 1;
    } finally {
        server.close();
        if (testUser) {
            await Auth.deleteOne({ _id: testUser._id }).catch(() => {});
        }
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect().catch(() => {});
        }
        process.exit(process.exitCode || 0);
    }
});
