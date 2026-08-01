"use strict";

const testSessionRepository = require("../../repositories/ucat-repositories/testSession.repository");
const UcatQuestion = require("../../model/ucat-model/ucatQuestion");
const UcatTopic = require("../../model/ucat-model/ucatTopic");

const sanitizeSessionResponse = (session) => {
    if (!session) return null;
    const doc = session.toObject ? session.toObject() : { ...session };
    delete doc.question_ids;
    return doc;
};

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

// --- STEP 1: GET SUBJECTS ---
const getSubjects = async () => {
    const CANONICAL = [
        "VERBAL_REASONING",
        "DECISION_MAKING",
        "QUANTITATIVE_REASONING",
        "ABSTRACT_REASONING",
        "SITUATIONAL_JUDGEMENT"
    ];
    return {
        success: true,
        total: CANONICAL.length,
        data: CANONICAL
    };
};

// --- STEP 2: GET CHAPTERS ---
const getChapters = async (payload = {}) => {
    const { subjects = [] } = payload;
    if (!subjects || subjects.length === 0) {
        const error = new Error("Please select subject.");
        error.statusCode = 400;
        throw error;
    }

    const regexes = subjects.map(
        (s) => new RegExp("^" + String(s).trim().toLowerCase().replace(/_/g, "[ _]?") + "$", "i")
    );

    const chapters = await UcatTopic.aggregate([
        { $match: { subject: { $in: regexes } } },
        { $group: { _id: "$chapter" } },
        { $match: { _id: { $ne: null } } },
        { $project: { _id: 0, chapter: "$_id" } },
        { $sort: { chapter: 1 } }
    ]);

    return {
        success: true,
        total: chapters.length,
        data: chapters
    };
};

// --- STEP 3: GET TOPICS ---
const getTopics = async (payload = {}) => {
    const { subjects = [], chapters = [] } = payload;
    const query = {};

    if (subjects.length > 0) {
        query.subject = {
            $in: subjects.map(
                (s) => new RegExp("^" + String(s).trim().toLowerCase().replace(/_/g, "[ _]?") + "$", "i")
            )
        };
    }
    if (chapters.length > 0) {
        query.chapter = {
            $in: chapters.map((c) => new RegExp(String(c).trim(), "i"))
        };
    }

    const topics = await UcatTopic.find(query).sort({ name: 1 }).lean();

    return {
        success: true,
        total: topics.length,
        data: topics
    };
};

// --- GET TEST OPTIONS ---
const getTestOptions = async () => {
    return {
        test_timings: [
            { value: 15, label: "15 Minutes" },
            { value: 30, label: "30 Minutes" },
            { value: 45, label: "45 Minutes" },
            { value: 60, label: "60 Minutes" },
            { value: 120, label: "120 Minutes (Full Exam)" }
        ],
        question_count_options: [
            { value: 5, label: "5 Questions" },
            { value: 10, label: "10 Questions" },
            { value: 15, label: "15 Questions" },
            { value: 20, label: "20 Questions" },
            { value: 25, label: "25 Questions" },
            { value: 30, label: "30 Questions" },
            { value: 50, label: "50 Questions" }
        ],
        test_types: [
            { code: "QUICK_TEST", name: "Quick Test" },
            { code: "CUSTOM_PRACTICE", name: "Custom Practice Test" },
            { code: "PREVIOUS_YEAR", name: "Previous Year Paper" }
        ],
        sections: [
            { code: "VERBAL_REASONING", name: "Verbal Reasoning", db_subject: "verbal_reasoning" },
            { code: "DECISION_MAKING", name: "Decision Making", db_subject: "decision_making" },
            { code: "QUANTITATIVE_REASONING", name: "Quantitative Reasoning", db_subject: "quantitative_reasoning" },
            { code: "ABSTRACT_REASONING", name: "Abstract Reasoning", db_subject: "abstract_reasoning" },
            { code: "SITUATIONAL_JUDGEMENT", name: "Situational Judgement", db_subject: "situational_judgement" }
        ]
    };
};

