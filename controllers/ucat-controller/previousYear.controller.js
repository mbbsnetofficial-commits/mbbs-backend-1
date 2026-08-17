"use strict";

const previousYearService = require("../../services/ucat-services/previousYear.service");

const listPreviousYearTests = async (req, res, next) => {
    try {
        const papers = await previousYearService.listPapers();
        return res.status(200).json({
            success: true,
            message: "Previous year UCAT papers fetched successfully.",
            data: papers
        });
    } catch (error) {
        next(error);
    }
};

const getPreviousYearTest = async (req, res, next) => {
    try {
        const paper = await previousYearService.getPaperById(req.params.paperId);
        return res.status(200).json({
            success: true,
            message: "Previous year UCAT paper fetched successfully.",
            data: paper
        });
    } catch (error) {
        next(error);
    }
};

const startPaperTest = async (req, res, next) => {
    try {
        const paperId = req.params.paperId;
        const result = await previousYearService.startPaperTest(paperId, req.user, req.body);
        return res.status(201).json({
            success: true,
            message: "Previous year UCAT paper test session started successfully.",
            data: result
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

const submitPaperTest = async (req, res, next) => {
    try {
        const result = await previousYearService.submitPaperTest(req.body, req.user);
        return res.status(200).json(result);
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

const getPaperTestResult = async (req, res, next) => {
    try {
        const result = await previousYearService.getPaperTestResult(req.params.sessionId, req.user);
        return res.status(200).json({
            success: true,
            message: "Previous-year UCAT test session result fetched successfully.",
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
    listPreviousYearTests,
    getPreviousYearTest,
    startPaperTest,
    submitPaperTest,
    getPaperTestResult
};
