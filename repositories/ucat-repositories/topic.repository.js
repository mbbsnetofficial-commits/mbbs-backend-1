"use strict";

const UcatTopic = require(
    "../../model/ucat-model/ucatTopic"
);

const getAllTopics = async () => {
    return UcatTopic.find({
        status: "ACTIVE"
    })
        .sort({
            section: 1,
            order: 1
        })
        .lean();
};

const getTopicById = async (topicId) => {
    return UcatTopic.findOne({
        topicId: Number(topicId),
        status: "ACTIVE"
    }).lean();
};

const getTopicsBySection = async (section) => {
    return UcatTopic.find({
        section,
        status: "ACTIVE"
    })
        .sort({
            order: 1
        })
        .lean();
};

const getTopicNamesBySection = async (section) => {
    return UcatTopic.find(
        {
            section,
            status: "ACTIVE"
        },
        {
            topicId: 1,
            name: 1,
            section: 1,
            order: 1,
            _id: 0
        }
    )
        .sort({
            order: 1
        })
        .lean();
};

module.exports = {
    getAllTopics,
    getTopicById,
    getTopicsBySection,
    getTopicNamesBySection
};