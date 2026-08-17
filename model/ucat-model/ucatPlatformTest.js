"use strict";

const mongoose = require("mongoose");
const { ucatConnection } = require("../../config/database");

const ucatPlatformTestSchema = new mongoose.Schema(
    {
        id: {
            type: Number,
            required: true,
            unique: true,
            index: true
        },
        test_name: {
            type: String,
            required: true,
            trim: true
        },
        test_code: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        test_type: {
            type: String,
            default: "Custom Test",
            trim: true
        },
        source: {
            type: String,
            default: "custom",
            trim: true
        },
        student_id: {
            type: String,
            required: true,
            index: true
        },
        subjects: [{ type: String }],
        chapters: [{ type: String }],
        topic_ids: [{ type: Number }],
        total_questions: {
            type: Number,
            required: true,
            min: 1
        },
        total_marks: {
            type: Number,
            default: 0
        },
        duration: {
            type: Number,
            required: true,
            min: 1
        },
        level: {
            type: String,
            default: "Intermediate",
            trim: true
        },
        is_active: {
            type: Boolean,
            default: true,
            index: true
        },
        is_builtin: {
            type: Boolean,
            default: false
        },
        description: {
            type: String,
            trim: true
        }
    },
    {
        collection: "ucat-platform-tests",
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        versionKey: false,
        strict: false
    }
);

ucatPlatformTestSchema.index({ student_id: 1, is_active: 1 });

const UcatPlatformTest =
    ucatConnection.models.UcatPlatformTest ||
    ucatConnection.model("UcatPlatformTest", ucatPlatformTestSchema);

module.exports = UcatPlatformTest;
