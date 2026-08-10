"use strict";

const express = require("express");
const studentDashboardController = require("../../controllers/neet-controller/studentDashboard.controller");
const { protect } = require("../../utilities/auth");

const studentDashboardRouter = express.Router();

// Require authenticated student for all dashboard endpoints
studentDashboardRouter.use("/student/dashboard", protect);

studentDashboardRouter.get(
    "/student/dashboard/summary",
    studentDashboardController.getDashboardSummary
);

studentDashboardRouter.get(
    "/student/dashboard/stats",
    studentDashboardController.getDashboardStats
);

studentDashboardRouter.get(
    "/student/dashboard/performance",
    studentDashboardController.getDashboardPerformance
);

studentDashboardRouter.get(
    "/student/dashboard/recent-activity",
    studentDashboardController.getDashboardRecentActivity
);

studentDashboardRouter.get(
    "/student/dashboard/saved-blogs",
    studentDashboardController.getSavedBlogs
);

studentDashboardRouter.get(
    "/student/dashboard/university-finder/saved-universities",
    studentDashboardController.getSavedUniversities
);

studentDashboardRouter.post(
    "/student/dashboard/university-finder/save-university",
    studentDashboardController.saveUniversity
);

studentDashboardRouter.delete(
    "/student/dashboard/university-finder/save-university/:universityId",
    studentDashboardController.unsaveUniversity
);

studentDashboardRouter.get(
    "/student/dashboard/university-finder/recommendations",
    studentDashboardController.getRecommendations
);

studentDashboardRouter.post(
    "/student/dashboard/university-finder/recommendations",
    studentDashboardController.saveRecommendation
);

module.exports = studentDashboardRouter;
