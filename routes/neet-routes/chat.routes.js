const express = require("express");
const chatController = require("../../controllers/neet-controller/chat.controller");
const { protect } = require("../../utilities/auth");
const { aiLimiter } = require("../../middleware/rateLimit.middleware");

const chatRouter = express.Router();

chatRouter.use(protect);

chatRouter
    .route("/chat-sessions")
    .get(chatController.listChatSessions)
    .post(chatController.createChatSession);

chatRouter
    .route("/chat-sessions/:chatSessionId")
    .get(chatController.getChatSession)
    .patch(chatController.updateChatSession)
    .delete(chatController.deactivateChatSession);

chatRouter
    .route("/chat-sessions/:chatSessionId/messages")
    .get(chatController.getChatMessages)
    .post(aiLimiter, chatController.sendChatMessage);

// Generates insights for every wrong answer without a request payload.
chatRouter.post(
    "/chat-sessions/:chatSessionId/insights",
    aiLimiter,
    chatController.generateWrongAnswerInsights
);

// Returns the stored zone insight for one completed test.
chatRouter.get(
    "/test-subject-zone-insights/:testSessionId",
    chatController.getTestSubjectZoneInsight
);

module.exports = chatRouter;
