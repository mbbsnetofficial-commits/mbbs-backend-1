const mongoose = require("mongoose");

const platformTestSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    test_name: { type: String, required: true, trim: true },
    test_code: { type: String, required: true, unique: true, trim: true },
    test_type: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    instructions: { type: String, trim: true },
    time_limit: { type: Number, required: true, min: 1 },
    total_questions: { type: Number, required: true, min: 1 },
    selected_topics: [{ type: Number }],
    is_active: { type: Boolean, default: false, index: true },
    scheduled_date_time: { type: Date },
    exam_type: { type: String, default: "neet", trim: true },
    is_institution_test: { type: Boolean, default: false },
    institution_id: { type: Number, default: null },
    expires_at: { type: Date },
    misconception_generated_at: { type: Date },
    misconception_generation_status: { type: String, trim: true }
}, {
    collection: "platform-tests",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false,
    strict: false
});

platformTestSchema.index({ is_active: 1, scheduled_date_time: -1 });
platformTestSchema.index({ institution_id: 1, is_active: 1 });

module.exports = mongoose.model("PlatformTest", platformTestSchema);
