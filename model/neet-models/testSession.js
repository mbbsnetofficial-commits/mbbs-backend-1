const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
{
    question_id: {
        type: Number,
        required: true
    },

    selected_option: {
        type: String,
        enum: ["A", "B", "C", "D", ""],
        default: ""
    },

    is_correct: {
        type: Boolean,
        default: false
    },

    marks_awarded: {
        type: Number,
        default: 0
    },

    time_spent: {
        type: Number,
        min: 0,
        default: 0
    }

}, {
    _id: false
});


const testSessionSchema = new mongoose.Schema({

    student_id: {
        type: String,
        required: true,
        index: true
    },

    subjects: [{
        type: String,
        required: true
    }],

    chapters: [{
        type: String,
        required: true
    }],

    topic_ids: [{
        type: Number
    }],

    question_ids: [{
        type: Number
    }],

    total_questions: {
        type: Number,
        required: true
    },

    duration: {
        type: Number,
        required: true
    },

    test_type: {
        type: String,
        enum: ["Quick Test", "Previous Year"],
        default: "Quick Test"
    },

    previous_year_paper_id: {
        type: Number,
        default: null
    },

    answers: [answerSchema],

    score: {
        type: Number,
        default: 0
    },

    correct: {
        type: Number,
        default: 0
    },

    wrong: {
        type: Number,
        default: 0
    },

    skipped: {
        type: Number,
        default: 0
    },

    accuracy: {
        type: Number,
        default: 0
    },

    status: {
        type: String,
        enum: [
            "Started",
            "Completed",
            "Expired"
        ],
        default: "Started"
    },

    started_at: {
        type: Date,
        default: Date.now
    },

    submitted_at: {
        type: Date
    }

},
{
    collection: "test_sessions",
    timestamps: true
});

// Speeds up student test-history and active-session queries.
testSessionSchema.index({ student_id: 1, status: 1, started_at: -1 });
// Supports completed-test leaderboard filtering and deterministic ranking.
testSessionSchema.index({
    status: 1,
    test_type: 1,
    previous_year_paper_id: 1,
    submitted_at: -1
});

module.exports = mongoose.model(
    "TestSession",
    testSessionSchema
);
