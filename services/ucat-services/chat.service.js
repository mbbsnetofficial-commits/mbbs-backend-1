"use strict";

const { GoogleGenAI } = require("@google/genai");
const chatRepository = require("../../repositories/ucat-repositories/chat.repository");
const testSessionRepository = require("../../repositories/ucat-repositories/testSession.repository");
const UcatQuestion = require("../../model/ucat-model/ucatQuestion");
const { getGeminiConfig } = require("../../src/modules/ai/config/gemini.config");

const createSession = async (userId, testSessionId, title) => {
    if (!testSessionId) {
        const error = new Error("testSessionId is required.");
        error.statusCode = 400;
        throw error;
    }

    const testSession = await testSessionRepository.getSessionById(testSessionId);
    if (!testSession) {
        const error = new Error("UCAT test session not found.");
        error.statusCode = 404;
        throw error;
    }

    // Extract wrong answers from completed or submitted test session
    const answers = Array.isArray(testSession.answers) ? testSession.answers : [];
    const wrongAnswers = answers.filter(answer => answer && !answer.is_correct);

    const wrongQuestionIds = wrongAnswers
        .map(a => Number(a.question_id))
        .filter(id => !isNaN(id));

    const chatSessionId = "UCHAT_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
    const sessionData = {
        chatSessionId,
        userId: userId || testSession.student_id || testSession.userId || 1,
        testSessionId,
        title: title?.trim() || "UCAT Test Review Chat",
        wrongQuestionIds,
        status: "ACTIVE"
    };

    return chatRepository.createChatSession(sessionData);
};

const getSession = async (chatSessionId) => {
    if (!chatSessionId) {
        const error = new Error("chatSessionId parameter is required.");
        error.statusCode = 400;
        throw error;
    }

    const session = await chatRepository.getChatSessionById(chatSessionId);
    if (!session) {
        const error = new Error("UCAT chat session not found.");
        error.statusCode = 404;
        throw error;
    }
    return session;
};

const listUserSessions = async (userId) => {
    const uid = userId || 1;
    const sessions = await chatRepository.listUserChatSessions(uid);
    // If strict match returns empty, fallback to flexible match if needed
    if (!sessions || sessions.length === 0) {
        const altUid = typeof uid === "number" ? String(uid) : Number(uid);
        if (altUid) {
            const altSessions = await chatRepository.listUserChatSessions(altUid);
            if (altSessions && altSessions.length > 0) return altSessions;
        }
    }
    return sessions || [];
};

