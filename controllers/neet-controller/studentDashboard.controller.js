"use strict";

const studentDashboardService = require("../../services/studentDashboard.service");

/**
 * @desc Get aggregated dashboard summary for authenticated student
 * @route GET /api/v1/student/dashboard/summary
 * @access Private (Student Auth Token Required)
 */
exports.getDashboardSummary = async (req, res) => {
    try {
        const studentId = req.user?.student_id;

        if (!studentId) {
            return res.status(400).json({
                status: "fail",
                message: "student_id is missing from authentication token."
            });
        }

        const summary = await studentDashboardService.getStudentDashboardSummary(studentId);

        return res.status(200).json({
            status: "success",
            message: "Student dashboard summary fetched successfully.",
            data: summary
        });
    } catch (error) {
        return res.status(500).json({
            status: "fail",
            message: error.message || "Failed to fetch student dashboard summary."
        });
    }
};

/**
 * @desc Get top-level KPI stats cards for authenticated student
 * @route GET /api/v1/student/dashboard/stats
 * @access Private (Student Auth Token Required)
 */
exports.getDashboardStats = async (req, res) => {
    try {
        const studentId = req.user?.student_id;

        if (!studentId) {
            return res.status(400).json({
                status: "fail",
                message: "student_id is missing from authentication token."
            });
        }

        const stats = await studentDashboardService.getStudentDashboardStats(studentId);

        return res.status(200).json({
            status: "success",
            message: "Student dashboard KPI stats fetched successfully.",
            data: stats
        });
    } catch (error) {
        return res.status(500).json({
            status: "fail",
            message: error.message || "Failed to fetch student dashboard stats."
        });
    }
};

/**
 * @desc Get detailed performance analytics for authenticated student
 * @route GET /api/v1/student/dashboard/performance
 * @access Private (Student Auth Token Required)
 */
exports.getDashboardPerformance = async (req, res) => {
    try {
        const studentId = req.user?.student_id;

        if (!studentId) {
            return res.status(400).json({
                status: "fail",
                message: "student_id is missing from authentication token."
            });
        }

        const performance = await studentDashboardService.getStudentPerformanceMetrics(studentId);

        return res.status(200).json({
            status: "success",
            message: "Student performance analytics fetched successfully.",
            data: performance
        });
    } catch (error) {
        return res.status(500).json({
            status: "fail",
            message: error.message || "Failed to fetch student performance metrics."
        });
    }
};

/**
 * @desc Get paginated activity timeline for authenticated student
 * @route GET /api/v1/student/dashboard/recent-activity
 * @access Private (Student Auth Token Required)
 */
exports.getDashboardRecentActivity = async (req, res) => {
    try {
        const studentId = req.user?.student_id;

        if (!studentId) {
            return res.status(400).json({
                status: "fail",
                message: "student_id is missing from authentication token."
            });
        }

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;

        const result = await studentDashboardService.getStudentRecentActivity(studentId, page, limit);

        return res.status(200).json({
            status: "success",
            message: "Student activity history fetched successfully.",
            data: result.activities,
            pagination: result.pagination
        });
    } catch (error) {
        return res.status(500).json({
            status: "fail",
            message: error.message || "Failed to fetch student recent activity."
        });
    }
};
