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

// 4. Get available filter options for dropdown binding
learningReportRouter.get(
    "/student/dashboard/neet-learning-report/filters",
    learningReportController.getLearningReportFilters
);

learningReportRouter.get(
    "/neet/tests/filters",
    learningReportController.getLearningReportFilters
);

module.exports = learningReportRouter;
