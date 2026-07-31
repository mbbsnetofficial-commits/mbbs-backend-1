"use strict";

const topicRepository = require("../../repositories/ucat-repositories/topic.repository");

const VALID_SECTIONS = [
    "VERBAL_REASONING",
    "DECISION_MAKING",
    "QUANTITATIVE_REASONING",
    "ABSTRACT_REASONING",
    "SITUATIONAL_JUDGEMENT",
    "verbal_reasoning",
    "decision_making",
    "quantitative_reasoning",
    "abstract_reasoning",
    "situational_judgement"
];

const normalizeSection = (sec) => {
    if (!sec) return "";
    return sec.trim().toUpperCase().replace(/ /g, "_");
};

const getAllTopics = async (options = {}) => {
    return topicRepository.getAllTopics(options);
};

const getTopicById = async (topicId) => {
    if (!topicId || isNaN(Number(topicId))) {
        const error = new Error("Valid topic ID is required.");
        error.statusCode = 400;
        throw error;
    }

    const topic = await topicRepository.getTopicById(topicId);

    if (!topic) {
        const error = new Error("UCAT topic not found.");
        error.statusCode = 404;
        throw error;
    }

    return topic;
};

const getTopicsBySection = async (section) => {
    if (!section) {
        const error = new Error("Section is required.");
        error.statusCode = 400;
        throw error;
    }

    const normalized = normalizeSection(section);
    const isValid = VALID_SECTIONS.some(
        (s) => s.toUpperCase() === normalized
    );

    if (!isValid) {
        const error = new Error("Invalid UCAT section.");
        error.statusCode = 400;
        throw error;
    }

    return topicRepository.getTopicsBySection(section);
};

const getTopicNamesBySection = async (section) => {
    if (!section) {
        const error = new Error("Section is required.");
        error.statusCode = 400;
        throw error;
    }

    const normalized = normalizeSection(section);
    const isValid = VALID_SECTIONS.some(
        (s) => s.toUpperCase() === normalized
    );

    if (!isValid) {
        const error = new Error("Invalid UCAT section.");
        error.statusCode = 400;
        throw error;
    }

    return topicRepository.getTopicNamesBySection(section);
};

module.exports = {
    getAllTopics,
    getTopicById,
    getTopicsBySection,
    getTopicNamesBySection
};