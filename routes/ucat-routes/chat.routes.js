"use strict";

const express = require("express");
const router = express.Router();
const chatController = require("../../controllers/ucat-controller/chat.controller");

// GET /api/v1/ucat/chat/sessions - List user chat sessions
router.get("/sessions", chatController.listUserSessions);

// POST /api/v1/ucat/chat/sessions - Create new AI chat session for a test
router.post("/sessions", chatController.createSession);

// GET /api/v1/ucat/chat/sessions/:chatSessionId - Get session details
router.get("/sessions/:chatSessionId", chatController.getSession);

// GET /api/v1/ucat/chat/sessions/:chatSessionId/messages - Get chat messages
router.get("/sessions/:chatSessionId/messages", chatController.getMessages);

// POST /api/v1/ucat/chat/sessions/:chatSessionId/messages - Send message to AI tutor
router.post("/sessions/:chatSessionId/messages", chatController.sendMessage);

module.exports = router;
