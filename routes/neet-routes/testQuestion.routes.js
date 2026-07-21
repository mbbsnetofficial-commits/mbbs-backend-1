const express = require("express");
const testQuestionController = require("../../controllers/neet-controller/testQuestion.controller");
const { protect } = require("../../utilities/auth");

const testQuestionRouter = express.Router();

testQuestionRouter.get("/test/history", protect, testQuestionController.getTestHistory);
testQuestionRouter.get("/test/sessions/:sessionId/result", protect, testQuestionController.getTestResult);
testQuestionRouter.get("/test/sessions/:sessionId", protect, testQuestionController.getTestSession);

// Step 1: Get all available subjects.
testQuestionRouter.get(
    "/test/subjects",
    protect,
    testQuestionController.getSubjects
);

// Step 2: Get chapters for the selected subjects.
testQuestionRouter.post(
    "/test/chapters",
    protect,
    testQuestionController.getChapters
);

// Step 3: Get topics for the selected subjects and chapters.
testQuestionRouter.post(
    "/test/topics",
    protect,
    testQuestionController.getTopics
);

// Step 4: Generate questions and start a quick-test session.
testQuestionRouter.post(
    "/test/start",
    protect,
    testQuestionController.startQuickTest
);

// Step 5: Submit answers and complete the test session.
testQuestionRouter.post(
    "/test/submit",
    protect,
    testQuestionController.submitTest
);

module.exports = testQuestionRouter;
