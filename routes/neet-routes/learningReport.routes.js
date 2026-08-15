"use strict";

const express = require("express");
const learningReportController = require("../../controllers/neet-controller/learningReport.controller");
const { protect } = require("../../utilities/auth");

const learningReportRouter = express.Router();

// 1. Get all active built-in tests from the database
learningReportRouter.get(
    "/neet/tests/builtin",
    learningReportController.getBuiltinTests
);

// 2. Get unified NEET Learning Report (Built-in + Previous Year)
learningReportRouter.get(
    "/student/dashboard/neet-learning-report",
    learningReportController.getNeetLearningReport
);

// 3. Get real NEET Student Performance Summary
learningReportRouter.get(
    "/student/dashboard/neet-summary",
    learningReportController.getNeetSummary
);

module.exports = learningReportRouter;
