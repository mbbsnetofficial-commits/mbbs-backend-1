"use strict";

const express = require("express");
const router = express.Router();
const previousYearController = require("../../controllers/ucat-controller/previousYear.controller");
const { protect } = require("../../utilities/auth");

const { cacheResponse } = require("../../middleware/cache.middleware");

// All previous year test routes require a valid student JWT
router.use(protect);

// GET /api/v1/ucat/previous-year-tests - List available past UCAT papers (cached 120s)
router.get("/", cacheResponse(120), previousYearController.listPreviousYearTests);

// GET /api/v1/ucat/previous-year-tests/sessions/:sessionId/result - Get completed past paper test result & review
router.get("/sessions/:sessionId/result", previousYearController.getPaperTestResult);

// GET /api/v1/ucat/previous-year-tests/sessions/:sessionId - Get active past paper session details
router.get("/sessions/:sessionId", previousYearController.getPaperTestResult);

// POST /api/v1/ucat/previous-year-tests/submit - Submit past paper exam answers
router.post("/submit", previousYearController.submitPaperTest);

// GET /api/v1/ucat/previous-year-tests/:paperId - Single past paper details (cached 120s)
router.get("/:paperId", cacheResponse(120), previousYearController.getPreviousYearTest);

// POST /api/v1/ucat/previous-year-tests/:paperId/start - Start a mapped previous-year paper test
router.post("/:paperId/start", previousYearController.startPaperTest);

module.exports = router;
