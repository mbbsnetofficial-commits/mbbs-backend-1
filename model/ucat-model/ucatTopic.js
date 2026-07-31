"use strict";

const mongoose = require("mongoose");
const { ucatConnection } = require("../../config/database");

const ucatTopicSchema = new mongoose.Schema(
    {
        id: {
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
        subject: {
            type: String,
            required: true,
            index: true
        },
        chapter: {
            type: String,
            trim: true
        },
        icon: {
            type: String,
            default: "📚"
        }
    },
    {
        timestamps: true,
        collection: "ucat-topics",
        strict: false
    }
);

const UcatTopic =
    ucatConnection.models.UcatTopic ||
    ucatConnection.model("UcatTopic", ucatTopicSchema);

module.exports = UcatTopic;