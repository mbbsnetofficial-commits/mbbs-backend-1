const mongoose = require("mongoose");

const previousYearQuestionSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    uploaded_at: { type: Date },
    source_filename: { type: String, trim: true },
    question_count: { type: Number, required: true, min: 1 },
    exam_type: { type: String, required: true, trim: true },
    is_active: { type: Boolean, default: true, index: true },
    deactivated_at: { type: Date, default: null },
    institution_id: { type: Number },
    uploaded_by_id: { type: Number },
    question_ids: [{ type: Number }]
}, {
    collection: "previous-year-questions",
    versionKey: false,
    strict: false
});

previousYearQuestionSchema.index({ exam_type: 1, is_active: 1, name: -1 });

module.exports = mongoose.model("PreviousYearQuestion", previousYearQuestionSchema);
