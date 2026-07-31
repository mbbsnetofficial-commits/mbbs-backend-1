"use strict";

const questionService = require("../../services/ucat-services/question.service");

const getQuestions = async (req, res, next) => {
    try {
        const result = await questionService.getQuestions(
            req.query
        );

        return res.status(200).json({
            success: true,
            message: "UCAT questions fetched successfully.",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getQuestionById = async (req, res, next) => {
    try {
        const question =
            await questionService.getQuestionById(
                req.params.id
            );

        return res.status(200).json({
            success: true,
            message: "UCAT question fetched successfully.",
            data: question
        });
    } catch (error) {
        next(error);
    }
};

const getQuestionsBySection = async (req, res, next) => {
    try {
        const result =
            await questionService.getQuestionsBySection(
                req.params.section,
                req.query
            );

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
        const result =
            await questionService.getQuestionsByTopic(
                req.params.topic,
                req.query
            );

        return res.status(200).json({
            success: true,
            message: "UCAT topic questions fetched successfully.",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getQuestionFilters = async (req, res, next) => {
    try {
        const filters =
            await questionService.getQuestionFilters();

        return res.status(200).json({
            success: true,
            message: "UCAT question filters fetched successfully.",
            data: filters
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getQuestions,
    getQuestionById,
    getQuestionsBySection,
    getQuestionsByTopic,
    getQuestionFilters
};