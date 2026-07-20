const {
    listChatSessionsService,
    createChatSessionService,
    getChatSessionService,
    updateChatSessionService,
    deactivateChatSessionService,
    getChatMessagesService,
    sendChatMessageService,
    generateWrongAnswerInsightsService,
    getTestSubjectZoneInsightService
} = require("../services/chat.service");

const sendError = (res, error) => {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
        status: "fail",
        message: error.message || "An unexpected error occurred."
    });
};

exports.listChatSessions = async (req, res) => {
    try {
        const result = await listChatSessionsService(req.user.id, req.query);
        return res.status(200).json({ status: "success", ...result });
    } catch (error) {
        return sendError(res, error);
    }
};

exports.createChatSession = async (req, res) => {
    try {
        const session = await createChatSessionService(
            req.user.id,
            req.user.student_id,
            req.body
        );
        return res.status(201).json({ status: "success", data: session });
    } catch (error) {
        return sendError(res, error);
    }
};

exports.getChatSession = async (req, res) => {
    try {
        const session = await getChatSessionService(req.user.id, req.params.chatSessionId);
        return res.status(200).json({ status: "success", data: session });
    } catch (error) {
        return sendError(res, error);
    }
};

exports.updateChatSession = async (req, res) => {
    try {
        const session = await updateChatSessionService(
            req.user.id,
            req.params.chatSessionId,
            req.body
        );
        return res.status(200).json({ status: "success", data: session });
    } catch (error) {
        return sendError(res, error);
    }
};

exports.deactivateChatSession = async (req, res) => {
    try {
        const session = await deactivateChatSessionService(
            req.user.id,
            req.params.chatSessionId
        );
        return res.status(200).json({
            status: "success",
            message: "Chat session deactivated successfully.",
            data: session
        });
    } catch (error) {
        return sendError(res, error);
    }
};

exports.getChatMessages = async (req, res) => {
    try {
        const result = await getChatMessagesService(
            req.user.id,
            req.params.chatSessionId,
            req.query
        );
        return res.status(200).json({ status: "success", ...result });
    } catch (error) {
        return sendError(res, error);
    }
};

exports.sendChatMessage = async (req, res) => {
    try {
        const result = await sendChatMessageService(
            req.user.id,
            req.params.chatSessionId,
            req.body
        );
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        return sendError(res, error);
    }
};

exports.generateWrongAnswerInsights = async (req, res) => {
    try {
        const result = await generateWrongAnswerInsightsService(
            req.user.id,
            req.params.chatSessionId
        );
        return res.status(200).json({
            status: "success",
            message: "Insights generated for all wrong answers.",
            data: result
        });
    } catch (error) {
        return sendError(res, error);
    }
};

exports.getTestSubjectZoneInsight = async (req, res) => {
    try {
        const insight = await getTestSubjectZoneInsightService(
            req.user.student_id,
            req.params.testSessionId
        );
        return res.status(200).json({
            status: "success",
            data: insight
        });
    } catch (error) {
        return sendError(res, error);
    }
};
