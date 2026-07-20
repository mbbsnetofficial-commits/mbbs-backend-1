const express = require("express");
const questionFeedbackController = require("../controllers/questionFeedback.controller");
const { protect } = require("../utilities/auth");

const questionFeedbackRouter = express.Router();

questionFeedbackRouter.use(protect);

questionFeedbackRouter
    .route("/test/question-feedback")
    .post(questionFeedbackController.submitQuestionFeedback)
    .get(questionFeedbackController.listMyQuestionFeedback);

module.exports = questionFeedbackRouter;
