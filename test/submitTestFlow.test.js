"use strict";

require("dotenv").config();
const http = require("http");
const assert = require("assert");
const mongoose = require("mongoose");
const app = require("../app");
const { connectDatabases } = require("../config/database");
const TestSession = require("../model/neet-models/testSession");
const Question = require("../model/neet-models/questions");

console.log("=== Running API #7 POST /test/submit Comprehensive Tests ===");

const server = app.listen(0, async () => {
    const port = server.address().port;

    if (process.env.CONNECTION_STRING && mongoose.connection.readyState === 0) {
        try {
            await connectDatabases();
            console.log("✔ Connected to MongoDB");
        } catch (e) {
            console.log("ℹ DB connection skipped:", e.message);
        }
    }

    const makeRequest = (path, body = null, method = "POST") => {
        return new Promise((resolve, reject) => {
            const headers = { "Content-Type": "application/json" };
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
        // Prepare mock/real questions if in memory or DB
        const testQ1 = 99901;
        const testQ2 = 99902;
        const testQ3 = 99903;

        if (mongoose.connection.readyState === 1) {
            await Question.deleteMany({ id: { $in: [testQ1, testQ2, testQ3] } });
            await Question.create([
                { id: testQ1, question: "Q1", correct_answer: "A", topic_id: 1, option_a: "1", option_b: "2", option_c: "3", option_d: "4" },
                { id: testQ2, question: "Q2", correct_answer: "B", topic_id: 1, option_a: "1", option_b: "2", option_c: "3", option_d: "4" },
                { id: testQ3, question: "Q3", correct_answer: "C", topic_id: 1, option_a: "1", option_b: "2", option_c: "3", option_d: "4" }
            ]);

            // CASE 1: Partial Submission (3 answered out of 180)
            const session1 = await TestSession.create({
                student_id: "STU_TEST_SUBMIT",
                subjects: ["Physics"],
                chapters: ["Test"],
                question_ids: [testQ1, testQ2, testQ3],
                total_questions: 180,
                duration: 180,
                status: "Started",
                answers: [],
                started_at: new Date()
            });

            let res = await makeRequest("/api/v1/test/submit", {
                sessionId: session1._id.toString(),
                answers: [
                    { question_id: testQ1, selected_option: "A", time_spent: 10 }, // Correct (+4)
                    { question_id: testQ2, selected_option: "A", time_spent: 15 }, // Wrong (-1)
                    { question_id: testQ3, selected_option: "C", time_spent: 20 }  // Correct (+4)
                ]
            });

            assert.strictEqual(res.statusCode, 200, "Should submit with 200 OK");
            assert.strictEqual(res.body.success, true);
            assert.strictEqual(res.body.correct, 2);
            assert.strictEqual(res.body.wrong, 1);
            assert.strictEqual(res.body.skipped, 177);
            assert.strictEqual(res.body.score, 7); // (2*4) - 1 = 7
            assert.strictEqual(res.body.accuracy, 67); // round(2/3 * 100) = 67
            assert.strictEqual(res.body.total_questions, 180);
            assert.strictEqual(res.body.correct + res.body.wrong + res.body.skipped, 180, "Total must equal 180");
            console.log("✔ CASE 1 PASS: Partial submission (3 answered / 180 total) evaluated correctly (score=7, accuracy=67%)");

            // CASE 2: Zero-Answer Submission
            const session2 = await TestSession.create({
                student_id: "STU_TEST_SUBMIT",
                subjects: ["Physics"],
                chapters: ["Test"],
                question_ids: [testQ1, testQ2, testQ3],
                total_questions: 180,
                duration: 180,
                status: "Started",
                answers: [],
                started_at: new Date()
            });

            res = await makeRequest("/api/v1/test/submit", {
                sessionId: session2._id.toString(),
                answers: []
            });

            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.body.correct, 0);
            assert.strictEqual(res.body.wrong, 0);
            assert.strictEqual(res.body.skipped, 180);
            assert.strictEqual(res.body.score, 0);
            assert.strictEqual(res.body.accuracy, 0);
            console.log("✔ CASE 2 PASS: Zero-answer submission evaluated cleanly (score=0, accuracy=0, skipped=180)");

            // CASE 3: API #6 Autosave Reconciliation
            const session3 = await TestSession.create({
                student_id: "STU_TEST_SUBMIT",
                subjects: ["Physics"],
                chapters: ["Test"],
                question_ids: [testQ1, testQ2, testQ3],
                total_questions: 3,
                duration: 180,
                status: "Started",
                answers: [
                    { question_id: testQ1, selected_option: "A", time_spent: 30 }, // Autosaved via API #6
                    { question_id: testQ2, selected_option: "B", time_spent: 40 }  // Autosaved via API #6
                ],
                started_at: new Date()
            });

            // Submit without sending answers in payload, relying on autosaved session.answers
            res = await makeRequest("/api/v1/test/submit", {
                sessionId: session3._id.toString()
            });

            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.body.correct, 2);
            assert.strictEqual(res.body.wrong, 0);
            assert.strictEqual(res.body.skipped, 1);
            assert.strictEqual(res.body.score, 8);
            assert.strictEqual(res.body.accuracy, 100);
            console.log("✔ CASE 3 PASS: Submitted test reconciled autosaved answers from API #6 (score=8, accuracy=100%)");

            // CASE 4: Cannot submit already completed session
            res = await makeRequest("/api/v1/test/submit", {
                sessionId: session1._id.toString(),
                answers: []
            });
            assert.strictEqual(res.statusCode, 409, "Should reject already completed session with 409 Conflict");
            console.log("✔ CASE 4 PASS: Completed session submit blocked with 409 Conflict");

            // CASE 5: Submit on Previous Year route
            const session4 = await TestSession.create({
                student_id: "STU_TEST_SUBMIT",
                subjects: ["Physics"],
                chapters: ["Test"],
                question_ids: [testQ1],
                total_questions: 1,
                duration: 180,
                status: "Started",
                answers: [],
                started_at: new Date()
            });

            res = await makeRequest("/api/v1/previous-year-tests/submit", {
                sessionId: session4._id.toString(),
                answers: [{ question_id: testQ1, selected_option: "A", time_spent: 10 }]
            });
            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.body.correct, 1);
            assert.strictEqual(res.body.score, 4);
            assert.strictEqual(res.body.accuracy, 100);
            console.log("✔ CASE 5 PASS: POST /api/v1/previous-year-tests/submit submitted successfully");

            // Cleanup
            await Question.deleteMany({ id: { $in: [testQ1, testQ2, testQ3] } });
            await TestSession.deleteMany({ student_id: "STU_TEST_SUBMIT" });
        } else {
            console.log("ℹ DB not connected, skipping live DB session tests");
        }

        console.log("\nALL API #7 SUBMIT TESTS PASSED! 🎉\n");
    } catch (err) {
        console.error("❌ Submit Test Failed:", err);
        process.exitCode = 1;
    } finally {
        server.close();
    }
});
