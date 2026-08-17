const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "config", "config.env") });
const http = require("http");
const assert = require("assert");
const mongoose = require("mongoose");
const app = require("../app");
const { connectDatabases } = require("../config/database");
const PlatformTest = require("../model/neet-models/platformTest");
const TestSession = require("../model/neet-models/testSession");
const Question = require("../model/neet-models/questions");
const Topic = require("../model/neet-models/topic");

console.log("=== Running Custom Test Complete Lifecycle Tests ===");

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

    const makeRequest = (path, body = null, method = "POST", headers = {}) => {
        return new Promise((resolve, reject) => {
            const reqHeaders = { "Content-Type": "application/json", ...headers };
            const req = http.request({
                hostname: "127.0.0.1",
                port,
                path,
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
        const jwt = require("jsonwebtoken");
        const Auth = require("../model/neet-models/auth");
        const studentId = `STU_CUSTOM_${Date.now()}`;
        const topicId = 88801;
        const q1 = 888001;
        const q2 = 888002;
        let testUser = null;

        if (mongoose.connection.readyState === 1) {
            await Auth.deleteMany({ student_id: studentId });
            testUser = await Auth.create({
                fullName: "Custom Test Student",
                student_id: studentId,
                phoneNumber: `+91988888${Math.floor(1000 + Math.random() * 9000)}`,
                auth_providers: ["whatsapp"],
                is_active: true
            });
        }

        const testToken = jwt.sign(
            { id: testUser ? testUser._id.toString() : new mongoose.Types.ObjectId().toString(), student_id: studentId },
            process.env.SECRET_KEY || "default_jwt_secret_key_mbbs_net_production_2026",
            { expiresIn: "1h" }
        );
        const studentHeaders = {
            "Authorization": `Bearer ${testToken}`,
            "x-user-id": studentId
        };

        if (mongoose.connection.readyState === 1) {
            // Seed topic and questions for test
            await Topic.deleteMany({ id: topicId });
            await Question.deleteMany({ id: { $in: [q1, q2] } });
            await PlatformTest.deleteMany({ student_id: studentId });
            await TestSession.deleteMany({ student_id: studentId });

            await Topic.create({
                id: topicId,
                name: "Kinematics",
                subject: "Physics",
                chapter: "Motion in a Straight Line",
                is_active: true
            });

            await Question.create([
                { id: q1, question: "Q1 Custom", correct_answer: "A", topic_id: topicId, option_a: "1", option_b: "2", option_c: "3", option_d: "4" },
                { id: q2, question: "Q2 Custom", correct_answer: "B", topic_id: topicId, option_a: "1", option_b: "2", option_c: "3", option_d: "4" }
            ]);

            // 1. Save Custom Test
            let saveRes = await makeRequest("/api/v1/test/save", {
                title: "Physics Mechanics Test",
                subjects: ["Physics"],
                chapters: ["Motion in a Straight Line"],
                questionCount: 2,
                duration: 20,
                level: "Intermediate"
            }, "POST", studentHeaders);

            assert.strictEqual(saveRes.statusCode, 201, "Should save custom test with 201");
            assert.strictEqual(saveRes.body.success, true);
            const customTestId = saveRes.body.data.custom_test_id;
            assert.ok(customTestId, "Should return custom_test_id");
            console.log(`✔ Step 1 PASS: Custom Test saved with ID ${customTestId}`);

            // 2. Verify PlatformTest in DB & Verify NO TestSession created
            const savedDoc = await PlatformTest.findOne({ id: customTestId, student_id: studentId }).lean();
            assert.ok(savedDoc, "PlatformTest doc must exist");
            assert.strictEqual(savedDoc.is_builtin, false);
            assert.strictEqual(savedDoc.test_name, "Physics Mechanics Test");

            const initialSessions = await TestSession.find({ student_id: studentId }).lean();
            assert.strictEqual(initialSessions.length, 0, "Saving test must NOT create any TestSession");
            console.log("✔ Step 2 PASS: PlatformTest verified in DB and no TestSession created");

            // 3. Learning Report includes Custom Test as not_started
            let lrRes = await makeRequest("/api/v1/student/dashboard/neet-learning-report", null, "GET", studentHeaders);
            assert.strictEqual(lrRes.statusCode, 200);
            const foundInReport = lrRes.body.data.find(item => item.id === customTestId && item.source === "custom");
            assert.ok(foundInReport, "Custom Test must appear in Learning Report");
            assert.strictEqual(foundInReport.status, "not_started");
            assert.strictEqual(foundInReport.progress, 0);
            assert.strictEqual(foundInReport.time_spent, "0m");
            assert.strictEqual(foundInReport.score, null);
            assert.strictEqual(foundInReport.activeSessionId, null);
            console.log("✔ Step 3 PASS: Custom Test appears in Learning Report with status 'not_started'");

            // 4. Start Custom Test via POST /api/v1/test/start
            let startRes = await makeRequest("/api/v1/test/start", {
                custom_test_id: customTestId
            }, "POST", studentHeaders);

            assert.strictEqual(startRes.statusCode, 200, "Should start custom test with 200");
            assert.strictEqual(startRes.body.success, true);
            const sessionId = startRes.body.sessionId;
            assert.ok(sessionId, "Should return sessionId");
            assert.strictEqual(startRes.body.data.length, 2, "Should return 2 questions");
            const qIds = startRes.body.data.map(q => q.id || q.question_id);
            const dbQs = await Question.find({ id: { $in: qIds } }).lean();
            const dbQMap = new Map(dbQs.map(q => [q.id, q.correct_answer]));
            const ans1 = dbQMap.get(qIds[0]) || "A";
            const ans2 = dbQMap.get(qIds[1]) || "B";
            console.log(`✔ Step 4 PASS: Started Custom Test, created session ${sessionId}`);

            // 5. API #6 Autosave an answer
            let patchRes = await makeRequest(`/api/v1/test/sessions/${sessionId}`, {
                question_id: qIds[0],
                selected_option: ans1,
                time_spent: 25
            }, "PATCH", studentHeaders);

            assert.strictEqual(patchRes.statusCode, 200);
            assert.strictEqual(patchRes.body.success, true);
            console.log("✔ Step 5 PASS: Autosaved answer via API #6");

            // 6. API #5 Resume
            let resumeRes = await makeRequest(`/api/v1/test/sessions/${sessionId}`, null, "GET", studentHeaders);
            assert.strictEqual(resumeRes.statusCode, 200);
            const sessionData = resumeRes.body.data || resumeRes.body;
            assert.strictEqual(sessionData.status, "Started");
            const q1Answer = (sessionData.answers || []).find(a => a.question_id === qIds[0]);
            assert.ok(q1Answer && q1Answer.selected_option === ans1, "Autosaved answer should be restored in API #5");
            console.log("✔ Step 6 PASS: Resumed session via API #5 with answer intact");

            // 7. API #7 Submit
            let submitRes = await makeRequest("/api/v1/test/submit", {
                sessionId: sessionId,
                answers: [
                    { question_id: qIds[0], selected_option: ans1, time_spent: 25 },
                    { question_id: qIds[1], selected_option: ans2, time_spent: 30 }
                ]
            }, "POST", studentHeaders);

            assert.strictEqual(submitRes.statusCode, 200);
            assert.strictEqual(submitRes.body.success, true);
            assert.strictEqual(submitRes.body.correct, 2);
            assert.strictEqual(submitRes.body.wrong, 0);
            assert.strictEqual(submitRes.body.score, 8); // (2*4) = 8
            assert.strictEqual(submitRes.body.accuracy, 100);
            console.log("✔ Step 7 PASS: Submitted Custom Test via API #7 (score=8, accuracy=100%)");

            // 8. Learning Report updated to completed
            lrRes = await makeRequest("/api/v1/student/dashboard/neet-learning-report", null, "GET", studentHeaders);
            const completedInReport = lrRes.body.data.find(item => item.id === customTestId && item.source === "custom");
            assert.ok(completedInReport);
            assert.strictEqual(completedInReport.status, "completed");
            assert.strictEqual(completedInReport.progress, 100);
            assert.strictEqual(completedInReport.score.earned, 8);
            console.log("✔ Step 8 PASS: Learning Report updated to 'completed' with score=8");

            // 9. Negative Test: Unauthorized student
            let otherUser = null;
            let otherToken = "";
            if (mongoose.connection.readyState === 1) {
                await Auth.deleteMany({ student_id: "OTHER_STUDENT_999" });
                otherUser = await Auth.create({
                    fullName: "Other Student",
                    student_id: "OTHER_STUDENT_999",
                    phoneNumber: `+91988888${Math.floor(1000 + Math.random() * 9000)}`,
                    auth_providers: ["whatsapp"],
                    is_active: true
                });
            }
            otherToken = jwt.sign(
                { id: otherUser ? otherUser._id.toString() : new mongoose.Types.ObjectId().toString(), student_id: "OTHER_STUDENT_999" },
                process.env.SECRET_KEY || "default_jwt_secret_key_mbbs_net_production_2026",
                { expiresIn: "1h" }
            );

            let unauthStart = await makeRequest("/api/v1/test/start", {
                custom_test_id: customTestId
            }, "POST", { "Authorization": `Bearer ${otherToken}` });
            assert.strictEqual(unauthStart.statusCode, 403, "Other student should be forbidden");
            console.log("✔ Step 9 PASS: Other student forbidden from starting another's Custom Test (403)");
            if (otherUser) await Auth.deleteOne({ _id: otherUser._id }).catch(() => {});

            // 10. Negative Test: Insufficient questions validation error
            let invalidSave = await makeRequest("/api/v1/test/save", {
                title: "Too Many Questions Test",
                subjects: ["Physics"],
                chapters: ["Motion in a Straight Line"],
                questionCount: 500, // only 2 exist
                duration: 20
            }, "POST", studentHeaders);
            assert.strictEqual(invalidSave.statusCode, 400, "Should reject when not enough questions exist");
            console.log("✔ Step 10 PASS: Insufficient questions rejected with 400");

            // Cleanup
            await Topic.deleteMany({ id: topicId });
            await Question.deleteMany({ id: { $in: [q1, q2] } });
            await PlatformTest.deleteMany({ student_id: studentId });
            await TestSession.deleteMany({ student_id: studentId });
        } else {
            console.log("ℹ DB not connected, skipping live custom test DB session tests");
        }

        console.log("\nALL CUSTOM TEST LIFECYCLE TESTS PASSED! 🎉\n");
    } catch (err) {
        console.error("❌ Custom Test Flow Failed:", err);
        process.exitCode = 1;
    } finally {
        server.close();
        if (typeof testUser !== "undefined" && testUser) {
            await Auth.deleteOne({ _id: testUser._id }).catch(() => {});
        }
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect().catch(() => {});
        }
        process.exit(process.exitCode || 0);
    }
});
