"use strict";

const testSessionService = require("../../services/ucat-services/testSession.service");

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
    getTestOptions,
    startTest,
    submitTest,
    getTestSession,
    getTestResult,
    getTestHistory
};
