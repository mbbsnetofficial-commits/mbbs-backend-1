"use strict";

const express = require("express");
const router = express.Router();
const streakController = require("../../controllers/ucat-controller/streak.controller");
const { protect } = require("../../utilities/auth");

const { cacheResponse } = require("../../middleware/cache.middleware");

// All streak routes require a valid student JWT
router.use(protect);

// GET /api/v1/ucat/streaks - Get current streak & stats (cached 30s)
router.get("/", cacheResponse(30), streakController.getStreak);

// POST /api/v1/ucat/streaks/record - Record practice activity
router.post("/record", streakController.recordActivity);

module.exports = router;
