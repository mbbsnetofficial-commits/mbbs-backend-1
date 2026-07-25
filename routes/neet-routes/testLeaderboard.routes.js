"use strict";

const express = require("express");
const controller = require("../../controllers/neet-controller/testLeaderboard.controller");
const { protect } = require("../../utilities/auth");

const router = express.Router();

router.use(protect);
router.get("/test/leaderboard/me", controller.getMyRank);
router.get("/test/leaderboard", controller.getLeaderboard);

module.exports = router;

