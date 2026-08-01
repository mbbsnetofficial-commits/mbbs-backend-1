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
        const userId = req.user ? req.user.userId : 1;
        const result = await testSessionService.startTest(userId, req.body);
        return res.status(201).json({
            success: true,
            message: "UCAT test session started successfully.",
            data: result
        });
    } catch (error) {
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
        const result = await testSessionService.submitTest(sessionId, answers || []);
        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

// Get single owned session details
const getTestSession = async (req, res, next) => {
    try {
        const result = await testSessionService.getSessionResult(req.params.sessionId);
        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

// Get session completion result & answer review
const getTestResult = async (req, res, next) => {
    try {
        const result = await testSessionService.getSessionResult(req.params.sessionId);
        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

// List student test history
const getTestHistory = async (req, res, next) => {
    try {
        const userId = req.user ? req.user.userId : 1;
        const result = await testSessionService.getUserHistory(userId, req.query);
        return res.status(200).json({
            success: true,
            message: "UCAT test history fetched successfully.",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSubjects,
    getChapters,
    getTopics,
    getTestOptions,
    startTest,
    submitTest,
    getTestSession,
    getTestResult,
    getTestHistory
};
