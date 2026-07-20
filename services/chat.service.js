const mongoose = require("mongoose");
const { GoogleGenAI } = require("@google/genai");
const ChatSession = require("../model/chatSession");
const ChatMessage = require("../model/chatMessage");
const TestSession = require("../model/testSession");
const Question = require("../model/questions");
const Topic = require("../model/topic");
const TestSubjectZoneInsight = require("../model/testSubjectZoneInsight");

class ServiceError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

const parsePagination = query => {
    const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 20, 1), 100);
    return { page, limit, skip: (page - 1) * limit };
};

const requireObjectId = (value, fieldName) => {
    if (!mongoose.isValidObjectId(value)) {
        throw new ServiceError(400, `${fieldName} is invalid.`);
    }
};

const findOwnedChatSession = async (userId, chatSessionId, requireActive = false) => {
    requireObjectId(chatSessionId, "chatSessionId");

    const filter = { _id: chatSessionId, user_id: userId };
    if (requireActive) filter.is_active = true;

    const session = await ChatSession.findOne(filter);
    if (!session) {
        throw new ServiceError(404, requireActive
            ? "Active chat session not found."
            : "Chat session not found.");
    }

    return session;
};

exports.listChatSessionsService = async (userId, query) => {
    const { page, limit, skip } = parsePagination(query);
    const filter = { user_id: userId };

    if (query.active === "true") filter.is_active = true;
    if (query.active === "false") filter.is_active = false;

    const [sessions, total] = await Promise.all([
        ChatSession.find(filter)
            .sort({ last_message_at: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        ChatSession.countDocuments(filter)
    ]);

    return { page, limit, total, totalPages: Math.ceil(total / limit), data: sessions };
};

exports.createChatSessionService = async (userId, studentId, body) => {
    const { testSessionId, title } = body;
    requireObjectId(testSessionId, "testSessionId");

    const testSession = await TestSession.findOne({
        _id: testSessionId,
        student_id: studentId,
        status: "Completed"
    }).lean();

    if (!testSession) {
        throw new ServiceError(404, "Completed test session not found for this student.");
    }

    const wrongQuestionIds = testSession.answers
        .filter(answer => !answer.is_correct && answer.selected_option)
        .map(answer => answer.question_id);

    if (wrongQuestionIds.length === 0) {
        throw new ServiceError(400, "This test has no wrong answers to review.");
    }

    return ChatSession.create({
        user_id: userId,
        test_session_id: testSession._id,
        title: title || "Test Review Chat",
        wrong_question_ids: wrongQuestionIds
    });
};

exports.getChatSessionService = async (userId, chatSessionId) => {
    return findOwnedChatSession(userId, chatSessionId);
};

exports.updateChatSessionService = async (userId, chatSessionId, body) => {
    requireObjectId(chatSessionId, "chatSessionId");

    if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
        throw new ServiceError(400, "A non-empty title is required.");
    }

    const session = await ChatSession.findOneAndUpdate(
        { _id: chatSessionId, user_id: userId },
        { title: body.title.trim() },
        { new: true, runValidators: true }
    );

    if (!session) throw new ServiceError(404, "Chat session not found.");
    return session;
};

exports.deactivateChatSessionService = async (userId, chatSessionId) => {
    requireObjectId(chatSessionId, "chatSessionId");

    const session = await ChatSession.findOneAndUpdate(
        { _id: chatSessionId, user_id: userId, is_active: true },
        { is_active: false },
        { new: true }
    );

    if (!session) throw new ServiceError(404, "Active chat session not found.");
    return session;
};

exports.getChatMessagesService = async (userId, chatSessionId, query) => {
    await findOwnedChatSession(userId, chatSessionId);
    const { page, limit, skip } = parsePagination(query);
    const filter = { chat_session_id: chatSessionId, user_id: userId };

    const [messages, total] = await Promise.all([
        ChatMessage.find(filter).sort({ createdAt: 1 }).skip(skip).limit(limit).lean(),
        ChatMessage.countDocuments(filter)
    ]);

    return { page, limit, total, totalPages: Math.ceil(total / limit), data: messages };
};

exports.sendChatMessageService = async (userId, chatSessionId, body) => {
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!message) throw new ServiceError(400, "message is required.");
    if (message.length > 4000) throw new ServiceError(400, "message cannot exceed 4000 characters.");
    if (!process.env.GEMINI_API_KEY) throw new ServiceError(503, "Gemini API is not configured.");

    const chatSession = await findOwnedChatSession(userId, chatSessionId, true);
    const testSession = await TestSession.findById(chatSession.test_session_id).lean();
    if (!testSession) throw new ServiceError(404, "Linked test session not found.");

    const wrongAnswers = testSession.answers.filter(answer =>
        !answer.is_correct && chatSession.wrong_question_ids.includes(answer.question_id)
    );
    const questions = await Question.find({
        id: { $in: wrongAnswers.map(answer => answer.question_id) }
    }).select("-_id id question option_a option_b option_c option_d correct_answer explanation").lean();

    const answerByQuestionId = new Map(
        wrongAnswers.map(answer => [answer.question_id, answer])
    );
    const reviewContext = questions.map(question => ({
        question_id: question.id,
        question: question.question,
        options: {
            A: question.option_a,
            B: question.option_b,
            C: question.option_c,
            D: question.option_d
        },
        student_answer: answerByQuestionId.get(question.id)?.selected_option,
        correct_answer: question.correct_answer,
        explanation: question.explanation
    }));

    const history = await ChatMessage.find({
        chat_session_id: chatSessionId,
        user_id: userId
    }).sort({ createdAt: -1 }).limit(12).lean();

    const contents = history.reverse().map(item => ({
        role: item.role === "assistant" ? "model" : "user",
        parts: [{ text: item.content }]
    }));
    contents.push({ role: "user", parts: [{ text: message }] });

    const configuredModel = process.env.GEMINI_MODEL || "gemini-3.5-flash";
    const fallbackModel = process.env.GEMINI_FALLBACK_MODEL || "gemini-2.5-flash";
    const models = [...new Set([configuredModel, fallbackModel])];
    const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { timeout: Number(process.env.GEMINI_TIMEOUT_MS) || 60000 }
    });

    let response;
    let usedModel;
    let lastError;

    for (const candidateModel of models) {
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                response = await ai.models.generateContent({
                    model: candidateModel,
                    contents,
                    config: {
                        systemInstruction: [
                            "You are an NEET exam tutor reviewing a student's wrong answers.",
                            "Use only the supplied test-review context for question-specific claims.",
                            "Explain why the student's choice is wrong, why the correct choice is right, and give a concise memory aid.",
                            "Do not reveal or discuss questions outside this completed test.",
                            `Test-review context: ${JSON.stringify(reviewContext)}`
                        ].join("\n"),
                        temperature: Number(process.env.GEMINI_TEMPERATURE) || 0.3,
                        maxOutputTokens: Number(process.env.GEMINI_MAX_OUTPUT_TOKENS) || 4096
                    }
                });
                usedModel = candidateModel;
                break;
            } catch (error) {
                lastError = error;
                const errorText = `${error.status || ""} ${error.message || ""}`;
                const isTemporaryError = /\b429\b|\b503\b|RESOURCE_EXHAUSTED|UNAVAILABLE/i.test(errorText);

                if (!isTemporaryError) {
                    throw new ServiceError(502, `Gemini request failed: ${error.message}`);
                }

                if (attempt < 3) {
                    const retryDelayMs = 1000 * (2 ** (attempt - 1));
                    await new Promise(resolve => setTimeout(resolve, retryDelayMs));
                }
            }

            if (response) break;
        }

        if (response) break;
    }

    if (!response) {
        throw new ServiceError(
            503,
            `Gemini is temporarily unavailable after retries: ${lastError?.message || "Unknown error"}`
        );
    }

    const assistantText = response.text?.trim();
    if (!assistantText) throw new ServiceError(502, "Gemini returned an empty response.");

    const [userMessage, assistantMessage] = await ChatMessage.create([
        { chat_session_id: chatSessionId, user_id: userId, role: "user", content: message },
        {
            chat_session_id: chatSessionId,
            user_id: userId,
            role: "assistant",
            content: assistantText,
            model: usedModel
        }
    ]);

    chatSession.last_message_at = assistantMessage.createdAt;
    await chatSession.save();

    return { userMessage, assistantMessage };
};

