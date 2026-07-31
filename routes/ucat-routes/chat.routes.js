"use strict";

const express = require("express");
const router = express.Router();
const chatController = require("../../controllers/ucat-controller/chat.controller");
const { protect } = require("../../utilities/auth");
const { aiLimiter } = require("../../middleware/rateLimit.middleware");

// All chat routes require a valid student JWT
router.use(protect);

// GET /api/v1/ucat/chat/sessions - List user chat sessions
router.get("/sessions", chatController.listUserSessions);

// POST /api/v1/ucat/chat/sessions - Create new AI chat session for a test
router.post("/sessions", chatController.createSession);

// GET /api/v1/ucat/chat/sessions/:chatSessionId - Get session details
router.get("/sessions/:chatSessionId", chatController.getSession);

// GET /api/v1/ucat/chat/sessions/:chatSessionId/messages - Get chat messages
router.get("/sessions/:chatSessionId/messages", chatController.getMessages);

// POST /api/v1/ucat/chat/sessions/:chatSessionId/messages - Send message to AI tutor
// aiLimiter: max 15 AI requests/minute to prevent abuse of AI inference costs
router.post("/sessions/:chatSessionId/messages", aiLimiter, chatController.sendMessage);

module.exports = router;
