"use strict";

const mongoose = require("mongoose");
const { ucatConnection } = require("../../config/database");

const ucatPreviousYearSchema = new mongoose.Schema(
    {
        id: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
            unique: true,
            index: true
        },
        name: {
            type: String,
            required: true
        },
        question_count: {
            type: Number,
            default: 233
        },
        source_filename: {
            type: String
        },
        is_active: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        collection: "previous-year-questions",
        strict: false
    }
);

const UcatPreviousYear =
    ucatConnection.models.UcatPreviousYear ||
    ucatConnection.model("UcatPreviousYear", ucatPreviousYearSchema);

module.exports = UcatPreviousYear;
