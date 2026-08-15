"use strict";

const learningReportService = require("../../services/learningReport.service");

/**
 * GET /api/v1/neet/tests/builtin
 * Returns all active Built-in tests from the database.
 */
exports.getBuiltinTests = async (req, res) => {
    try {
        const tests = await learningReportService.getBuiltinTests();
        return res.status(200).json({
            success: true,
            total: tests.length,
            data: tests
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * GET /api/v1/student/dashboard/neet-learning-report
 * Returns the unified list of Built-in Tests & Previous Year Tests with student's real attempt status.
 */
exports.getNeetLearningReport = async (req, res) => {
    try {
        const studentId = req.user?.student_id || "STU123456";
        const result = await learningReportService.getNeetLearningReport(studentId, req.query);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * GET /api/v1/student/dashboard/neet-summary
 * Returns the student's real NEET performance summary (time spent, avg score, completed tests, streak).
 */
exports.getNeetSummary = async (req, res) => {
    try {
        const studentId = req.user?.student_id || "STU123456";
        const result = await learningReportService.getNeetSummary(studentId);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
