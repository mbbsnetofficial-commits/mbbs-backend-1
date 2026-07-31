"use strict";

const express = require("express");
const router = express.Router();
const testSessionController = require("../../controllers/ucat-controller/testSession.controller");

// GET /api/v1/ucat/test/options - Enum options for test timing, question count, test types, and sections
router.get("/options", testSessionController.getTestOptions);

// GET /api/v1/ucat/test/history - User's test history
router.get("/history", testSessionController.getTestHistory);

// GET /api/v1/ucat/test/sessions/:sessionId/result - Test result & analysis
router.get("/sessions/:sessionId/result", testSessionController.getTestResult);

// GET /api/v1/ucat/test/sessions/:sessionId - Get active session
router.get("/sessions/:sessionId", testSessionController.getTestSession);

// POST /api/v1/ucat/test/start - Start custom test session
router.post("/start", testSessionController.startTest);

// POST /api/v1/ucat/test/submit - Submit answers & calculate score
router.post("/submit", testSessionController.submitTest);

module.exports = router;
