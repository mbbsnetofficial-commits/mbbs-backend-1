const express = require("express");
const qodRouter = express.Router();

const qodController = require("../../controllers/neet-controller/qod.controllers");
const qodStreakController = require("../../controllers/neet-controller/qodStreak.controller");
const { protect } = require("../../utilities/auth");

// GET Question Of The Day
qodRouter
    .route("/question-of-the-day")
    .get(protect, qodController.getQuestionOfTheDay);

// Submit Question Of The Day
qodRouter
    .route("/question-of-the-day/submit")
    .post(protect, qodController.submitQuestionOfTheDay);

qodRouter.get(
    "/question-of-the-day/streak",
    protect,
    qodStreakController.getStreak
);

qodRouter.get(
    "/question-of-the-day/streak/history",
    protect,
    qodStreakController.getStreakHistory
);

module.exports = qodRouter;
