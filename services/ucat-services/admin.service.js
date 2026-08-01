"use strict";

const adminRepository = require("../../repositories/ucat-repositories/admin.repository");
const questionRepository = require("../../repositories/ucat-repositories/question.repositories");
const topicRepository = require("../../repositories/ucat-repositories/topic.repository");

const getDashboard = async () => {
    return adminRepository.getDashboardStats();
};

// Questions
const listQuestions = async (query) => {
    return adminRepository.listQuestions(query);
};

const createQuestion = async (payload) => {
    if (!payload.question) {
        const error = new Error("Question text is required.");
        error.statusCode = 400;
        throw error;
    }
    return adminRepository.createQuestion(payload);
};

const getQuestionById = async (id) => {
    const question = await adminRepository.getQuestionById(id);
    if (!question) {
        const error = new Error("Question not found.");
        error.statusCode = 404;
        throw error;
    }
    return question;
};

const updateQuestion = async (id, payload) => {
    const updated = await adminRepository.updateQuestion(id, payload);
    if (!updated) {
        const error = new Error("Question not found for update.");
        error.statusCode = 404;
        throw error;
    }
    return updated;
};

const deleteQuestion = async (id) => {
    const deleted = await adminRepository.deleteQuestion(id);
    if (!deleted) {
        const error = new Error("Question not found for deletion.");
        error.statusCode = 404;
        throw error;
    }
    return deleted;
};

const getQuestionFilters = async () => {
    return questionRepository.getQuestionFilters();
};

const getQuestionsBySection = async (section, query = {}) => {
    if (!section) {
        const error = new Error("Section parameter is required.");
        error.statusCode = 400;
        throw error;
    }
    return questionRepository.getQuestionsBySection(section, query);
};

const getQuestionsByTopic = async (topic, query = {}) => {
    if (!topic) {
        const error = new Error("Topic parameter is required.");
        error.statusCode = 400;
        throw error;
    }
    return questionRepository.getQuestionsByTopic(topic, query);
};

// Topics
const listTopics = async (query) => {
    return adminRepository.listTopics(query);
};

const createTopic = async (payload) => {
    if (!payload.name) {
        const error = new Error("Topic name is required.");
        error.statusCode = 400;
        throw error;
    }
    return adminRepository.createTopic(payload);
};

const getTopicById = async (id) => {
    const topic = await adminRepository.getTopicById(id);
    if (!topic) {
        const error = new Error("Topic not found.");
        error.statusCode = 404;
        throw error;
    }
    return topic;
};

const updateTopic = async (id, payload) => {
    const updated = await adminRepository.updateTopic(id, payload);
    if (!updated) {
        const error = new Error("Topic not found for update.");
        error.statusCode = 404;
        throw error;
    }
    return updated;
};

const deleteTopic = async (id) => {
    const deleted = await adminRepository.deleteTopic(id);
    if (!deleted) {
        const error = new Error("Topic not found for deletion.");
        error.statusCode = 404;
        throw error;
    }
    return deleted;
};

const getTopicNamesBySection = async (section) => {
    if (!section) {
        const error = new Error("Section parameter is required.");
        error.statusCode = 400;
        throw error;
    }
    return topicRepository.getTopicNamesBySection(section);
};

const getTopicsBySection = async (section) => {
    if (!section) {
        const error = new Error("Section parameter is required.");
        error.statusCode = 400;
        throw error;
    }
    return topicRepository.getTopicsBySection(section);
};

// Test Sessions
const listTestSessions = async (query) => {
    return adminRepository.listTestSessions(query);
};

const getTestSessionById = async (id) => {
    const session = await adminRepository.getTestSessionById(id);
    if (!session) {
        const error = new Error("Test session not found.");
        error.statusCode = 404;
        throw error;
    }
    return session;
};

// Previous Year Papers
const listPreviousYearPapers = async () => {
    return adminRepository.listPreviousYearPapers();
};

const createPreviousYearPaper = async (payload) => {
    if (!payload.name) {
        const error = new Error("Paper name is required.");
        error.statusCode = 400;
        throw error;
    }
    return adminRepository.createPreviousYearPaper(payload);
};

const getPreviousYearPaperById = async (id) => {
    const paper = await adminRepository.getPreviousYearPaperById(id);
    if (!paper) {
        const error = new Error("Previous year paper not found.");
        error.statusCode = 404;
        throw error;
    }
    return paper;
};

const updatePreviousYearPaper = async (id, payload) => {
    const updated = await adminRepository.updatePreviousYearPaper(id, payload);
    if (!updated) {
        const error = new Error("Previous year paper not found for update.");
        error.statusCode = 404;
        throw error;
    }
    return updated;
};

const deletePreviousYearPaper = async (id) => {
    const deleted = await adminRepository.deletePreviousYearPaper(id);
    if (!deleted) {
        const error = new Error("Previous year paper not found for deletion.");
        error.statusCode = 404;
        throw error;
    }
    return deleted;
};

// Streaks
const listStreaks = async (query) => {
    return adminRepository.listStreaks(query);
};

const updateStreak = async (studentId, payload) => {
    return adminRepository.updateStreak(studentId, payload);
};

// Chat Sessions
const listChatSessions = async (query) => {
    return adminRepository.listChatSessions(query);
};

const getChatSessionMessages = async (chatSessionId) => {
    return adminRepository.getChatSessionMessages(chatSessionId);
};

module.exports = {
    getDashboard,
    listQuestions,
    createQuestion,
    getQuestionById,
    updateQuestion,
    deleteQuestion,
    getQuestionFilters,
    getQuestionsBySection,
    getQuestionsByTopic,
    listTopics,
    createTopic,
    getTopicById,
    updateTopic,
    deleteTopic,
    getTopicNamesBySection,
    getTopicsBySection,
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
