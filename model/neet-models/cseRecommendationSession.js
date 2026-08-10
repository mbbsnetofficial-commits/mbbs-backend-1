"use strict";

const mongoose = require("mongoose");

const matchedUniversitySchema = new mongoose.Schema({
    university_id: { type: String, required: true },
    university_name: { type: String, required: true },
    slug: { type: String },
    country: { type: String },
    match_percentage: { type: Number, default: 0 },
    tuition_fee_annual: { type: String },
    recognition: [{ type: String }]
}, { _id: false });

const cseRecommendationSessionSchema = new mongoose.Schema({
    student_id: {
        type: String,
        required: [true, "Student ID is required"],
        trim: true,
        index: true
    },
    session_id: {
        type: String,
        unique: true,
        trim: true,
        index: true
    },
    country_id: { type: String, trim: true },
    country_name: { type: String, trim: true },
    budget_range: { type: String, trim: true },
    pcb_score: { type: Number },
    neet_score: { type: Number },
    matched_universities: [matchedUniversitySchema],
    created_at: {
        type: Date,
        default: Date.now
    }
}, {
    collection: "cse-recommendation-sessions",
    timestamps: true,
    versionKey: false
});

cseRecommendationSessionSchema.index({ student_id: 1, created_at: -1 });

module.exports = mongoose.model("CseRecommendationSession", cseRecommendationSessionSchema);
