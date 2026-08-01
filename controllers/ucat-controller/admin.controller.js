"use strict";

const adminService = require("../../services/ucat-services/admin.service");

const getDashboard = async (req, res, next) => {
    try {
        const stats = await adminService.getDashboard();
        return res.status(200).json({
            success: true,
            message: "UCAT Admin dashboard analytics fetched successfully.",
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

// Questions
const listQuestions = async (req, res, next) => {
    try {
        const result = await adminService.listQuestions(req.query);
        return res.status(200).json({
            success: true,
            message: "UCAT questions fetched successfully.",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const createQuestion = async (req, res, next) => {
    try {
        const question = await adminService.createQuestion(req.body);
        return res.status(201).json({
            success: true,
            message: "UCAT question created successfully.",
            data: question
        });
    } catch (error) {
        next(error);
    }
};

const getQuestionFilters = async (req, res, next) => {
    try {
        const filters = await adminService.getQuestionFilters();
        return res.status(200).json({
            success: true,
            message: "UCAT question filters fetched successfully.",
            data: filters
        });
    } catch (error) {
        next(error);
    }
};

const getQuestionsBySection = async (req, res, next) => {
    try {
        const result = await adminService.getQuestionsBySection(req.params.section, req.query);
        return res.status(200).json({
            success: true,
            message: "UCAT section questions fetched successfully.",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getQuestionsByTopic = async (req, res, next) => {
    try {
        const result = await adminService.getQuestionsByTopic(req.params.topic, req.query);
        return res.status(200).json({
            success: true,
            message: "UCAT topic questions fetched successfully.",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getQuestionById = async (req, res, next) => {
    try {
        const question = await adminService.getQuestionById(req.params.id);
        return res.status(200).json({
            success: true,
            message: "UCAT question fetched successfully.",
            data: question
        });
    } catch (error) {
        next(error);
    }
};

const updateQuestion = async (req, res, next) => {
    try {
        const updated = await adminService.updateQuestion(req.params.id, req.body);
        return res.status(200).json({
            success: true,
            message: "UCAT question updated successfully.",
            data: updated
        });
    } catch (error) {
        next(error);
    }
};

const deleteQuestion = async (req, res, next) => {
    try {
        await adminService.deleteQuestion(req.params.id);
        return res.status(200).json({
            success: true,
            message: "UCAT question deleted successfully."
        });
    } catch (error) {
        next(error);
    }
};

// Topics
const listTopics = async (req, res, next) => {
    try {
        const result = await adminService.listTopics(req.query);
        return res.status(200).json({
            success: true,
            message: "UCAT topics fetched successfully.",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const createTopic = async (req, res, next) => {
    try {
        const topic = await adminService.createTopic(req.body);
        return res.status(201).json({
            success: true,
            message: "UCAT topic created successfully.",
            data: topic
        });
    } catch (error) {
        next(error);
    }
};

const getTopicNamesBySection = async (req, res, next) => {
    try {
        const topics = await adminService.getTopicNamesBySection(req.params.section);
        return res.status(200).json({
            success: true,
            message: "UCAT topic names fetched successfully.",
            data: topics
        });
    } catch (error) {
        next(error);
    }
};

const getTopicsBySection = async (req, res, next) => {
    try {
        const topics = await adminService.getTopicsBySection(req.params.section);
        return res.status(200).json({
            success: true,
            message: "UCAT section topics fetched successfully.",
            data: topics
        });
    } catch (error) {
        next(error);
    }
};

const getTopicById = async (req, res, next) => {
    try {
        const topic = await adminService.getTopicById(req.params.id);
        return res.status(200).json({
            success: true,
            message: "UCAT topic fetched successfully.",
            data: topic
        });
    } catch (error) {
        next(error);
    }
};

const updateTopic = async (req, res, next) => {
    try {
        const updated = await adminService.updateTopic(req.params.id, req.body);
        return res.status(200).json({
            success: true,
            message: "UCAT topic updated successfully.",
            data: updated
        });
    } catch (error) {
        next(error);
    }
};

const deleteTopic = async (req, res, next) => {
    try {
        await adminService.deleteTopic(req.params.id);
        return res.status(200).json({
            success: true,
            message: "UCAT topic deleted successfully."
        });
    } catch (error) {
        next(error);
    }
};

// Test Sessions
const listTestSessions = async (req, res, next) => {
    try {
        const result = await adminService.listTestSessions(req.query);
        return res.status(200).json({
            success: true,
            message: "UCAT test sessions fetched successfully.",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getTestSessionById = async (req, res, next) => {
    try {
        const session = await adminService.getTestSessionById(req.params.id);
        return res.status(200).json({
            success: true,
            message: "UCAT test session fetched successfully.",
            data: session
        });
    } catch (error) {
        next(error);
    }
};

// Previous Year Papers
const listPreviousYearPapers = async (req, res, next) => {
    try {
        const papers = await adminService.listPreviousYearPapers();
        return res.status(200).json({
            success: true,
            message: "Previous year UCAT papers fetched successfully.",
            data: papers
        });
    } catch (error) {
        next(error);
    }
};

const createPreviousYearPaper = async (req, res, next) => {
    try {
        const paper = await adminService.createPreviousYearPaper(req.body);
        return res.status(201).json({
            success: true,
            message: "Previous year UCAT paper created successfully.",
            data: paper
        });
    } catch (error) {
        next(error);
    }
};

const getPreviousYearPaperById = async (req, res, next) => {
    try {
        const paper = await adminService.getPreviousYearPaperById(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Previous year UCAT paper fetched successfully.",
            data: paper
        });
    } catch (error) {
        next(error);
    }
};

const updatePreviousYearPaper = async (req, res, next) => {
    try {
        const updated = await adminService.updatePreviousYearPaper(req.params.id, req.body);
        return res.status(200).json({
            success: true,
            message: "Previous year UCAT paper updated successfully.",
            data: updated
        });
    } catch (error) {
        next(error);
    }
};

const deletePreviousYearPaper = async (req, res, next) => {
    try {
        await adminService.deletePreviousYearPaper(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Previous year UCAT paper deleted successfully."
        });
    } catch (error) {
        next(error);
    }
};

// Streaks
const listStreaks = async (req, res, next) => {
    try {
        const result = await adminService.listStreaks(req.query);
        return res.status(200).json({
            success: true,
            message: "UCAT student streaks fetched successfully.",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const updateStreak = async (req, res, next) => {
    try {
        const updated = await adminService.updateStreak(req.params.studentId, req.body);
        return res.status(200).json({
            success: true,
            message: "UCAT student streak updated successfully.",
            data: updated
        });
    } catch (error) {
        next(error);
    }
};

// Chat Sessions
const listChatSessions = async (req, res, next) => {
    try {
        const result = await adminService.listChatSessions(req.query);
        return res.status(200).json({
            success: true,
            message: "UCAT AI chat sessions fetched successfully.",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getChatSessionMessages = async (req, res, next) => {
    try {
        const messages = await adminService.getChatSessionMessages(req.params.id);
        return res.status(200).json({
            success: true,
            message: "UCAT AI chat messages fetched successfully.",
            data: messages
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboard,
    listQuestions,
    createQuestion,
    getQuestionFilters,
    getQuestionsBySection,
    getQuestionsByTopic,
    getQuestionById,
    updateQuestion,
    deleteQuestion,
    listTopics,
    createTopic,
    getTopicNamesBySection,
    getTopicsBySection,
    getTopicById,
    updateTopic,
    deleteTopic,
    listTestSessions,
    getTestSessionById,
    listPreviousYearPapers,
    createPreviousYearPaper,
    getPreviousYearPaperById,
    updatePreviousYearPaper,
    deletePreviousYearPaper,
    listStreaks,
    updateStreak,
    listChatSessions,
    getChatSessionMessages
};
