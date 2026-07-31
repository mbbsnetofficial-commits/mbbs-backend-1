"use strict";

const UcatQuestion = require("../../model/ucat-model/ucatQuestion");

const getQuestions = async (filters = {}, options = {}) => {
    const {
        page = 1,
        limit = 20
    } = options;

    const skip = (page - 1) * limit;

    const [questions, total] = await Promise.all([
        UcatQuestion.find(filters)
            .select("-correctAnswer -explanation")
            .sort({ questionId: 1 })
            .skip(skip)
            .limit(limit)
            .lean(),

        UcatQuestion.countDocuments(filters)
    ]);

    return {
        questions,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
};

const getQuestionById = async (id) => {
    return UcatQuestion.findOne({
        questionId: Number(id),
        status: "ACTIVE"
    }).lean();
};

const getQuestionsBySection = async (
    section,
    options = {}
) => {
    return getQuestions(
        {
            section,
            status: "ACTIVE"
        },
        options
    );
};

const getQuestionsByTopic = async (
    topic,
    options = {}
) => {
    return getQuestions(
        {
            topic,
            status: "ACTIVE"
        },
        options
    );
};

const getQuestionFilters = async () => {
    const [sections, topics, difficulties] = await Promise.all([
        UcatQuestion.distinct("section", {
            status: "ACTIVE"
        }),

        UcatQuestion.distinct("topic", {
            status: "ACTIVE"
        }),

        UcatQuestion.distinct("difficulty", {
            status: "ACTIVE"
        })
    ]);

    return {
        sections,
        topics,
        difficulties
    };
};

module.exports = {
    getQuestions,
    getQuestionById,
    getQuestionsBySection,
    getQuestionsByTopic,
    getQuestionFilters
};