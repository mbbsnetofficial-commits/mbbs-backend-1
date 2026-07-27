"use strict";

const gemini = require("./gemini.service");
const prompt = require("../prompts/summary.prompt");
const { AI_FEATURES } = require("../constants/ai.constants");

exports.generate = (payload, context) => gemini.generateStructured({
    feature: AI_FEATURES.SUMMARY,
    ...prompt(payload),
    adminId: context.adminId
});