// --- STEP 4: START TEST SESSION ---
const startTest = async (user, payload = {}) => {
    const {
        student_id,
        subjects = [],
        chapters = [],
        topic_ids = [],
        sections = [],
        topics = [],
        questionCount,
        limit = 20,
        duration = 15
    } = payload;

    const studentId = student_id || (user && user.studentId ? user.studentId : "STU1784364902958UZ1WFH");
    const totalLimit = Number(questionCount) || Number(limit) || 20;

    const targetSubjects = subjects.length > 0 ? subjects : sections;
    const targetTopics = topics.length > 0 ? topics : chapters;

    const topicTerms = [];
    if (targetTopics.length > 0) {
        for (const t of targetTopics) {
            const clean = String(t).trim();
            topicTerms.push(new RegExp(clean, "i"));
            if (clean.includes("&")) {
                clean.split("&").forEach((part) => {
                    const p = part.trim();
                    if (p.length >= 3) {
                        topicTerms.push(new RegExp(p, "i"));
                    }
                });
            }
        }
    }

    let rawQuestions = [];

    if (targetSubjects.length > 0) {
        const perSubjectLimit = Math.ceil(totalLimit / targetSubjects.length);

        for (const subj of targetSubjects) {
            const subjectRegex = new RegExp("^" + String(subj).trim().toLowerCase().replace(/_/g, "[ _]?") + "$", "i");

            let subjectTopicFilter = null;
            if (topicTerms.length > 0) {
                subjectTopicFilter = {
                    $or: [
                        { topic_name: { $in: topicTerms } },
                        { chapter: { $in: topicTerms } }
                    ]
                };
            }

            let query = { subject: subjectRegex };
            if (topic_ids && topic_ids.length > 0) {
                query.topic_id = { $in: topic_ids.map(Number) };
            } else if (subjectTopicFilter) {
                query = { $and: [{ subject: subjectRegex }, subjectTopicFilter] };
            }

            let subjQuestions = await UcatQuestion.find(query)
                .select("-correct_answer -explanation")
                .limit(perSubjectLimit)
                .lean();

            if (subjQuestions.length === 0) {
                subjQuestions = await UcatQuestion.find({ subject: subjectRegex })
                    .select("-correct_answer -explanation")
                    .limit(perSubjectLimit)
                    .lean();
            }

            rawQuestions.push(...subjQuestions);
        }
    } else {
        let query = {};
        if (topicTerms.length > 0) {
            query.$or = [
                { topic_name: { $in: topicTerms } },
                { chapter: { $in: topicTerms } }
            ];
        }
        if (topic_ids && topic_ids.length > 0) {
            query.topic_id = { $in: topic_ids.map(Number) };
        }

        rawQuestions = await UcatQuestion.find(query)
            .select("-correct_answer -explanation")
            .limit(totalLimit)
            .lean();
    }

    if (rawQuestions.length === 0) {
        rawQuestions = await UcatQuestion.find({})
            .select("-correct_answer -explanation")
            .limit(totalLimit)
            .lean();
    }

    const shuffled = shuffleArray([...rawQuestions]).slice(0, totalLimit);
    const questionIds = shuffled.map((q) => q.id || q._id);

    const questionsFormatted = shuffled.map((q) => ({
        question_id: q.id || q._id,
        question: q.question,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        subject: q.subject,
        topic_name: q.topic_name || q.chapter || ""
    }));

    const sessionPayload = {
        sessionId: "UCAT_TEST_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
        student_id: studentId,
        test_type: payload.test_type || "Quick Test",
        subjects: targetSubjects,
        chapters: targetTopics,
        topic_ids: topic_ids.map(Number),
        total_questions: questionsFormatted.length,
        duration: Number(duration) || 15,
        score: 0,
        correct: 0,
        wrong: 0,
        skipped: questionsFormatted.length,
        accuracy: 0,
        status: "In Progress",
        started_at: new Date(),
        question_ids: questionIds
    };

    const sessionDoc = await testSessionRepository.createSession(sessionPayload);
    const resultDoc = sanitizeSessionResponse(sessionDoc);
    resultDoc.questions = questionsFormatted;
    return resultDoc;
};

