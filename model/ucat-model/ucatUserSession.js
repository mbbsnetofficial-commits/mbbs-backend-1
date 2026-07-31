"use strict";

const mongoose = require("mongoose");
const { ucatConnection } = require("../../config/database");

const ucatUserSessionSchema = new mongoose.Schema(
    {
        userSessionId: {
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
        activeModule: {
            type: String,
            default: "UCAT_PRACTICE"
        },
        lastActiveTime: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true,
        collection: "ucat-session"
    }
);

const UcatUserSession =
    ucatConnection.models.UcatUserSession ||
    ucatConnection.model("UcatUserSession", ucatUserSessionSchema);

module.exports = UcatUserSession;
