const express = require("express");
const testQuestionController = require("../../controllers/neet-controller/testQuestion.controller");
const { protect } = require("../../utilities/auth");

const testQuestionRouter = express.Router();

testQuestionRouter.use("/test", protect);

testQuestionRouter.get("/test/history", testQuestionController.getTestHistory);
testQuestionRouter.get("/test/sessions/:sessionId/result", testQuestionController.getTestResult);
testQuestionRouter.get("/test/sessions/:sessionId", testQuestionController.getTestSession);
testQuestionRouter.patch("/test/sessions/:sessionId", testQuestionController.updateSessionAnswer);

// Step 1: Get all available subjects.
testQuestionRouter.get(
    "/test/subjects",
    testQuestionController.getSubjects
);

// Step 2: Get chapters for the selected subjects.
testQuestionRouter.post(
    "/test/chapters",
    testQuestionController.getChapters
);

// Step 3: Get topics for the selected subjects and chapters.
testQuestionRouter.post(
    "/test/topics",
    testQuestionController.getTopics
);

// Step 4: Save Custom Test Definition (without starting a session).
testQuestionRouter.post(
    "/test/save",
    testQuestionController.saveCustomTest
);

testQuestionRouter.post(
    "/test/custom/save",
    testQuestionController.saveCustomTest
);

testQuestionRouter.post(
    "/test/start",
    testQuestionController.startQuickTest
);

// Step 5: Submit answers and complete the test session.
testQuestionRouter.post(
    "/test/submit",
    testQuestionController.submitTest
);

module.exports = testQuestionRouter;
