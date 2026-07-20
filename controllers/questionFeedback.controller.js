const mongoose = require("mongoose");
const QuestionFeedback = require("../model/questionFeedback");
const Question = require("../model/questions");
const TestSession = require("../model/testSession");

const feedbackTypes = [
    "incorrect_question",
    "incorrect_answer",
    "incorrect_explanation",
    "typo",
    "other"
];

exports.submitQuestionFeedback = async (req, res) => {
    try {
        const studentId = req.user.student_id;
        const { test_session_id, feedback_type } = req.body;
        const questionId = Number(req.body.question_id);
        const comment = typeof req.body.comment === "string"
            ? req.body.comment.trim()
            : "";

        if (!studentId) {
            return res.status(400).json({
                status: "fail",
                message: "student_id is missing from the authentication token."
            });
        }
        if (!mongoose.isValidObjectId(test_session_id)) {
            return res.status(400).json({
                status: "fail",
                message: "A valid test_session_id is required."
            });
        }
        if (!Number.isInteger(questionId)) {
            return res.status(400).json({
                status: "fail",
                message: "A numeric question_id is required."
            });
        }
        if (!feedbackTypes.includes(feedback_type)) {
            return res.status(400).json({
                status: "fail",
                message: `feedback_type must be one of: ${feedbackTypes.join(", ")}.`
            });
        }
        if (!comment || comment.length > 1000) {
            return res.status(400).json({
                status: "fail",
                message: "comment is required and cannot exceed 1000 characters."
            });
        }

        const testSession = await TestSession.findOne({
            _id: test_session_id,
            student_id: studentId,
            question_ids: questionId
        }).select("_id").lean();

        if (!testSession) {
            return res.status(404).json({
                status: "fail",
                message: "Test session not found, or the question does not belong to this student's test."
            });
        }

        const questionExists = await Question.exists({ id: questionId });
        if (!questionExists) {
            return res.status(404).json({ status: "fail", message: "Question not found." });
        }

        const existingFeedback = await QuestionFeedback.exists({
            student_id: studentId,
            test_session_id,
            question_id: questionId
        });

        const feedback = await QuestionFeedback.findOneAndUpdate(
            {
                student_id: studentId,
                test_session_id,
                question_id: questionId
            },
            {
                $set: {
                    feedback_type,
                    comment,
                    status: "pending"
                },
                $setOnInsert: { student_id: studentId, test_session_id, question_id: questionId }
            },
            { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        );

        const statusCode = existingFeedback ? 200 : 201;
        return res.status(statusCode).json({
            status: "success",
            message: existingFeedback
                ? "Question feedback updated successfully."
                : "Question feedback submitted successfully.",
            data: feedback
        });
    } catch (error) {
        return res.status(500).json({ status: "fail", message: error.message });
    }
};

exports.listMyQuestionFeedback = async (req, res) => {
    try {
        const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100);
        const filter = { student_id: req.user.student_id };

        if (req.query.question_id !== undefined) {
            const questionId = Number(req.query.question_id);
            if (!Number.isInteger(questionId)) {
                return res.status(400).json({
                    status: "fail",
                    message: "question_id query parameter must be numeric."
                });
            }
            filter.question_id = questionId;
        }

        const [feedback, total] = await Promise.all([
            QuestionFeedback.find(filter)
                .sort({ created_at: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            QuestionFeedback.countDocuments(filter)
        ]);

        return res.status(200).json({
            status: "success",
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data: feedback
        });
    } catch (error) {
        return res.status(500).json({ status: "fail", message: error.message });
    }
};
