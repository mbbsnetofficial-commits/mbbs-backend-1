"use strict";

const UcatChatSession = require("../../model/ucat-model/ucatChatSession");
const UcatChatMessage = require("../../model/ucat-model/ucatChatMessage");

const createChatSession = async (sessionData) => {
    return UcatChatSession.create(sessionData);
};

const getChatSessionById = async (chatSessionId) => {
    return UcatChatSession.findOne({ chatSessionId, status: "ACTIVE" }).lean();
};

const listUserChatSessions = async (userId) => {
    return UcatChatSession.find({ userId, status: "ACTIVE" })
        .sort({ createdAt: -1 })
        .lean();
};

const createChatMessage = async (messageData) => {
    return UcatChatMessage.create(messageData);
};

const getSessionMessages = async (chatSessionId) => {
    return UcatChatMessage.find({ chatSessionId })
        .sort({ createdAt: 1 })
        .lean();
};

const updateChatSession = async (chatSessionId, updateData) => {
    return UcatChatSession.findOneAndUpdate(
        { chatSessionId, status: "ACTIVE" },
        { $set: updateData },
        { new: true }
    ).lean();
};

module.exports = {
    createChatSession,
    getChatSessionById,
    listUserChatSessions,
    createChatMessage,
    getSessionMessages,
    updateChatSession
};
