"use strict";

const mongoose = require("mongoose");
const { ucatConnection } = require("../../config/database");

const ucatZoneInsightSchema = new mongoose.Schema(
    {
        testSessionId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        userId: {
            type: Number,
            required: true,
            index: true
        },
        overallAccuracy: Number,
        strongSections: [{ type: String }],
        weakSections: [{ type: String }],
        recommendedFocusTopics: [{ type: String }],
        insightsSummary: String
    },
    {
        timestamps: true,
        collection: "ucat-zone-insights"
    }
);

const UcatZoneInsight =
    ucatConnection.models.UcatZoneInsight ||
    ucatConnection.model("UcatZoneInsight", ucatZoneInsightSchema);

module.exports = UcatZoneInsight;
