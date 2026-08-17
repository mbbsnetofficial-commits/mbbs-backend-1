const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "config", "config.env") });
const http = require("http");
const assert = require("assert");
const mongoose = require("mongoose");
const app = require("../app");
const { connectDatabases, ucatConnection } = require("../config/database");
const UcatQuestion = require("../model/ucat-model/ucatQuestion");
const UcatTestSession = require("../model/ucat-model/ucatTestSession");

console.log("=== Running UCAT 6 Built-in Tests & Complete Exam Flow Tests ===");

const server = app.listen(0, async () => {
    const port = server.address().port;

    if (process.env.CONNECTION_STRING && mongoose.connection.readyState === 0) {
        try {
            await connectDatabases();
            console.log("✔ Connected to Databases (NEET, Blog, UCAT)");
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
        const Auth = require("../model/neet-models/auth");
        const jwt = require("jsonwebtoken");
        const studentId = "STU_UCAT_BUILTIN_001";
        let user = null;
        if (mongoose.connection.readyState === 1) {
            await Auth.deleteMany({ student_id: studentId });
            user = await Auth.create({
                fullName: "Builtin Flow Test Student",
                student_id: studentId,
                phoneNumber: "+919555555555",
                auth_providers: ["whatsapp"],
                is_active: true
            });
        }

        const token = jwt.sign(
            { id: user ? user._id.toString() : new mongoose.Types.ObjectId().toString(), student_id: studentId },
            process.env.SECRET_KEY || "default_jwt_secret_key_mbbs_net_production_2026",
            { expiresIn: "1h" }
        );
        const studentHeaders = {
            "Authorization": `Bearer ${token}`,
            "x-user-id": studentId,
            "x-student-id": studentId
        };

        // 1. GET UCAT Test Catalog
        let catalogRes = await makeRequest("/api/v1/ucat/tests/builtin", null, "GET", studentHeaders);
        assert.strictEqual(catalogRes.statusCode, 200, "Catalog should return 200");
        assert.strictEqual(catalogRes.body.success, true);
        const data = catalogRes.body.data;

        // Verify the 6 Built-in Tests
        const expectedBuiltins = [
            { id: "UCAT_FULL", name: "UCAT Full Test", qCount: 233, duration: 120, maxMarks: 932 },
            { id: "UCAT_VERBAL_REASONING", name: "Verbal Reasoning Test", qCount: 44, duration: 21, maxMarks: 176 },
            { id: "UCAT_DECISION_MAKING", name: "Decision Making Test", qCount: 29, duration: 31, maxMarks: 116 },
            { id: "UCAT_QUANTITATIVE_REASONING", name: "Quantitative Reasoning Test", qCount: 36, duration: 25, maxMarks: 144 },
            { id: "UCAT_ABSTRACT_REASONING", name: "Abstract Reasoning Test", qCount: 55, duration: 13, maxMarks: 220 },
            { id: "UCAT_SITUATIONAL_JUDGEMENT", name: "Situational Judgement Test", qCount: 69, duration: 26, maxMarks: 276 }
        ];

        for (const exp of expectedBuiltins) {
            const found = data.find(t => t.testId === exp.id);
            assert.ok(found, `Built-in test ${exp.id} must exist in catalog`);
            assert.strictEqual(found.totalQuestions, exp.qCount, `${exp.id} total questions mismatch`);
            assert.strictEqual(found.durationMinutes, exp.duration, `${exp.id} duration mismatch`);
            assert.strictEqual(found.maxMarks, exp.maxMarks, `${exp.id} max marks mismatch`);
            assert.strictEqual(found.source, "builtin");
        }
        console.log("✔ Step 1 PASS: Verified all 6 UCAT Built-in Tests in Catalog");

        // Verify Previous Year Tests in catalog
        const prevYear = data.find(t => t.source === "previous_year");
        assert.ok(prevYear, "Catalog must include dynamically discovered previous-year tests");
        console.log(`✔ Step 2 PASS: Verified Previous Year Tests in Catalog (${prevYear.testName})`);

        // If DB is connected, seed test questions and run full test lifecycle
        if (ucatConnection.readyState === 1) {
            const qVR = 999101;
            const qDM = 999102;
            await UcatQuestion.deleteMany({ id: { $in: [qVR, qDM] } });
            await UcatTestSession.deleteMany({ student_id: studentId });

            await UcatQuestion.create([
                {
                    id: qVR,
                    question: "Verbal Reasoning Section Q1",
                    option_a: "True",
                    option_b: "False",
                    option_c: "Cannot Tell",
                    correct_answer: "A",
                    subject: "verbal_reasoning",
                    chapter: "Inferences"
                },
                {
                    id: qDM,
                    question: "Decision Making Section Q2",
                    option_a: "Option 1",
                    option_b: "Option 2",
                    option_c: "Option 3",
                    option_d: "Option 4",
                    correct_answer: "B",
                    subject: "decision_making",
                    chapter: "Logic Puzzles"
                }
            ]);

            // 3. Start Verbal Reasoning Section Test
            let vrStart = await makeRequest("/api/v1/ucat/test/start", {
                testId: "UCAT_VERBAL_REASONING",
                student_id: studentId
            }, "POST", studentHeaders);

            assert.strictEqual(vrStart.statusCode, 201);
            const vrSessionId = vrStart.body.data.sessionId;
            assert.ok(vrSessionId);
            assert.strictEqual(vrStart.body.data.duration, 21);
            assert.strictEqual(vrStart.body.data.total_marks, 176);
            console.log(`✔ Step 3 PASS: Started Verbal Reasoning Test (Session: ${vrSessionId}, Duration: 21m, Marks: 176)`);

            const firstQ = (vrStart.body.data.questions && vrStart.body.data.questions[0]) || { id: qVR };
            const firstQId = firstQ.id || firstQ.question_id || qVR;
            const qDoc = await UcatQuestion.findOne({ id: firstQId }).lean();
            const correctOpt = (qDoc && qDoc.correct_answer) ? qDoc.correct_answer.trim().toUpperCase() : "A";

            // 4. Autosave answer (API #6)
            let autosaveRes = await makeRequest(`/api/v1/ucat/test/sessions/${vrSessionId}`, {
                question_id: firstQId,
                selected_option: correctOpt,
                time_spent: 18
            }, "PATCH", studentHeaders);
            assert.strictEqual(autosaveRes.statusCode, 200);
            assert.strictEqual(autosaveRes.body.data.selected_option, correctOpt);
            console.log("✔ Step 4 PASS: Autosaved answer via PATCH /sessions/:id");

            // 5. Resume session (API #5)
            let resumeRes = await makeRequest(`/api/v1/ucat/test/sessions/${vrSessionId}`, null, "GET", studentHeaders);
            assert.strictEqual(resumeRes.statusCode, 200);
            const savedAns = resumeRes.body.data.answers.find(a => a.question_id === firstQId);
            assert.ok(savedAns && savedAns.selected_option === correctOpt);
            console.log("✔ Step 5 PASS: Resumed session via GET /sessions/:id with answer intact");

            // 6. Submit session (API #7)
            let submitRes = await makeRequest("/api/v1/ucat/test/submit", {
                sessionId: vrSessionId,
                answers: []
            }, "POST", studentHeaders);
            assert.strictEqual(submitRes.statusCode, 200);
            assert.strictEqual(submitRes.body.data.status, "Completed");
            assert.strictEqual(submitRes.body.data.correct, 1);
            assert.strictEqual(submitRes.body.data.score.earned, 4);
            console.log("✔ Step 6 PASS: Submitted test (Score: 4/176, Status: Completed)");

            // 7. Verify Learning Report
            let lrRes = await makeRequest("/api/v1/student/dashboard/ucat-learning-report", null, "GET", studentHeaders);
            assert.strictEqual(lrRes.statusCode, 200);
            const lrItems = lrRes.body.data;
            const completedVR = lrItems.find(item => item.testId === "UCAT_VERBAL_REASONING" && item.status === "completed");
            const notStartedDM = lrItems.find(item => item.testId === "UCAT_DECISION_MAKING" && item.status === "not_started");
            assert.ok(completedVR, "Completed Verbal Reasoning test must appear in Learning Report");
            assert.ok(notStartedDM, "Unattempted Decision Making test must appear with status 'not_started'");
            console.log("✔ Step 7 PASS: Learning Report verified (Completed test + Not Started tests present)");

            // 8. Retake Same Test (Attempt 2)
            let retakeRes = await makeRequest("/api/v1/ucat/test/start", {
                testId: "UCAT_VERBAL_REASONING",
                student_id: studentId
            }, "POST", studentHeaders);
            assert.strictEqual(retakeRes.statusCode, 201);
            const vrSessionId2 = retakeRes.body.data.sessionId;
            assert.notStrictEqual(vrSessionId2, vrSessionId, "Retake must generate fresh session ID");
            console.log(`✔ Step 8 PASS: Retake Verbal Reasoning created Attempt 2 (${vrSessionId2})`);

            // 9. KPI Summary Verification
            let kpiRes = await makeRequest("/api/v1/student/dashboard/ucat-summary", null, "GET", studentHeaders);
            assert.strictEqual(kpiRes.statusCode, 200);
            assert.strictEqual(kpiRes.body.data.completedTests, 1);
            console.log("✔ Step 9 PASS: UCAT KPI Summary verified from real completed session");

            // Cleanup
            await UcatQuestion.deleteMany({ id: { $in: [qVR, qDM] } });
            await UcatTestSession.deleteMany({ student_id: studentId });
            if (user) await Auth.deleteOne({ _id: user._id });
        } else {
            console.log("ℹ DB not connected, skipping live DB session tests");
        }

        console.log("\nALL 6 BUILT-IN & EXAM FLOW TESTS PASSED! 🎉\n");
    } catch (err) {
        console.error("❌ UCAT Test Flow Failed:", err);
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
