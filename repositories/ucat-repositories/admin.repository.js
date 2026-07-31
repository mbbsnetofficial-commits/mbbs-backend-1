"use strict";

const mongoose = require("mongoose");
const UcatQuestion = require("../../model/ucat-model/ucatQuestion");
const UcatTopic = require("../../model/ucat-model/ucatTopic");
const UcatTestSession = require("../../model/ucat-model/ucatTestSession");
const UcatPreviousYear = require("../../model/ucat-model/ucatPreviousYear");
const UcatStreak = require("../../model/ucat-model/ucatStreak");
const UcatChatSession = require("../../model/ucat-model/ucatChatSession");
const UcatChatMessage = require("../../model/ucat-model/ucatChatMessage");

const buildIdFilter = (id) => {
    if (!id) return {};
    const numId = Number(id);
    const conditions = [];
    if (!isNaN(numId)) {
        conditions.push({ id: numId });
    }
    conditions.push({ id: String(id) });
    if (mongoose.Types.ObjectId.isValid(id)) {
        conditions.push({ _id: id });
    }
    return conditions.length === 1 ? conditions[0] : { $or: conditions };
};

// --- DASHBOARD ---
const getDashboardStats = async () => {
    const [
        totalQuestions,
        totalTopics,
        totalTestSessions,
        totalPreviousYearPapers,
        totalStreaks,
        totalChatSessions
    ] = await Promise.all([
        UcatQuestion.countDocuments({}),
        UcatTopic.countDocuments({}),
        UcatTestSession.countDocuments({}),
        UcatPreviousYear.countDocuments({}),
        UcatStreak.countDocuments({}),
        UcatChatSession.countDocuments({})
    ]);

    return {
        totalQuestions,
        totalTopics,
        totalTestSessions,
        totalPreviousYearPapers,
        totalStreaks,
        totalChatSessions
    };
};

// --- QUESTIONS MANAGEMENT ---
const listQuestions = async (options = {}) => {
    const { page = 1, limit = 20, subject, topic, search } = options;
    const p = Math.max(Number(page) || 1, 1);
    const l = Math.max(Number(limit) || 20, 1);
    const skip = (p - 1) * l;

    const query = {};
    if (subject) {
        query.subject = new RegExp("^" + subject.replace(/_/g, "[ _]?") + "$", "i");
    }
    if (topic) {
        query.topic_name = new RegExp(topic, "i");
    }
    if (search) {
        query.question = new RegExp(search, "i");
    }

    const [questions, total] = await Promise.all([
        UcatQuestion.find(query)
            .sort({ id: -1, createdAt: -1 })
            .skip(skip)
            .limit(l)
            .lean(),
        UcatQuestion.countDocuments(query)
    ]);

    return { questions, total, page: p, limit: l, totalPages: Math.ceil(total / l) };
};

const createQuestion = async (data) => {
    if (!data.id) {
        const highest = await UcatQuestion.findOne({}).sort({ id: -1 }).lean();
        data.id = highest && highest.id ? Number(highest.id) + 1 : 1;
    }
    return UcatQuestion.create(data);
};

const getQuestionById = async (id) => {
    const filter = buildIdFilter(id);
    return UcatQuestion.findOne(filter).lean();
};

const updateQuestion = async (id, updateData) => {
    const filter = buildIdFilter(id);
    return UcatQuestion.findOneAndUpdate(filter, { $set: updateData }, { returnDocument: "after" }).lean();
};

const deleteQuestion = async (id) => {
    const filter = buildIdFilter(id);
    return UcatQuestion.findOneAndDelete(filter).lean();
};

// --- TOPICS MANAGEMENT ---
const listTopics = async (options = {}) => {
    const { page = 1, limit = 50, subject } = options;
    const p = Math.max(Number(page) || 1, 1);
    const l = Math.max(Number(limit) || 50, 1);
    const skip = (p - 1) * l;

    const query = {};
    if (subject) {
        query.subject = new RegExp("^" + subject.replace(/_/g, "[ _]?") + "$", "i");
    }

    const [topics, total] = await Promise.all([
        UcatTopic.find(query)
            .sort({ id: 1 })
            .skip(skip)
            .limit(l)
            .lean(),
        UcatTopic.countDocuments(query)
    ]);

    return { topics, total, page: p, limit: l, totalPages: Math.ceil(total / l) };
};

