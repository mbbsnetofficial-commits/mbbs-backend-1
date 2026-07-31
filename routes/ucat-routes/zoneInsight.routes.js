"use strict";

const express = require("express");
const router = express.Router();
const zoneInsightController = require("../../controllers/ucat-controller/zoneInsight.controller");

// POST /api/v1/ucat/insights/generate - Generate zone insight for a test session
router.post("/generate", zoneInsightController.generateZoneInsight);

// GET /api/v1/ucat/insights/test-zone-insights/:testSessionId - Get zone insight by test session ID
router.get("/test-zone-insights/:testSessionId", zoneInsightController.getZoneInsight);

module.exports = router;
