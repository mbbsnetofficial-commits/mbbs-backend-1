"use strict";

const express = require("express");
const router = express.Router();
const streakController = require("../../controllers/ucat-controller/streak.controller");
const { protect } = require("../../utilities/auth");

// All streak routes require a valid student JWT
router.use(protect);

// GET /api/v1/ucat/streaks - Get current streak & stats
router.get("/", streakController.getStreak);

// POST /api/v1/ucat/streaks/record - Record practice activity
router.post("/record", streakController.recordActivity);

module.exports = router;
