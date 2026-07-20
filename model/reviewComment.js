const mongoose = require("mongoose");
const { REVIEW_TYPE_ENUM, REVIEW_STATUS_ENUM } = require("../constants/enum");

const reviewCommentSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auth",
        required: true,
        index: true
    },
    student_id: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    review_type: {
        type: String,
        required: true,
        enum: REVIEW_TYPE_ENUM
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    test_session_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TestSession",
        default: null,
        index: true
    },
    status: {
        type: String,
        enum: REVIEW_STATUS_ENUM,
        default: "pending"
    }
}, {
    collection: "review-comments",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false
});

reviewCommentSchema.index({ student_id: 1, created_at: -1 });

module.exports = mongoose.model("ReviewComment", reviewCommentSchema);
