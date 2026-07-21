const mongoose = require("mongoose");

const subjectDataSchema = new mongoose.Schema({
    subject_name: { type: String, required: true },
    total_questions: { type: Number, default: 0 },
    correct_answers: { type: Number, default: 0 },
    incorrect_answers: { type: Number, default: 0 },
    skipped_answers: { type: Number, default: 0 },
    marks: { type: Number, default: 0 },
    total_mark: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 }
}, { _id: false });

const timeSpendSchema = new mongoose.Schema({
    total_time_spent: { type: Number, default: 0 },
    correct_time_spent: { type: Number, default: 0 },
    skipped_time_spent: { type: Number, default: 0 },
    incorrect_time_spent: { type: Number, default: 0 }
}, { _id: false });

const testSubjectZoneInsightSchema = new mongoose.Schema({
    id: {
        type: Number,
        default: Date.now,
        index: true
    },
    student_id: {
        type: String,
        required: true,
        index: true
    },
    test_session_id: {
        // Mixed keeps existing numeric legacy IDs readable while new sessions use ObjectId.
        type: mongoose.Schema.Types.Mixed,
        required: true,
        index: true
    },
    accuracy: { type: Number, default: 0 },
    mark: { type: Number, default: 0 },
    total_mark: { type: Number, default: 0 },
    checkpoints: [{ type: String }],
    topics_analyzed: [{ type: String }],
    focus_zone: {
        type: Map,
        of: [{ type: String }],
        default: {}
    },
    repeated_mistake: {
        type: Map,
        of: [{ type: String }],
        default: {}
    },
    subject_data: [subjectDataSchema],
    time_spend: {
        type: timeSpendSchema,
        default: () => ({})
    },
    g_phrase: {
        type: String,
        default: "Future Doctor, your dedication today builds tomorrow's white coat."
    },
    generated_by_model: { type: String, default: null },
    created_at: { type: Date, default: Date.now }
}, {
    collection: "test-subject-zone-insights",
    timestamps: true
});

testSubjectZoneInsightSchema.index(
    { student_id: 1, test_session_id: 1 }
);

module.exports = mongoose.model(
    "TestSubjectZoneInsight",
    testSubjectZoneInsightSchema
);
