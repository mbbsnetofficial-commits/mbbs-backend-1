"use strict";

const testSessionRepository = require("../../repositories/ucat-repositories/testSession.repository");
const UcatQuestion = require("../../model/ucat-model/ucatQuestion");

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

const startTest = async (user, payload = {}) => {
    const {
        student_id,
        subjects = [],
        chapters = [],
        topic_ids = [],
        sections = [],
        topics = [],
        limit = 20,
        duration = 15
    } = payload;

    const studentId = student_id || (user && user.studentId ? user.studentId : "STU1784364902958UZ1WFH");
    const totalLimit = Number(limit) || 20;

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

    rawQuestions = shuffleArray(rawQuestions).slice(0, totalLimit);

    const questionIds = rawQuestions.map((q) => q.id || q.question_id);

    const formattedQuestions = rawQuestions.map((q) => ({
        question_id: q.id || q.question_id,
        question: q.question || q.prompt,
        option_a: q.option_a || (q.options && q.options[0] ? q.options[0].text : ""),
        option_b: q.option_b || (q.options && q.options[1] ? q.options[1].text : ""),
        option_c: q.option_c || (q.options && q.options[2] ? q.options[2].text : ""),
        option_d: q.option_d || (q.options && q.options[3] ? q.options[3].text : ""),
        subject: q.subject || q.section,
        chapter: q.chapter,
        topic_name: q.topic_name || q.topic
    }));

    const sessionId = "UCAT_TEST_" + Date.now() + "_" + Math.floor(Math.random() * 1000);

    const sessionData = {
        sessionId,
        student_id: studentId,
        subjects: targetSubjects,
        chapters: targetTopics,
        topic_ids: topic_ids || [],
        question_ids: questionIds,
        total_questions: formattedQuestions.length,
        duration: Number(duration) || 15,
        score: 0,
        correct: 0,
        wrong: 0,
        skipped: formattedQuestions.length,
        accuracy: 0,
        status: "In Progress",
        started_at: new Date(),
        submitted_at: null,
        answers: [],
        questions: formattedQuestions
    };

    const createdSession = await testSessionRepository.createSession(sessionData);
    return sanitizeSessionResponse(createdSession);
};

const submitTest = async (sessionId, answers = []) => {
    const session = await testSessionRepository.getSessionById(sessionId);
    if (!session) {
        const error = new Error("Test session not found.");
        error.statusCode = 404;
        throw error;
    }

    const questionIds = session.question_ids || (session.questions ? session.questions.map((q) => q.question_id) : []);
    const fullQuestions = await UcatQuestion.find({
        $or: [{ id: { $in: questionIds } }, { question_id: { $in: questionIds } }]
    }).lean();

    const questionMap = new Map();
    for (const q of fullQuestions) {
        const qId = q.id || q.question_id;
        questionMap.set(qId, q);
    }

    let correctCount = 0;
    let wrongCount = 0;
    const processedAnswers = [];
    const reviewSummary = [];

    const ansMap = new Map();
    for (const ans of answers) {
        const qId = ans.question_id || ans.questionId;
        ansMap.set(qId, ans);
    }

    for (const qId of questionIds) {
        const q = questionMap.get(qId);
        const ans = ansMap.get(qId);

        const correctAnswer = q ? (q.correct_answer || "").trim().toUpperCase() : "";
        const selectedOption = ans ? (ans.selected_option || ans.selectedOption || "").trim().toUpperCase() : "";

        const isAttempted = Boolean(selectedOption);
        const isCorrect = isAttempted && correctAnswer === selectedOption;

        if (isAttempted) {
            if (isCorrect) correctCount++;
            else wrongCount++;
        }

        const timeSpent = ans ? (ans.time_spent || ans.timeSpentSeconds || 0) : 0;

        if (isAttempted) {
            processedAnswers.push({
                question_id: qId,
                selected_option: selectedOption,
                is_correct: isCorrect,
                time_spent: timeSpent
            });

            reviewSummary.push({
                question_id: qId,
                selected: selectedOption,
                correct_answer: correctAnswer,
                isCorrect: isCorrect
            });
        }
    }

    const totalQuestions = session.total_questions || questionIds.length;
    const skippedCount = Math.max(totalQuestions - (correctCount + wrongCount), 0);
    const score = correctCount * 4 - wrongCount;
    const accuracy = totalQuestions > 0 ? Number(((correctCount / totalQuestions) * 100).toFixed(2)) : 0;

    const updateData = {
        answers: processedAnswers,
        score,
        correct: correctCount,
        wrong: wrongCount,
        skipped: skippedCount,
        accuracy,
        status: "Completed",
        submitted_at: new Date()
    };

    await testSessionRepository.updateSession(sessionId, updateData);

    return {
        success: true,
        score,
        correct: correctCount,
        wrong: wrongCount,
        skipped: skippedCount,
        accuracy,
        review: reviewSummary
    };
};

