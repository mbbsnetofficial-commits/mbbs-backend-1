"use strict";

const mongoose = require("mongoose");

const savedUniversitySchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auth",
        index: true
    },
    student_id: {
        type: String,
        required: [true, "Student ID is required"],
        trim: true,
        index: true
    },
    university_id: {
        type: String,
        required: [true, "University ID is required"],
        trim: true,
        index: true
    },
    university_name: {
        type: String,
        required: [true, "University name is required"],
        trim: true,
        maxlength: 250
    },
    slug: {
        type: String,
        trim: true
    },
    country: {
        type: String,
        trim: true,
        maxlength: 100
    },
    logo_url: {
        type: String,
        trim: true
    },
    tuition_fee_approx: {
        type: String,
        trim: true
    },
    saved_at: {
        type: Date,
        default: Date.now
    }
}, {
    collection: "saved-universities",
    timestamps: true,
    versionKey: false
});

savedUniversitySchema.index(
    { student_id: 1, university_id: 1 },
    { unique: true, name: "unique_student_university_save" }
);

module.exports = mongoose.model("SavedUniversity", savedUniversitySchema);