// Generates one complete report for every wrong answer; no client payload is needed.
exports.generateWrongAnswerInsightsService = async (userId, chatSessionId) => {
    const chatResult = await exports.sendChatMessageService(userId, chatSessionId, {
        message: [
            "Analyze all of my wrong answers from this completed test.",
            "Return only valid JSON without Markdown using this exact structure:",
            '{"focus_zone":{"Subject":["weak concept"]},"repeated_mistake":{"Subject":["mistake pattern"]},"checkpoints":["revision action"],"g_phrase":"short motivational sentence"}.',
            "Group insights under the correct subject names and analyze every wrong answer in the supplied context."
        ].join(" ")
    });

    const chatSession = await findOwnedChatSession(userId, chatSessionId);
    const testSession = await TestSession.findById(chatSession.test_session_id).lean();
    if (!testSession) throw new ServiceError(404, "Linked test session not found.");

    const questions = await Question.find({
        id: { $in: testSession.question_ids }
    }).select("-_id id topic_id").lean();
    const topics = await Topic.find({
        id: { $in: questions.map(question => question.topic_id) }
    }).select("-_id id name subject").lean();

    const topicById = new Map(topics.map(topic => [topic.id, topic]));
    const answerByQuestionId = new Map(
        testSession.answers.map(answer => [answer.question_id, answer])
    );
    const subjectTotals = new Map();
    const analyzedTopics = new Set();

    let correctTimeSpent = 0;
    let incorrectTimeSpent = 0;
    let skippedTimeSpent = 0;

    for (const question of questions) {
        const topic = topicById.get(question.topic_id);
        const subject = topic?.subject || "Unknown";
        const answer = answerByQuestionId.get(question.id);
        const selectedOption = answer?.selected_option || "";
        const timeSpent = Math.max(Number(answer?.time_spent) || 0, 0);
        const isCorrect = Boolean(answer?.is_correct && selectedOption);
        const isSkipped = !selectedOption;

        if (!subjectTotals.has(subject)) {
            subjectTotals.set(subject, {
                subject_name: subject,
                total_questions: 0,
                correct_answers: 0,
                incorrect_answers: 0,
                skipped_answers: 0,
                marks: 0,
                total_mark: 0,
                accuracy: 0
            });
        }

        const subjectData = subjectTotals.get(subject);
        subjectData.total_questions++;
        subjectData.total_mark += 4;

        if (isSkipped) {
            subjectData.skipped_answers++;
            skippedTimeSpent += timeSpent;
        } else if (isCorrect) {
            subjectData.correct_answers++;
            subjectData.marks += 4;
            correctTimeSpent += timeSpent;
        } else {
            subjectData.incorrect_answers++;
            subjectData.marks -= 1;
            incorrectTimeSpent += timeSpent;
            if (topic?.name) analyzedTopics.add(topic.name);
        }
    }

    const subjectData = [...subjectTotals.values()].map(subject => ({
        ...subject,
        accuracy: subject.total_questions === 0
            ? 0
            : Number(((subject.correct_answers / subject.total_questions) * 100).toFixed(2))
    }));

    let aiInsight;
    try {
        const jsonText = chatResult.assistantMessage.content
            .replace(/^```json\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();
        aiInsight = JSON.parse(jsonText);
    } catch (error) {
        throw new ServiceError(502, "Gemini returned insight data in an invalid JSON format.");
    }

    const totalQuestions = questions.length;
    const totalMark = totalQuestions * 4;
    const accuracy = totalQuestions === 0
        ? 0
        : Number((testSession.correct / totalQuestions).toFixed(3));

    const insight = await TestSubjectZoneInsight.findOneAndUpdate(
        {
            student_id: testSession.student_id,
            test_session_id: testSession._id
        },
        {
            $set: {
                accuracy,
                mark: testSession.score,
                total_mark: totalMark,
                checkpoints: Array.isArray(aiInsight.checkpoints) ? aiInsight.checkpoints : [],
                topics_analyzed: [...analyzedTopics],
                focus_zone: aiInsight.focus_zone || {},
                repeated_mistake: aiInsight.repeated_mistake || {},
                subject_data: subjectData,
                time_spend: {
                    total_time_spent: correctTimeSpent + incorrectTimeSpent + skippedTimeSpent,
                    correct_time_spent: correctTimeSpent,
                    skipped_time_spent: skippedTimeSpent,
                    incorrect_time_spent: incorrectTimeSpent
                },
                g_phrase: aiInsight.g_phrase || "Future Doctor, your dedication today builds tomorrow's white coat.",
                generated_by_model: chatResult.assistantMessage.model,
                created_at: new Date()
            },
            $setOnInsert: {
                id: Date.now(),
                student_id: testSession.student_id,
                test_session_id: testSession._id
            }
        },
        { new: true, upsert: true, runValidators: true }
    );

    return { ...chatResult, insight };
};

exports.getTestSubjectZoneInsightService = async (studentId, testSessionId) => {
    requireObjectId(testSessionId, "testSessionId");

    const insight = await TestSubjectZoneInsight.findOne({
        student_id: studentId,
        test_session_id: new mongoose.Types.ObjectId(testSessionId)
    }).lean();

    if (!insight) {
        throw new ServiceError(404, "Test subject zone insight not found.");
    }

    return insight;
};

exports.ServiceError = ServiceError;
