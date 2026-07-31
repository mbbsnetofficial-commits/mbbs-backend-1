"use strict";

const mongoose = require("mongoose");
const { ucatConnection } = require("../../config/database");

const ucatQuestionSchema = new mongoose.Schema(
    {
        id: { type: Number, required: true, unique: true, index: true },
        question: { type: String, required: true, trim: true },
        option_a: { type: String },
        option_b: { type: String },
        option_c: { type: String },
        option_d: { type: String },
        correct_answer: { type: String, required: true },
        explanation: { type: String, trim: true },
        difficulty: { type: String, index: true },
        question_type: { type: String, index: true },
        topic_id: { type: Number, index: true },
        topic_name: { type: String, trim: true },
        subject: { type: String, index: true },
        chapter: { type: String, trim: true }
    },
    {
        timestamps: true,
        collection: "ucat-questions",
        strict: false
    }
);

const UcatQuestion =
    ucatConnection.models.UcatQuestion ||
    ucatConnection.model("UcatQuestion", ucatQuestionSchema);

module.exports = UcatQuestion;