const getSessionResult = async (sessionId) => {
    const session = await testSessionRepository.getSessionById(sessionId);
    if (!session) {
        const error = new Error("Test session not found.");
        error.statusCode = 404;
        throw error;
    }

    const questionIds = session.question_ids || (session.questions ? session.questions.map((q) => q.question_id) : []);
    const fullQuestions = await UcatQuestion.find({
        $or: [{ id: { $in: questionIds } }, { question_id: { $in: questionIds } }]
    }).lean();

    const questionMap = new Map();
    for (const q of fullQuestions) {
        const qId = q.id || q.question_id;
        questionMap.set(qId, q);
    }

    const ansMap = new Map();
    if (session.answers) {
        for (const ans of session.answers) {
            ansMap.set(ans.question_id, ans);
        }
    }

    let totalTimeSpent = 0;
    const detailedReview = [];

    for (const qId of questionIds) {
        const q = questionMap.get(qId);
        const ans = ansMap.get(qId);

        const selectedOption = ans ? ans.selected_option || "" : "";
        const isAttempted = Boolean(selectedOption);
        const isCorrect = ans ? Boolean(ans.is_correct) : false;
        const timeSpent = ans ? ans.time_spent || 0 : 0;
        totalTimeSpent += timeSpent;

        let marksAwarded = 0;
        if (isAttempted) {
            marksAwarded = isCorrect ? 4 : -1;
        }

        detailedReview.push({
            id: qId,
            question: q ? (q.question || "") : "",
            option_a: q ? (q.option_a || "") : "",
            option_b: q ? (q.option_b || "") : "",
            option_c: q ? (q.option_c || "") : "",
            option_d: q ? (q.option_d || "") : "",
            correct_answer: q ? (q.correct_answer || "") : "",
            explanation: q ? (q.explanation || "") : "",
            difficulty: q ? (q.difficulty || "Medium") : "Medium",
            question_type: q ? (q.question_type || "multiple_choice") : "multiple_choice",
            topic_id: q ? (q.topic_id || 0) : 0,
            selected_option: selectedOption,
            is_correct: isCorrect,
            marks_awarded: marksAwarded,
            time_spent: timeSpent,
            is_skipped: !isAttempted
        });
    }

    return {
        sessionId: session.sessionId || String(session._id),
        test_type: "Quick Test",
        previous_year_paper_id: null,
        status: session.status || "Completed",
        score: session.score || 0,
        correct: session.correct || 0,
        wrong: session.wrong || 0,
        skipped: session.skipped !== undefined ? session.skipped : (session.total_questions || 0),
        accuracy: session.accuracy || 0,
        total_questions: session.total_questions || questionIds.length,
        duration: session.duration || 15,
        started_at: session.started_at,
        submitted_at: session.submitted_at,
        total_time_spent: totalTimeSpent,
        review: detailedReview
    };
};

const getUserHistory = async (studentId, query) => {
    const res = await testSessionRepository.getUserHistory(studentId || "STU1784364902958UZ1WFH", query);
    if (res && Array.isArray(res.sessions)) {
        res.sessions = res.sessions.map(sanitizeSessionResponse);
    }
    return res;
};

module.exports = {
    getTestOptions,
    startTest,
    submitTest,
    getSessionResult,
    getUserHistory
};
