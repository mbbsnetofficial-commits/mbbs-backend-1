"use strict";

const mongoose = require("mongoose");
const { ucatConnection } = require("../../config/database");

const ucatStreakSchema = new mongoose.Schema(
    {
        userId: {
            type: Number,
            required: true,
            unique: true,
            index: true
        },
        currentStreak: {
            type: Number,
            default: 0
        },
        longestStreak: {
            type: Number,
            default: 0
        },
        lastActivityDate: {
            type: String, // YYYY-MM-DD
            default: null
        },
        history: [
            {
                date: { type: String, required: true }, // YYYY-MM-DD
                activityType: { type: String, default: "PRACTICE_TEST" }
            }
        ]
    },
    {
        timestamps: true,
        collection: "ucat-streaks"
    }
);

const UcatStreak =
    ucatConnection.models.UcatStreak ||
    ucatConnection.model("UcatStreak", ucatStreakSchema);

module.exports = UcatStreak;
