"use strict";

const express = require("express");
const router = express.Router();
const adminController = require("../../controllers/ucat-controller/admin.controller");
const { protectAdmin } = require("../../utilities/adminAuth");

// ALL admin routes require a valid platform admin JWT (role: platform_admin)
// Mounted with adminLimiter in app.js
router.use(protectAdmin);

// Dashboard Analytics
router.get("/dashboard", adminController.getDashboard);

// Questions Management
router.route("/questions")
    .get(adminController.listQuestions)
    .post(adminController.createQuestion);

router.route("/questions/:id")
    .get(adminController.getQuestionById)
    .patch(adminController.updateQuestion)
    .delete(adminController.deleteQuestion);

// Topics Management
router.route("/topics")
    .get(adminController.listTopics)
    .post(adminController.createTopic);

router.route("/topics/:id")
    .get(adminController.getTopicById)
    .patch(adminController.updateTopic)
    .delete(adminController.deleteTopic);

// Test Sessions Monitoring
router.get("/test-sessions", adminController.listTestSessions);
router.get("/test-sessions/:id", adminController.getTestSessionById);

// Previous Year Papers Management
router.route("/previous-year-tests")
    .get(adminController.listPreviousYearPapers)
    .post(adminController.createPreviousYearPaper);

router.route("/previous-year-tests/:id")
    .get(adminController.getPreviousYearPaperById)
    .patch(adminController.updatePreviousYearPaper)
    .delete(adminController.deletePreviousYearPaper);

// Streaks Management
router.get("/streaks", adminController.listStreaks);
router.patch("/streaks/:studentId", adminController.updateStreak);

// AI Review Chat Monitoring
router.get("/chat-sessions", adminController.listChatSessions);
router.get("/chat-sessions/:id/messages", adminController.getChatSessionMessages);

module.exports = router;
