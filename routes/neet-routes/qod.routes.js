const express = require("express");
const qodRouter = express.Router();

const qodController = require("../../controllers/neet-controller/qod.controllers");
const { protect } = require("../../utilities/auth");

// GET Question Of The Day
qodRouter
    .route("/question-of-the-day")
    .get(protect, qodController.getQuestionOfTheDay);

// Submit Question Of The Day
qodRouter
    .route("/question-of-the-day/submit")
    .post(protect, qodController.submitQuestionOfTheDay);

module.exports = qodRouter;