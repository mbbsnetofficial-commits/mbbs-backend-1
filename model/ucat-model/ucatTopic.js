"use strict";

const mongoose = require("mongoose");
const { ucatConnection } = require("../../config/database");

const ucatTopicSchema = new mongoose.Schema(
    {
        topicId: {
            type: Number,
            required: true,
            unique: true,
            index: true
        },

        name: {
            type: String,
            required: true,
            trim: true
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

        description: {
            type: String,
            default: null,
            trim: true
        },

        icon: {
            type: String,
            default: "📚"
        },

        order: {
            type: Number,
            default: 0,
            index: true
        },

        status: {
            type: String,
            enum: [
                "ACTIVE",
                "INACTIVE"
            ],
            default: "ACTIVE",
            index: true
        }
    },
    {
        timestamps: true,
        collection: "ucat-topics"
    }
);

ucatTopicSchema.index({
    section: 1,
    order: 1
});

const UcatTopic =
    ucatConnection.models.UcatTopic ||
    ucatConnection.model(
        "UcatTopic",
        ucatTopicSchema
    );

module.exports = UcatTopic;