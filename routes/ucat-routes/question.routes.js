"use strict";

const express = require("express");

const router = express.Router();

const questionController = require("../../controllers/ucat-controller/question.controller");



router.get("/",questionController.getQuestions);

router.get("/filters",questionController.getQuestionFilters);

router.get("/section/:section",questionController.getQuestionsBySection);

router.get("/topic/:topic",questionController.getQuestionsByTopic);

router.get("/:id",questionController.getQuestionById);

module.exports = router;