const express = require("express");
const previousYearQuestionController = require("../../controllers/neet-controller/previousYearQuestion.controller");
const { protect } = require("../../utilities/auth");

const previousYearQuestionRouter = express.Router();

previousYearQuestionRouter.use(protect);

previousYearQuestionRouter.get("/", previousYearQuestionController.listPreviousYearTests);
previousYearQuestionRouter.get("/:paperId", previousYearQuestionController.getPreviousYearTest);
previousYearQuestionRouter.post("/:paperId/start", previousYearQuestionController.startPreviousYearTest);
previousYearQuestionRouter.post("/submit", previousYearQuestionController.submitPreviousYearTest);

module.exports = previousYearQuestionRouter;
