const mongoose = require("mongoose");

const questionFeedbackSchema = new mongoose.Schema({
    student_id: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    test_session_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TestSession",
        required: true,
        index: true
    },
    question_id: {
        type: Number,
        required: true,
        index: true
    },
    feedback_type: {
        type: String,
        required: true,
        enum: [
            "incorrect_question",
            "incorrect_answer",
            "incorrect_explanation",
            "typo",
            "other"
        ]
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    status: {
        type: String,
        enum: ["pending", "reviewed", "resolved", "rejected"],
        default: "pending"
    }
}, {
    collection: "questions-feedback",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false
});

questionFeedbackSchema.index(
    { student_id: 1, test_session_id: 1, question_id: 1 },
    { unique: true }
);

module.exports = mongoose.model("QuestionFeedback", questionFeedbackSchema);
