"use strict";

const express = require("express");
const router = express.Router();
const testSessionController = require("../../controllers/ucat-controller/testSession.controller");
const { protect } = require("../../utilities/auth");

// All test session routes require a valid student JWT
router.use(protect);

// GET /api/v1/ucat/test/history - List the logged-in student test history
router.get("/history", testSessionController.getTestHistory);

// GET /api/v1/ucat/test/sessions/:sessionId/result - Get a completed test result and answer review
router.get("/sessions/:sessionId/result", testSessionController.getTestResult);

// GET /api/v1/ucat/test/sessions/:sessionId - Get one owned test session
router.get("/sessions/:sessionId", testSessionController.getTestSession);

// Step 1: GET /api/v1/ucat/test/subjects - Get available subjects/sections
router.get("/subjects", testSessionController.getSubjects);

// Step 2: POST /api/v1/ucat/test/chapters - Get chapters for selected subjects
router.post("/chapters", testSessionController.getChapters);

// Step 3: POST /api/v1/ucat/test/topics - Get topics for selected chapters
router.post("/topics", testSessionController.getTopics);

// Step 4: POST /api/v1/ucat/test/start - Start a quick practice test
router.post("/start", testSessionController.startTest);

// Step 5: POST /api/v1/ucat/test/submit - Submit the completed test
router.post("/submit", testSessionController.submitTest);

// Options & Enums Configuration
router.get("/options", testSessionController.getTestOptions);

module.exports = router;
