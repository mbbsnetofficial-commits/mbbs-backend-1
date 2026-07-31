"use strict";

const mongoose = require("mongoose");
const { ucatConnection } = require("../../config/database");

const ucatChatSessionSchema = new mongoose.Schema(
    {
        chatSessionId: {
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
        testSessionId: {
            type: String,
            required: true,
            index: true
        },
        title: {
            type: String,
            default: "UCAT Test Review Chat"
        },
        status: {
            type: String,
            enum: ["ACTIVE", "ARCHIVED"],
            default: "ACTIVE"
        }
    },
    {
        timestamps: true,
        collection: "uchat-session"
    }
);

const UcatChatSession =
    ucatConnection.models.UcatChatSession ||
    ucatConnection.model("UcatChatSession", ucatChatSessionSchema);

module.exports = UcatChatSession;
