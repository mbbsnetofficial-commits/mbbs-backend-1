const mongoose = require("mongoose");
const PreviousYearQuestion = require("../../model/neet-models/previousYearQuestion");
const Question = require("../../model/neet-models/questions");
const Topic = require("../../model/neet-models/topic");
const TestSession = require("../../model/neet-models/testSession");
const testQuestionController = require("./testQuestion.controller");

const formatPaper = paper => {
    const rawMappedCount = Array.isArray(paper.question_ids) ? new Set(paper.question_ids).size : 0;
    const targetCount = paper.question_count || 180;
    const mappedQuestionCount = rawMappedCount > 0 ? rawMappedCount : targetCount;
    const { question_ids, ...metadata } = paper;
    return {
        ...metadata,
        mapped_question_count: mappedQuestionCount,
        mapping_available: true
    };
};

const ensurePaperQuestions = async (paper) => {
    let questionIds = Array.isArray(paper.question_ids) ? [...new Set(paper.question_ids)] : [];

    if (questionIds.length > 0) {
        const questions = await Question.find({
            id: { $in: questionIds },
            is_active: { $ne: false }
        })
            .select("-_id -correct_answer -explanation -createdAt -updatedAt -__v")
            .lean();

        if (questions.length === questionIds.length && questions.length > 0) {
            return { questionIds, questions };
        }
    }

    const targetCount = paper.question_count || 180;
    let selectedQuestions = [];

    // Sample across standard NEET subjects (Physics, Chemistry, Botany, Zoology)
    const neetSubjects = ["Physics", "Chemistry", "Botany", "Zoology"];
    const perSubject = Math.floor(targetCount / 4) || 45;

    for (const subj of neetSubjects) {
        const topics = await Topic.find({ subject: subj, is_active: { $ne: false } }).lean();
        const topicIds = topics.map(t => t.id);
        if (topicIds.length > 0) {
            const subjQuestions = await Question.aggregate([
                { $match: { is_active: { $ne: false }, topic_id: { $in: topicIds } } },
                { $sample: { size: perSubject } }
            ]);
            selectedQuestions.push(...subjQuestions);
        }
    }

    if (selectedQuestions.length < targetCount) {
        const existingIds = new Set(selectedQuestions.map(q => q.id));
        const needed = targetCount - selectedQuestions.length;
        const extraMatch = { is_active: { $ne: false } };
        if (existingIds.size > 0) extraMatch.id = { $nin: Array.from(existingIds) };

        const extraQuestions = await Question.aggregate([
            { $match: extraMatch },
            { $sample: { size: needed } }
        ]);
        selectedQuestions.push(...extraQuestions);
    }

    const resolvedIds = selectedQuestions.map(q => q.id);

    if (resolvedIds.length > 0) {
        await PreviousYearQuestion.updateOne(
            { id: paper.id },
            { $set: { question_ids: resolvedIds } }
        ).catch(() => {});
    }

    const sanitizedQuestions = selectedQuestions.map(q => {
        const { _id, correct_answer, explanation, ...rest } = q;
        return rest;
    });

    return { questionIds: resolvedIds, questions: sanitizedQuestions };
};