// --- STEP 5: SUBMIT TEST SESSION ---
const submitTest = async (sessionId, answers = []) => {
    const session = await testSessionRepository.getSessionById(sessionId);
    if (!session) {
        const error = new Error("Test session not found.");
        error.statusCode = 404;
        throw error;
    }

    if (session.status === "Completed") {
        const error = new Error("This test session has already been submitted.");
        error.statusCode = 409;
        throw error;
    }

    let correctCount = 0;
    let wrongCount = 0;
    let totalScore = 0;
    const reviewItems = [];
    const processedAnswers = [];

    const answerMap = new Map();
    answers.forEach((ans) => {
        const qId = ans.question_id || ans.questionId;
        if (qId) {
            answerMap.set(Number(qId), ans);
        }
    });

    const questionDocs = await UcatQuestion.find({
        id: { $in: session.question_ids.map(Number) }
    }).lean();

    const questionMap = new Map();
    questionDocs.forEach((q) => questionMap.set(Number(q.id), q));

    for (const qId of session.question_ids) {
        const numId = Number(qId);
        const question = questionMap.get(numId);
        const userAns = answerMap.get(numId) || {};
        const selected = (userAns.selected_option || userAns.selected || "").trim().toUpperCase();
        const timeSpent = Math.max(Number(userAns.time_spent || userAns.timeSpent) || 0, 0);

        if (!question) continue;

        const isCorrect = selected === question.correct_answer;
        const isSkipped = !selected;
        let marksAwarded = 0;

        if (isSkipped) {
            marksAwarded = 0;
        } else if (isCorrect) {
            correctCount++;
            marksAwarded = 4;
            totalScore += 4;
        } else {
            wrongCount++;
            marksAwarded = -1;
            totalScore -= 1;
        }

        reviewItems.push({
            question_id: numId,
            selected: selected || null,
            correct_answer: question.correct_answer,
            isCorrect
        });

        processedAnswers.push({
            question_id: numId,
            selected_option: selected || null,
            is_correct: isCorrect,
            marks_awarded: marksAwarded,
            time_spent: timeSpent,
            is_skipped: isSkipped
        });
    }

    const totalQuestions = session.total_questions || questionDocs.length || 1;
    const skippedCount = Math.max(totalQuestions - correctCount - wrongCount, 0);
    const accuracyPct = Number(((correctCount / totalQuestions) * 100).toFixed(2));

    const updatePayload = {
        answers: processedAnswers,
        score: totalScore,
        correct: correctCount,
        wrong: wrongCount,
        skipped: skippedCount,
        accuracy: accuracyPct,
        status: "Completed",
        submitted_at: new Date()
    };

    await testSessionRepository.updateSession(sessionId, updatePayload);

    return {
        success: true,
        score: totalScore,
        correct: correctCount,
        wrong: wrongCount,
        skipped: skippedCount,
        accuracy: accuracyPct,
        review: reviewItems
    };
};

// --- GET SESSION RESULT ---
const getSessionResult = async (sessionId) => {
    const session = await testSessionRepository.getSessionById(sessionId);
    if (!session) {
        const error = new Error("Test session not found.");
        error.statusCode = 404;
        throw error;
    }

    const questionIds = (session.question_ids || []).map(Number);
    const questions = await UcatQuestion.find({ id: { $in: questionIds } }).lean();
    const questionMap = new Map();
    questions.forEach((q) => questionMap.set(Number(q.id), q));

    const userAnsMap = new Map();
    (session.answers || []).forEach((a) => userAnsMap.set(Number(a.question_id), a));

    const populatedQuestions = questionIds.map((qId) => {
        const q = questionMap.get(qId) || {};
        const userAns = userAnsMap.get(qId) || {};
        return {
            question_id: qId,
            question: q.question || "",
            option_a: q.option_a || "",
            option_b: q.option_b || "",
            option_c: q.option_c || "",
            option_d: q.option_d || "",
            correct_answer: q.correct_answer || "",
            explanation: q.explanation || "",
            subject: q.subject || "",
            topic_name: q.topic_name || q.chapter || "",
            selected_option: userAns.selected_option || null,
            is_correct: Boolean(userAns.is_correct),
            marks_awarded: userAns.marks_awarded || 0,
            time_spent: userAns.time_spent || 0,
            is_skipped: userAns.is_skipped !== undefined ? userAns.is_skipped : !userAns.selected_option
        };
    });

    const result = sanitizeSessionResponse(session);
    result.questions = populatedQuestions;
    return result;
};

// --- GET USER HISTORY ---
const getUserHistory = async (userId, query = {}) => {
    return testSessionRepository.getUserHistory(userId, query);
};

module.exports = {
    getSubjects,
    getChapters,
    getTopics,
    getTestOptions,
    startTest,
    submitTest,
    getSessionResult,
    getUserHistory
};
