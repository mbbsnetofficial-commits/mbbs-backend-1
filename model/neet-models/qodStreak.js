"use strict";

const mongoose = require("mongoose");

const qodStreakSchema = new mongoose.Schema({
    student_id: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    current_streak: { type: Number, default: 0, min: 0 },
    longest_streak: { type: Number, default: 0, min: 0 },
    total_days_answered: { type: Number, default: 0, min: 0 },
    correct_answer_count: { type: Number, default: 0, min: 0 },
    last_answered_date: { type: String, default: null },
    streak_started_at: { type: String, default: null }
}, {
    collection: "qod-streaks",
    timestamps: true
});

module.exports = mongoose.model("QodStreak", qodStreakSchema);

