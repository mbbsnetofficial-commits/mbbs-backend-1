const mongoose = require("mongoose");
const PreviousYearQuestion = require("../../model/neet-models/previousYearQuestion");
const Question = require("../../model/neet-models/questions");
const Topic = require("../../model/neet-models/topic");
const TestSession = require("../../model/neet-models/testSession");
const testQuestionController = require("./testQuestion.controller");

const formatPaper = paper => {
    const mappedQuestionCount = Array.isArray(paper.question_ids)
        ? new Set(paper.question_ids).size
        : 0;
    const { question_ids, ...metadata } = paper;
    return {
        ...metadata,
        mapped_question_count: mappedQuestionCount,
        mapping_available: mappedQuestionCount === paper.question_count
    };
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
        const duration = Number(req.body.duration);
        if (!Number.isInteger(paperId)) return res.status(400).json({ success: false, message: "paperId must be a number." });
        if (!Number.isFinite(duration) || duration <= 0) return res.status(400).json({ success: false, message: "A positive duration in minutes is required." });

        const paper = await PreviousYearQuestion.findOne({ id: paperId, is_active: true }).lean();
        if (!paper) return res.status(404).json({ success: false, message: "Previous-year test not found." });

        const questionIds = Array.isArray(paper.question_ids) ? [...new Set(paper.question_ids)] : [];
        if (questionIds.length !== paper.question_count) {
            return res.status(409).json({
                success: false,
                message: `Question mapping for ${paper.name} is incomplete: ${questionIds.length} of ${paper.question_count} questions are mapped.`
            });
        }

        const questions = await Question.find({ id: { $in: questionIds } })
            .select("-_id -correct_answer -explanation -createdAt -updatedAt -__v")
            .lean();
        if (questions.length !== questionIds.length) {
            return res.status(409).json({ success: false, message: "One or more mapped questions do not exist in the questions collection." });
        }

        const questionById = new Map(questions.map(question => [question.id, question]));
        const orderedQuestions = questionIds.map(id => questionById.get(id));
        const topicIds = [...new Set(questions.map(question => question.topic_id).filter(Number.isFinite))];
        const topics = await Topic.find({ id: { $in: topicIds } }).select("-_id subject chapter").lean();
        const subjects = [...new Set(topics.map(topic => topic.subject).filter(Boolean))];
        const chapters = [...new Set(topics.map(topic => topic.chapter).filter(Boolean))];

        const session = await TestSession.create({
            student_id: req.user.student_id,
            subjects,
            chapters,
            topic_ids: topicIds,
            question_ids: questionIds,
            total_questions: questionIds.length,
            duration,
            test_type: "Previous Year",
            previous_year_paper_id: paper.id,
            started_at: new Date()
        });

        return res.status(201).json({
            success: true,
            sessionId: session._id,
            paper: { id: paper.id, name: paper.name, exam_type: paper.exam_type },
            duration,
            totalQuestions: orderedQuestions.length,
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
        const session = await TestSession.exists({
            _id: req.body.sessionId,
            student_id: req.user.student_id,
            test_type: "Previous Year"
        });
        if (!session) return res.status(404).json({ success: false, message: "Previous-year test session not found." });
        return testQuestionController.submitTest(req, res, next);
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
