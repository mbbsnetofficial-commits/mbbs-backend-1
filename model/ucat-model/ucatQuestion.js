"use strict";

const mongoose = require("mongoose");
const { ucatConnection } = require("../../config/database");

const ucatQuestionSchema = new mongoose.Schema(
    {
        questionId: {
            type: Number,
            required: true,
            unique: true,
            index: true
        },
        section: {
            type: String,
            required: true,
            enum: [
                "VERBAL_REASONING",
                "DECISION_MAKING",
                "QUANTITATIVE_REASONING",
                "SITUATIONAL_JUDGEMENT"
            ],
            index: true
        },
        topic: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        subtopic: {
            type: String,
            trim: true
        },
        difficulty: {
            type: String,
            enum: ["EASY", "MEDIUM", "HARD"],
            default: "MEDIUM",
            index: true
        },
        questionType: {
            type: String,
            trim: true,
            index: true
        },
        passageText: {
            type: String,
            trim: true
        },
        prompt: {
            type: String,
            required: true,
            trim: true
        },
        options: [
            {
                key: { type: String, required: true },
                text: { type: String, required: true }
            }
        ],
        correctAnswer: {
            type: String,
            required: true
        },
        explanation: {
            type: String,
            trim: true
        },
        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE", "DRAFT"],
            default: "ACTIVE",
            index: true
        }
    },
    {
        timestamps: true,
        collection: "ucat_questions"
    }
);

const UcatQuestion = ucatConnection.model("UcatQuestion", ucatQuestionSchema);

module.exports = UcatQuestion;
