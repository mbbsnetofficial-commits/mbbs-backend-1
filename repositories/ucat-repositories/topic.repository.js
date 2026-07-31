"use strict";

const UcatTopic = require("../../model/ucat-model/ucatTopic");

const getAllTopics = async (options = {}) => {
    const { page = 1, limit = 50 } = options;
    const p = Math.max(Number(page) || 1, 1);
    const l = Math.max(Number(limit) || 50, 1);
    const skip = (p - 1) * l;

    const [topics, total] = await Promise.all([
        UcatTopic.find({}).sort({ id: 1 }).skip(skip).limit(l).lean(),
        UcatTopic.countDocuments({})
    ]);

    return { topics, total, page: p, limit: l, totalPages: Math.ceil(total / l) };
};

const getTopicById = async (topicId) => {
    const numId = Number(topicId);
    const conditions = [];
    if (!isNaN(numId)) {
        conditions.push({ id: numId });
        conditions.push({ topicId: numId });
    }
    conditions.push({ id: String(topicId) });
    return UcatTopic.findOne({ $or: conditions }).lean();
};

const buildSubjectFilter = (section) => {
    if (!section) return {};
    const norm = section.trim().toLowerCase().replace(/ /g, "_");
    const regex = new RegExp("^" + norm.replace(/_/g, "[ _]?") + "$", "i");
    return {
        $or: [
            { subject: norm },
            { subject: section },
            { subject: regex },
            { chapter: regex }
        ]
    };
};

const getTopicsBySection = async (section) => {
    const filter = buildSubjectFilter(section);
    return UcatTopic.find(filter).sort({ id: 1 }).lean();
};

const getTopicNamesBySection = async (section) => {
    const filter = buildSubjectFilter(section);
    return UcatTopic.find(filter, {
        id: 1,
        topicId: 1,
        name: 1,
        subject: 1,
        chapter: 1,
        _id: 0
    })
        .sort({ id: 1 })
        .lean();
};

module.exports = {
    getAllTopics,
    getTopicById,
    getTopicsBySection,
    getTopicNamesBySection
};