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

const ucatTestSessionController = require("../../controllers/ucat-controller/testSession.controller");

// UCAT: Get all active built-in / official UCAT papers
learningReportRouter.get(
    "/ucat/tests/builtin",
    ucatTestSessionController.getBuiltinTests
);

// UCAT: Get student UCAT Learning Report
learningReportRouter.get(
    "/student/dashboard/ucat-learning-report",
    ucatTestSessionController.getUcatLearningReport
);

// UCAT: Get real UCAT Student Performance Summary
learningReportRouter.get(
    "/student/dashboard/ucat-summary",
    ucatTestSessionController.getUcatSummary
);

module.exports = learningReportRouter;
