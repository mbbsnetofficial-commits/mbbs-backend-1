"use strict";

const chatService = require("../../services/ucat-services/chat.service");

const createSession = async (req, res, next) => {
    try {
        const userId = req.user ? req.user.userId : 1;
        const { testSessionId, title } = req.body;
        if (!testSessionId) {
            return res.status(400).json({ success: false, message: "testSessionId is required." });
        }
        const session = await chatService.createSession(userId, testSessionId, title);
        return res.status(201).json({
            success: true,
            message: "UCAT chat session created successfully.",
            data: session
        });
    } catch (error) {
        next(error);
    }
};

const getSession = async (req, res, next) => {
    try {
        const session = await chatService.getSession(req.params.chatSessionId);
        return res.status(200).json({
            success: true,
            message: "UCAT chat session fetched successfully.",
            data: session
        });
    } catch (error) {
        next(error);
    }
};

const listUserSessions = async (req, res, next) => {
    try {
        const userId = req.user ? req.user.userId : 1;
        const sessions = await chatService.listUserSessions(userId);
        return res.status(200).json({
            success: true,
            message: "UCAT chat sessions fetched successfully.",
            data: sessions
        });
    } catch (error) {
        next(error);
    }
};

const sendMessage = async (req, res, next) => {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ success: false, message: "content is required." });
        }
        const result = await chatService.sendMessage(req.params.chatSessionId, content);
        return res.status(200).json({
            success: true,
            message: "Message sent successfully.",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getMessages = async (req, res, next) => {
    try {
        const messages = await chatService.getMessages(req.params.chatSessionId);
        return res.status(200).json({
            success: true,
            message: "UCAT chat messages fetched successfully.",
            data: messages
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createSession,
    getSession,
    listUserSessions,
    sendMessage,
    getMessages
};
