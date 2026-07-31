"use strict";

const topicService = require(
    "../../services/ucat-services/topic.service"
);

const getAllTopics = async (req, res, next) => {
    try {
        const topics =
            await topicService.getAllTopics();

        return res.status(200).json({
            success: true,
            message: "UCAT topics fetched successfully.",
            data: topics
        });
    } catch (error) {
        next(error);
    }
};

const getTopicById = async (req, res, next) => {
    try {
        const topic =
            await topicService.getTopicById(
                req.params.id
            );

        return res.status(200).json({
            success: true,
            message: "UCAT topic fetched successfully.",
            data: topic
        });
    } catch (error) {
        next(error);
    }
};

const getTopicsBySection = async (
    req,
    res,
    next
) => {
    try {
        const topics =
            await topicService.getTopicsBySection(
                req.params.section
            );

        return res.status(200).json({
            success: true,
            message: "UCAT section topics fetched successfully.",
            data: topics
        });
    } catch (error) {
        next(error);
    }
};

const getTopicNamesBySection = async (
    req,
    res,
    next
) => {
    try {
        const topics =
            await topicService.getTopicNamesBySection(
                req.params.section
            );

        return res.status(200).json({
            success: true,
            message: "UCAT topic list fetched successfully.",
            data: topics
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllTopics,
    getTopicById,
    getTopicsBySection,
    getTopicNamesBySection
};