const sendMessage = async (chatSessionId, content) => {
    if (!content || typeof content !== "string" || !content.trim()) {
        const error = new Error("content is required.");
        error.statusCode = 400;
        throw error;
    }

    const session = await getSession(chatSessionId);
    const testSession = await testSessionRepository.getSessionById(session.testSessionId);

    // Build wrong answers context from linked test session and UcatQuestion details
    let reviewContext = [];
    if (testSession && Array.isArray(testSession.answers)) {
        const wrongAnswers = testSession.answers.filter(answer => answer && !answer.is_correct);
        const wrongQIds = wrongAnswers.map(a => Number(a.question_id)).filter(id => !isNaN(id));

        // Fetch question details from UcatQuestion collection
        let questions = [];
        if (wrongQIds.length > 0) {
            questions = await UcatQuestion.find({ id: { $in: wrongQIds } }).lean();
        }

        // Fallback to embedded testSession.questions if UcatQuestion collection query yields fewer records
        if (!questions.length && Array.isArray(testSession.questions)) {
            questions = testSession.questions.filter(q => wrongQIds.includes(Number(q.question_id || q.id)));
        }

        const answerByQId = new Map(wrongAnswers.map(a => [Number(a.question_id), a]));

        reviewContext = questions.map(q => {
            const qId = Number(q.id || q.question_id);
            const studentAns = answerByQId.get(qId);
            return {
                question_id: qId,
                question: q.question,
                options: {
                    A: q.option_a,
                    B: q.option_b,
                    C: q.option_c,
                    D: q.option_d
                },
                student_answer: studentAns?.selected_option || "None/Skipped",
                correct_answer: q.correct_answer,
                explanation: q.explanation || "Review premise logic.",
                subject: q.subject,
                topic: q.topic_name
            };
        });
    }

    // Persist User Message
    const userMessage = await chatRepository.createChatMessage({
        messageId: "MSG_" + Date.now() + "_U_" + Math.floor(Math.random() * 1000),
        chatSessionId,
        sender: "USER",
        content: content.trim()
    });

    // Fetch conversation history (up to last 12 messages)
    const history = await chatRepository.getSessionMessages(chatSessionId);
    const recentHistory = (history || []).slice(-12);

    const contents = recentHistory.map(item => ({
        role: item.sender === "AI" ? "model" : "user",
        parts: [{ text: item.content }]
    }));

    // System instruction grounding Gemini AI tutor in student's wrong test answers
    const systemInstruction = [
        "You are an expert UCAT exam AI tutor helping a student review their test performance.",
        "Ground all your explanations and feedback in the student's actual wrong test answers provided below.",
        "Test-Review Context (Student's Wrong Answers):",
        JSON.stringify(reviewContext, null, 2),
        "Instructions:",
        "1. Explain clearly why the student's selected option is incorrect.",
        "2. Explain why the correct answer is right using UCAT reasoning principles (Verbal Reasoning, Decision Making, Quantitative Reasoning, Abstract Reasoning, Situational Judgement).",
        "3. Provide a concise, memorable tip or strategy for tackling similar UCAT questions in the future.",
        "4. Remain encouraging, supportive, and focused."
    ].join("\n");

    let aiResponseText = "";
    let geminiConfig;
    try {
        geminiConfig = getGeminiConfig();
    } catch {
        // Fallback if environment Gemini API keys are missing
        geminiConfig = null;
    }

    if (geminiConfig && geminiConfig.apiKeys.length > 0) {
        const models = [...new Set([geminiConfig.model, geminiConfig.fallbackModel])];

        for (const candidateModel of models) {
            let modelSuccess = false;

            for (const apiKey of geminiConfig.apiKeys) {
                try {
                    const ai = new GoogleGenAI({
                        apiKey,
                        httpOptions: { timeout: geminiConfig.timeoutMs }
                    });

                    const response = await ai.models.generateContent({
                        model: candidateModel,
                        contents,
                        config: {
                            systemInstruction,
                            maxOutputTokens: geminiConfig.maxOutputTokens
                        }
                    });

                    const text = response.text?.trim();
                    if (text) {
                        aiResponseText = text;
                        modelSuccess = true;
                        break;
                    }
                } catch {
                    // Key fallback iteration
                }
            }

            if (modelSuccess) break;
        }
    }

    // Fallback response if AI inference is unavailable or keys fail
    if (!aiResponseText) {
        if (reviewContext.length > 0) {
            const firstQ = reviewContext[0];
            aiResponseText = `I have reviewed your UCAT test session. Regarding Question #${firstQ.question_id} ("${(firstQ.question || "").slice(0, 50)}..."), your answer was "${firstQ.student_answer}", but the correct answer is "${firstQ.correct_answer}". Explanation: ${firstQ.explanation}`;
        } else {
            aiResponseText = `I have reviewed your inquiry regarding "${content.slice(0, 40)}...". Focus on analyzing the premise logically and evaluating each option systematically.`;
        }
    }

    // Persist AI Message
    const aiMessage = await chatRepository.createChatMessage({
        messageId: "MSG_" + Date.now() + "_AI_" + Math.floor(Math.random() * 1000),
        chatSessionId,
        sender: "AI",
        content: aiResponseText
    });

    // Update chat session timestamp
    await chatRepository.updateChatSession(chatSessionId, { updatedAt: new Date() });

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
