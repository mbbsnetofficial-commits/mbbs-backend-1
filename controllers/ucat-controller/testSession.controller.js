"use strict";

const testSessionService = require("../../services/ucat-services/testSession.service");

// Step 1: Get available subjects / sections
const getSubjects = async (req, res, next) => {
    try {
        const result = await testSessionService.getSubjects();
        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

// Step 2: Get chapters for selected subjects
const getChapters = async (req, res, next) => {
    try {
        const result = await testSessionService.getChapters(req.body);
        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

// Step 3: Get topics for selected chapters
const getTopics = async (req, res, next) => {
    try {
        const result = await testSessionService.getTopics(req.body);
        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

// Enum Configuration Options
const getTestOptions = async (req, res, next) => {
    try {
        const options = await testSessionService.getTestOptions();
        return res.status(200).json({
            success: true,
            message: "UCAT test configuration options and enums fetched successfully.",
            data: options
        });
    } catch (error) {
        next(error);
    }
};

// Step 4: Start quick or custom practice test
const startTest = async (req, res, next) => {
    try {
        const result = await testSessionService.startTest(req.user, req.body);
        return res.status(201).json({
            success: true,
            message: "UCAT test session started successfully.",
            data: result
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

// Step 5: Submit completed test session
const submitTest = async (req, res, next) => {
    try {
        const { sessionId, answers } = req.body;
        if (!sessionId) {
            return res.status(400).json({ success: false, message: "sessionId is required." });
        }
        const result = await testSessionService.submitTest(sessionId, answers || [], req.user);
        return res.status(200).json(result);
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

// Get single owned session details
const getTestSession = async (req, res, next) => {
    try {
        const result = await testSessionService.getSessionResult(req.params.sessionId, req.user);
        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

// Get session completion result & answer review
const getTestResult = async (req, res, next) => {
    try {
        const result = await testSessionService.getSessionResult(req.params.sessionId, req.user);
        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

// GET /api/v1/ucat/tests/builtin - Get built-in / official UCAT papers
const getBuiltinTests = async (req, res, next) => {
    try {
        const tests = await testSessionService.getBuiltinTests();
        return res.status(200).json({
            success: true,
            message: "UCAT official papers fetched successfully.",
            data: tests
        });
    } catch (error) {
        next(error);
    }
};

// PATCH /api/v1/ucat/test/sessions/:sessionId - Autosave / update answer
const updateSessionAnswer = async (req, res, next) => {
    try {
        const sessionId = req.params.sessionId;
        const result = await testSessionService.updateSessionAnswer(sessionId, req.body, req.user);
        return res.status(200).json(result);
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

// GET /api/v1/student/dashboard/ucat-summary - Get UCAT dashboard summary KPI metrics
const getUcatSummary = async (req, res, next) => {
    try {
        const studentId = req.user?.student_id;
        if (!studentId) {
            return res.status(401).json({ success: false, message: "Authentication required." });
        }
        const result = await testSessionService.getUcatSummary(studentId);
        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

// GET /api/v1/student/dashboard/ucat-learning-report - Get UCAT learning report
const getUcatLearningReport = async (req, res, next) => {
    try {
        const studentId = req.user?.student_id;
        if (!studentId) {
            return res.status(401).json({ success: false, message: "Authentication required." });
        }
        const result = await testSessionService.getUserHistory(studentId, req.query);
        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

// List student test history
const getTestHistory = async (req, res, next) => {
    try {
        const studentId = req.user?.student_id;
        if (!studentId) {
            return res.status(401).json({ success: false, message: "Authentication required." });
        }
        const result = await testSessionService.getUserHistory(studentId, req.query);
        return res.status(200).json({
            success: true,
            message: "UCAT test history fetched successfully.",
            data: result.data || result
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/v1/student/dashboard/ucat-learning-report/filters - Get UCAT learning report filters
const getLearningReportFilters = async (req, res, next) => {
    try {
        const filters = testSessionService.getLearningReportFilters();
        return res.status(200).json({
            status: "success",
            message: "Filter options fetched successfully.",
            data: filters
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/v1/ucat/test/custom/save - Save a custom test definition
const saveCustomTest = async (req, res, next) => {
    try {
        const studentId = req.user?.student_id;
        if (!studentId) {
            return res.status(401).json({ success: false, message: "Authentication required." });
        }
        const result = await testSessionService.saveCustomTest(req.user, req.body);
        return res.status(201).json({
            success: true,
            message: "UCAT custom test saved successfully.",
            data: result
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

// GET /api/v1/ucat/test/custom - List student's saved custom tests
const listCustomTests = async (req, res, next) => {
    try {
        const studentId = req.user?.student_id;
        if (!studentId) {
            return res.status(401).json({ success: false, message: "Authentication required." });
        }
        const tests = await testSessionService.listCustomTests(studentId);
        return res.status(200).json({
            success: true,
            message: "UCAT custom tests fetched successfully.",
            data: tests,
            total: tests.length
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

// GET /api/v1/ucat/test/custom/:customTestId - Get one custom test with ownership check
const getCustomTest = async (req, res, next) => {
    try {
        const result = await testSessionService.getCustomTest(req.params.customTestId, req.user);
        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

module.exports = {
    getSubjects,
    getChapters,
    getTopics,
    getTestOptions,
    getBuiltinTests,
    startTest,
    updateSessionAnswer,
    submitTest,
    getTestSession,
    getTestResult,
    getTestHistory,
    getUcatSummary,
    getUcatLearningReport,
    getLearningReportFilters,
    saveCustomTest,
    listCustomTests,
    getCustomTest
};
