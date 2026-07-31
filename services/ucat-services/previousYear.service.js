"use strict";

const previousYearRepository = require("../../repositories/ucat-repositories/previousYear.repository");
const testSessionRepository = require("../../repositories/ucat-repositories/testSession.repository");
const UcatQuestion = require("../../model/ucat-model/ucatQuestion");

const sanitizeSessionResponse = (session) => {
    if (!session) return null;
    const doc = session.toObject ? session.toObject() : { ...session };
    delete doc.question_ids;
    return doc;
};

const listPapers = async () => {
    const papers = await previousYearRepository.listPapers();
    return papers.map((p) => ({
        id: p.id,
        paper_id: String(p.id || p._id),
        name: p.name,
        question_count: p.question_count || 233,
        duration: 120,
        total_marks: (p.question_count || 233) * 4,
        source_filename: p.source_filename,
        uploaded_at: p.uploaded_at
    }));
};

const getPaperById = async (paperId) => {
    const paper = await previousYearRepository.getPaperById(paperId);
    if (!paper) {
        const error = new Error("Previous year UCAT paper not found.");
        error.statusCode = 404;
        throw error;
    }
    return {
        id: paper.id,
        paper_id: String(paper.id || paper._id),
        name: paper.name,
        question_count: paper.question_count || 233,
        duration: 120,
        total_marks: (paper.question_count || 233) * 4,
        source_filename: paper.source_filename,
        uploaded_at: paper.uploaded_at
    };
};

const startPaperTest = async (paperId, user, payload = {}) => {
    const paper = await getPaperById(paperId);
    const { limit = 30, duration = 120, student_id } = payload;
    const studentId = student_id || (user && user.studentId ? user.studentId : "STU1784364902958UZ1WFH");

    const totalLimit = Number(limit) || 30;

    const rawQuestions = await UcatQuestion.find({})
        .select("-correct_answer -explanation")
        .limit(totalLimit)
        .lean();

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

    const sessionId = "UCAT_PREV_" + Date.now() + "_" + Math.floor(Math.random() * 1000);

    const sessionData = {
        sessionId,
        student_id: studentId,
        test_type: "Previous Year Paper",
        previous_year_paper_id: paper.paper_id,
        subjects: ["verbal_reasoning", "decision_making", "quantitative_reasoning", "abstract_reasoning", "situational_judgement"],
        chapters: [paper.name],
        topic_ids: [],
        question_ids: questionIds,
        total_questions: formattedQuestions.length,
        duration: Number(duration) || 120,
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

const submitPaperTest = async (payload = {}) => {
    const { sessionId, answers = [] } = payload;
    if (!sessionId) {
        const error = new Error("sessionId is required.");
        error.statusCode = 400;
        throw error;
    }

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

module.exports = {
    listPapers,
    getPaperById,
    startPaperTest,
    submitPaperTest
};
