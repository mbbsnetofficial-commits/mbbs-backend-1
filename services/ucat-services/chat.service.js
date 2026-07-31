"use strict";

const chatRepository = require("../../repositories/ucat-repositories/chat.repository");
const testSessionRepository = require("../../repositories/ucat-repositories/testSession.repository");

const createSession = async (userId, testSessionId, title) => {
    const chatSessionId = "UCHAT_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
    const sessionData = {
        chatSessionId,
        userId: userId || 1,
        testSessionId,
        title: title || "UCAT Test Review Chat",
        status: "ACTIVE"
    };
    return chatRepository.createChatSession(sessionData);
};

const getSession = async (chatSessionId) => {
    const session = await chatRepository.getChatSessionById(chatSessionId);
    if (!session) {
        const error = new Error("UCAT chat session not found.");
        error.statusCode = 404;
        throw error;
    }
    return session;
};

const listUserSessions = async (userId) => {
    return chatRepository.listUserChatSessions(userId || 1);
};

const sendMessage = async (chatSessionId, content) => {
    const session = await getSession(chatSessionId);

    const userMessage = await chatRepository.createChatMessage({
        messageId: "MSG_" + Date.now() + "_U",
        chatSessionId,
        sender: "USER",
        content
    });

    // Mock/GenAI assistant response
    const aiResponseText = `I have reviewed your UCAT question regarding "${content.slice(0, 30)}...". Focus on analyzing the premise logically.`;

    const aiMessage = await chatRepository.createChatMessage({
        messageId: "MSG_" + Date.now() + "_AI",
        chatSessionId,
        sender: "AI",
        content: aiResponseText
    });

    return { userMessage, aiMessage };
};

const getMessages = async (chatSessionId) => {
    await getSession(chatSessionId);
    return chatRepository.getSessionMessages(chatSessionId);
};

module.exports = {
    createSession,
    getSession,
    listUserSessions,
    sendMessage,
    getMessages
};
