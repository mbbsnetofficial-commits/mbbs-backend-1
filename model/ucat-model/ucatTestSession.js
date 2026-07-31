"use strict";

const mongoose = require("mongoose");
const { ucatConnection } = require("../../config/database");

const ucatTestSessionSchema = new mongoose.Schema(
    {
        sessionId: {
            type: String,
            index: true
        },
        student_id: {
            type: String,
            required: true,
            index: true
        },
        subjects: [
            {
                type: String
            }
        ],
        chapters: [
            {
                type: String
            }
        ],
        topic_ids: [
            {
                type: mongoose.Schema.Types.Mixed
            }
        ],
        question_ids: [
            {
                type: Number
            }
        ],
        total_questions: {
            type: Number,
            required: true
        },
        duration: {
            type: Number,
            default: 15
        },
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
            enum: ["In Progress", "Completed", "Expired"],
            default: "In Progress",
            index: true
        },
        started_at: {
            type: Date,
            default: Date.now
        },
        submitted_at: {
            type: Date,
            default: null
        },
        answers: [
            {
                question_id: Number,
                selected_option: String,
                is_correct: Boolean,
                time_spent: Number
            }
        ],
        questions: [
            {
                question_id: Number,
                question: String,
                option_a: String,
                option_b: String,
                option_c: String,
                option_d: String,
                subject: String,
                chapter: String,
                topic_name: String
            }
        ]
    },
    {
        timestamps: true,
        collection: "ucat-test-sessions",
        strict: false
    }
);

const UcatTestSession =
    ucatConnection.models.UcatTestSession ||
    ucatConnection.model("UcatTestSession", ucatTestSessionSchema);

module.exports = UcatTestSession;