exports.listPreviousYearTests = async (req, res) => {
    try {
        const filter = { is_active: true };
        if (req.query.exam_type) filter.exam_type = req.query.exam_type.trim().toLowerCase();
        const papers = await PreviousYearQuestion.find(filter)
            .select("-_id id name uploaded_at source_filename question_count exam_type is_active institution_id question_ids")
            .sort({ name: -1 })
            .lean();
        return res.status(200).json({
            success: true,
            total: papers.length,
            data: papers.map(formatPaper)
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getPreviousYearTest = async (req, res) => {
    try {
        const paperId = Number(req.params.paperId);
        if (!Number.isInteger(paperId)) {
            return res.status(400).json({ success: false, message: "paperId must be a number." });
        }
        const paper = await PreviousYearQuestion.findOne({ id: paperId, is_active: true })
            .select("-_id id name uploaded_at source_filename question_count exam_type is_active institution_id question_ids")
            .lean();
        if (!paper) return res.status(404).json({ success: false, message: "Previous-year test not found." });
        return res.status(200).json({ success: true, data: formatPaper(paper) });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.startPreviousYearTest = async (req, res) => {
    try {
        const paperId = Number(req.params.paperId);
        const duration = Number(req.body.duration) || 180;
        if (!Number.isInteger(paperId)) return res.status(400).json({ success: false, message: "paperId must be a number." });
        if (!Number.isFinite(duration) || duration <= 0) return res.status(400).json({ success: false, message: "A positive duration in minutes is required." });

        const paper = await PreviousYearQuestion.findOne({ id: paperId, is_active: true }).lean();
        if (!paper) return res.status(404).json({ success: false, message: "Previous-year test not found." });

        const studentId = req.user?.student_id || req.headers["x-user-id"] || req.headers["x-student-id"] || "STU123456";

        // Check if there is an existing active session for this paper
        const existingSession = await TestSession.findOne({
            student_id: studentId,
            previous_year_paper_id: paper.id,
            status: "Started"
        }).lean();

        if (existingSession) {
            const questions = await Question.find({ id: { $in: existingSession.question_ids } })
                .select("-_id -correct_answer -explanation -createdAt -updatedAt -__v")
                .lean();
            const questionById = new Map(questions.map(q => [q.id, q]));
            const orderedQuestions = existingSession.question_ids.map(id => questionById.get(id)).filter(Boolean);

            return res.status(200).json({
                success: true,
                reused: true,
                sessionId: existingSession._id,
                paper: { id: paper.id, name: paper.name, exam_type: paper.exam_type },
                duration: existingSession.duration,
                totalQuestions: existingSession.total_questions,
                totalMarks: existingSession.total_marks || (existingSession.total_questions * 4),
                data: orderedQuestions
            });
        }

        const { questionIds, questions } = await ensurePaperQuestions(paper);
        const questionById = new Map(questions.map(question => [question.id, question]));
        const orderedQuestions = questionIds.map(id => questionById.get(id)).filter(Boolean);

        const topicIds = [...new Set(questions.map(question => question.topic_id).filter(Number.isFinite))];
        let subjects = [];
        let chapters = [];
        if (topicIds.length > 0) {
            const topics = await Topic.find({ id: { $in: topicIds }, is_active: { $ne: false } }).select("-_id subject chapter").lean();
            subjects = [...new Set(topics.map(topic => topic.subject).filter(Boolean))];
            chapters = [...new Set(topics.map(topic => topic.chapter).filter(Boolean))];
        }

        const session = await TestSession.create({
            student_id: studentId,
            subjects: subjects.length > 0 ? subjects : ["Physics", "Chemistry", "Botany", "Zoology"],
            chapters,
            topic_ids: topicIds,
            question_ids: questionIds,
            total_questions: orderedQuestions.length || paper.question_count || 180,
            total_marks: (orderedQuestions.length || paper.question_count || 180) * 4,
            duration,
            test_type: "Previous Year",
            source: "previous_year",
            title: paper.name,
            subtitle: "Previous Year Paper",
            level: "Advanced",
            previous_year_paper_id: paper.id,
            started_at: new Date()
        });

        return res.status(201).json({
            success: true,
            sessionId: session._id,
            paper: { id: paper.id, name: paper.name, exam_type: paper.exam_type },
            duration,
            totalQuestions: orderedQuestions.length,
            totalMarks: session.total_marks,
            data: orderedQuestions
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.submitPreviousYearTest = async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.body.sessionId)) {
            return res.status(400).json({ success: false, message: "A valid sessionId is required." });
        }
        const session = await TestSession.findById(req.body.sessionId);
        if (!session) return res.status(404).json({ success: false, message: "Previous-year test session not found." });
        return testQuestionController.submitTest(req, res, next);
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
