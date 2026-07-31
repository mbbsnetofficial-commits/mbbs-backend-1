"use strict";

const mongoose = require("mongoose");
const { ucatConnection } = require("../../config/database");

const ucatChatMessageSchema = new mongoose.Schema(
    {
        messageId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        chatSessionId: {
            type: String,
            required: true,
            index: true
        },
        sender: {
            type: String,
            enum: ["USER", "AI"],
            required: true
        },
        content: {
            type: String,
            required: true
        },
        metadata: {
            questionId: Number,
            section: String,
            topic: String
        }
    },
    {
        timestamps: true,
        collection: "ucaht-messages"
    }
);

const UcatChatMessage =
    ucatConnection.models.UcatChatMessage ||
    ucatConnection.model("UcatChatMessage", ucatChatMessageSchema);

module.exports = UcatChatMessage;
