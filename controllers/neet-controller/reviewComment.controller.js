const mongoose = require("mongoose");
const ReviewComment = require("../../model/neet-models/reviewComment");
const TestSession = require("../../model/neet-models/testSession");
const { REVIEW_TYPE_ENUM } = require("../../constants/enum");

exports.createReviewComment = async (req, res) => {
    try {
        const studentId = req.user.student_id;
        const userId = req.user.id;
        const reviewType = req.body.review_type;
        const comment = typeof req.body.comment === "string"
            ? req.body.comment.trim()
            : "";
        const rating = req.body.rating === undefined || req.body.rating === null
            ? null
            : Number(req.body.rating);
        const testSessionId = req.body.test_session_id || null;

        if (!studentId || !userId) {
            return res.status(400).json({
                status: "fail",
                message: "User details are missing from the authentication token."
            });
        }
        if (!REVIEW_TYPE_ENUM.includes(reviewType)) {
            return res.status(400).json({
                status: "fail",
                message: `review_type must be one of: ${REVIEW_TYPE_ENUM.join(", ")}.`
            });
        }
        if (!comment || comment.length > 2000) {
            return res.status(400).json({
                status: "fail",
                message: "comment is required and cannot exceed 2000 characters."
            });
        }
        if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
            return res.status(400).json({
                status: "fail",
                message: "rating must be an integer from 1 to 5."
            });
        }

        if (testSessionId) {
            if (!mongoose.isValidObjectId(testSessionId)) {
                return res.status(400).json({
                    status: "fail",
                    message: "test_session_id must be a valid MongoDB ID."
                });
            }

            const ownsSession = await TestSession.exists({
                _id: testSessionId,
                student_id: studentId
            });
            if (!ownsSession) {
                return res.status(404).json({
                    status: "fail",
                    message: "Test session not found for this student."
                });
            }
        }

        const review = await ReviewComment.create({
            user_id: userId,
            student_id: studentId,
            review_type: reviewType,
            rating,
            comment,
            test_session_id: testSessionId,
            status: "pending"
        });

        return res.status(201).json({
            status: "success",
            message: "Review comment submitted successfully.",
            data: review
        });
    } catch (error) {
        return res.status(500).json({ status: "fail", message: error.message });
    }
};

exports.listMyReviewComments = async (req, res) => {
    try {
        const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100);
        const filter = { user_id: req.user.id, student_id: req.user.student_id };

        if (req.query.review_type) {
            if (!REVIEW_TYPE_ENUM.includes(req.query.review_type)) {
                return res.status(400).json({
                    status: "fail",
                    message: `review_type must be one of: ${REVIEW_TYPE_ENUM.join(", ")}.`
                });
            }
            filter.review_type = req.query.review_type;
        }

        const [reviews, total] = await Promise.all([
            ReviewComment.find(filter)
                .sort({ created_at: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            ReviewComment.countDocuments(filter)
        ]);

        return res.status(200).json({
            status: "success",
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data: reviews
        });
    } catch (error) {
        return res.status(500).json({ status: "fail", message: error.message });
    }
};
