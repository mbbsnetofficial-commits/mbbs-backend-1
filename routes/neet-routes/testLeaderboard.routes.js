"use strict";

const express = require("express");
const controller = require("../../controllers/neet-controller/testLeaderboard.controller");
const { protect } = require("../../utilities/auth");

const router = express.Router();

router.get("/test/leaderboard/me", protect, controller.getMyRank);
router.get("/test/leaderboard", controller.getLeaderboard);

module.exports = router;

