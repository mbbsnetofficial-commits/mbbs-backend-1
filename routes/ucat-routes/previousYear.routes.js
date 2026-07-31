"use strict";

const express = require("express");
const router = express.Router();
const previousYearController = require("../../controllers/ucat-controller/previousYear.controller");
const { protect } = require("../../utilities/auth");

// All previous year test routes require a valid student JWT
router.use(protect);

// GET /api/v1/ucat/previous-year-tests - List available past UCAT papers
router.get("/", previousYearController.listPreviousYearTests);

// POST /api/v1/ucat/previous-year-tests/submit - Submit past paper exam answers
// Must be declared before /:paperId to avoid "submit" being matched as a paperId
router.post("/submit", previousYearController.submitPaperTest);

// GET /api/v1/ucat/previous-year-tests/:paperId - Single past paper details
router.get("/:paperId", previousYearController.getPreviousYearTest);

// POST /api/v1/ucat/previous-year-tests/:paperId/start - Start a mapped previous-year paper test
router.post("/:paperId/start", previousYearController.startPaperTest);

module.exports = router;
