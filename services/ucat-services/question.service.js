"use strict";

const questionRepository = require("../../repositories/ucat-repositories/question.repositories");

const VALID_SECTIONS = [
    "VERBAL_REASONING",
    "DECISION_MAKING",
    "QUANTITATIVE_REASONING",
    "ABSTRACT_REASONING",
    "SITUATIONAL_JUDGEMENT"
];

const normalizeSection = (s) => (s || "").trim().toUpperCase().replace(/[ -]/g, "_");

const VALID_DIFFICULTIES = [
    "EASY",
    "MEDIUM",
    "HARD"
];

const getQuestions = async (query = {}) => {
    const {
        section,
        topic,
        difficulty,
        questionType,
        page = 1,
        limit = 20
    } = query;

    const filters = {
        status: "ACTIVE"
    };

    if (section) {
        const normSection = normalizeSection(section);
        if (!VALID_SECTIONS.includes(normSection)) {
            throw new Error("Invalid UCAT section.");
        }

        filters.section = normSection;
    }

    if (topic) {
        filters.topic = topic;
    }

    if (difficulty) {
        if (!VALID_DIFFICULTIES.includes(difficulty)) {
            throw new Error("Invalid difficulty.");
        }

        filters.difficulty = difficulty;
    }

    if (questionType) {
        filters.questionType = questionType;
    }

    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.min(
        Math.max(Number(limit) || 20, 1),
        100
    );

    return questionRepository.getQuestions(
        filters,
        {
            page: safePage,
            limit: safeLimit
        }
    );
};

const getQuestionById = async (id) => {
    if (!id || isNaN(Number(id))) {
        throw new Error("Valid question ID is required.");
    }

    const question =
        await questionRepository.getQuestionById(id);

    if (!question) {
        const error = new Error("Question not found.");
        error.statusCode = 404;
        throw error;
    }

    return question;
};

const getQuestionsBySection = async (
    section,
    query = {}
) => {
    const normSection = normalizeSection(section);
    if (!VALID_SECTIONS.includes(normSection)) {
        throw new Error("Invalid UCAT section. Valid sections: " + VALID_SECTIONS.join(", "));
    }

    return questionRepository.getQuestionsBySection(
        normSection,
        {
            page: Math.max(Number(query.page) || 1, 1),
            limit: Math.min(
                Math.max(Number(query.limit) || 20, 1),
                100
            )
        }
    );
};

const getQuestionsByTopic = async (
    topic,
    query = {}
) => {
    if (!topic) {
        throw new Error("Topic is required.");
    }

    return questionRepository.getQuestionsByTopic(
        topic,
        {
            page: Math.max(Number(query.page) || 1, 1),
            limit: Math.min(
                Math.max(Number(query.limit) || 20, 1),
                100
            )
        }
    );
};

const getQuestionFilters = async () => {
    return questionRepository.getQuestionFilters();
};

module.exports = {
    getQuestions,
    getQuestionById,
    getQuestionsBySection,
    getQuestionsByTopic,
    getQuestionFilters
};