const createTopic = async (data) => {
    if (!data.id) {
        const highest = await UcatTopic.findOne({}).sort({ id: -1 }).lean();
        data.id = highest && highest.id ? Number(highest.id) + 1 : 1;
    }
    return UcatTopic.create(data);
};

const getTopicById = async (id) => {
    const filter = buildIdFilter(id);
    return UcatTopic.findOne(filter).lean();
};

const updateTopic = async (id, updateData) => {
    const filter = buildIdFilter(id);
    return UcatTopic.findOneAndUpdate(filter, { $set: updateData }, { returnDocument: "after" }).lean();
};

const deleteTopic = async (id) => {
    const filter = buildIdFilter(id);
    return UcatTopic.findOneAndDelete(filter).lean();
};

// --- TEST SESSIONS MONITORING ---
const listTestSessions = async (options = {}) => {
    const { page = 1, limit = 20, status, student_id } = options;
    const p = Math.max(Number(page) || 1, 1);
    const l = Math.max(Number(limit) || 20, 1);
    const skip = (p - 1) * l;

    const query = {};
    if (status) {
        query.status = new RegExp("^" + status + "$", "i");
    }
    if (student_id) {
        query.$or = [{ student_id }, { userId: student_id }];
    }

    const [sessions, total] = await Promise.all([
        UcatTestSession.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(l)
            .lean(),
        UcatTestSession.countDocuments(query)
    ]);

    return { sessions, total, page: p, limit: l, totalPages: Math.ceil(total / l) };
};

const getTestSessionById = async (id) => {
    const filter = mongoose.Types.ObjectId.isValid(id)
        ? { $or: [{ sessionId: id }, { _id: id }] }
        : { sessionId: id };
    return UcatTestSession.findOne(filter).lean();
};

// --- PREVIOUS YEAR PAPERS MANAGEMENT ---
const listPreviousYearPapers = async () => {
    return UcatPreviousYear.find({}).sort({ id: 1 }).lean();
};

const createPreviousYearPaper = async (data) => {
    if (!data.id) {
        const highest = await UcatPreviousYear.findOne({}).sort({ id: -1 }).lean();
        data.id = highest && highest.id ? Number(highest.id) + 1 : 1;
    }
    return UcatPreviousYear.create(data);
};

const getPreviousYearPaperById = async (id) => {
    const filter = buildIdFilter(id);
    return UcatPreviousYear.findOne(filter).lean();
};

const updatePreviousYearPaper = async (id, updateData) => {
    const filter = buildIdFilter(id);
    return UcatPreviousYear.findOneAndUpdate(filter, { $set: updateData }, { returnDocument: "after" }).lean();
};

const deletePreviousYearPaper = async (id) => {
    const filter = buildIdFilter(id);
    return UcatPreviousYear.findOneAndDelete(filter).lean();
};

// --- STREAKS MANAGEMENT ---
const listStreaks = async (options = {}) => {
    const { page = 1, limit = 20 } = options;
    const p = Math.max(Number(page) || 1, 1);
    const l = Math.max(Number(limit) || 20, 1);
    const skip = (p - 1) * l;

    const [streaks, total] = await Promise.all([
        UcatStreak.find({})
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(l)
            .lean(),
        UcatStreak.countDocuments({})
    ]);

    return { streaks, total, page: p, limit: l, totalPages: Math.ceil(total / l) };
};

const updateStreak = async (studentId, updateData) => {
    return UcatStreak.findOneAndUpdate(
        { $or: [{ studentId }, { userId: studentId }] },
        { $set: updateData },
        { returnDocument: "after", upsert: true }
    ).lean();
};

// --- AI CHAT SESSIONS MONITORING ---
const listChatSessions = async (options = {}) => {
    const { page = 1, limit = 20 } = options;
    const p = Math.max(Number(page) || 1, 1);
    const l = Math.max(Number(limit) || 20, 1);
    const skip = (p - 1) * l;

    const [sessions, total] = await Promise.all([
        UcatChatSession.find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(l)
            .lean(),
        UcatChatSession.countDocuments({})
    ]);

    return { sessions, total, page: p, limit: l, totalPages: Math.ceil(total / l) };
};

const getChatSessionMessages = async (chatSessionId) => {
    return UcatChatMessage.find({ chatSessionId }).sort({ createdAt: 1 }).lean();
};

module.exports = {
    getDashboardStats,
    listQuestions,
    createQuestion,
    getQuestionById,
    updateQuestion,
    deleteQuestion,
    listTopics,
    createTopic,
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
