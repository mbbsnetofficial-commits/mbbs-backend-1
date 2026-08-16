"use strict";

const express = require("express");
const router = express.Router();
const testSessionController = require("../../controllers/ucat-controller/testSession.controller");
const { protect } = require("../../utilities/auth");

// All test session routes use protect auth fallback
router.use(protect);

// GET /api/v1/ucat/test/tests/builtin - Get built-in / official UCAT papers
router.get("/tests/builtin", testSessionController.getBuiltinTests);
router.get("/tests", testSessionController.getBuiltinTests);

// GET /api/v1/ucat/test/history - List the logged-in student test history
router.get("/history", testSessionController.getTestHistory);
router.get("/learning-report", testSessionController.getUcatLearningReport);
router.get("/learning-report/filters", testSessionController.getLearningReportFilters);
router.get("/summary", testSessionController.getUcatSummary);

// GET /api/v1/ucat/test/sessions/:sessionId/result - Get a completed test result and answer review
router.get("/sessions/:sessionId/result", testSessionController.getTestResult);

// GET /api/v1/ucat/test/sessions/:sessionId - Get one owned test session (API #5 Resume)
router.get("/sessions/:sessionId", testSessionController.getTestSession);

// PATCH /api/v1/ucat/test/sessions/:sessionId - Autosave answer (API #6 Autosave)
router.patch("/sessions/:sessionId", testSessionController.updateSessionAnswer);

// Step 1: GET /api/v1/ucat/test/subjects - Get available subjects/sections
router.get("/subjects", testSessionController.getSubjects);

// Step 2: POST /api/v1/ucat/test/chapters - Get chapters for selected subjects
router.post("/chapters", testSessionController.getChapters);

// Step 3: POST /api/v1/ucat/test/topics - Get topics for selected chapters
router.post("/topics", testSessionController.getTopics);

// Step 4: POST /api/v1/ucat/test/start - Start a quick practice test or Full Exam (API #4 Start)
router.post("/start", testSessionController.startTest);

// Step 5: POST /api/v1/ucat/test/submit - Submit the completed test (API #7 Submit)
router.post("/submit", testSessionController.submitTest);

// Options & Enums Configuration
router.get("/options", testSessionController.getTestOptions);

module.exports = router;
