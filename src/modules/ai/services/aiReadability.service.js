"use strict";

const gemini = require("./gemini.service");
const prompt = require("../prompts/readability.prompt");
const { AI_FEATURES } = require("../constants/ai.constants");

exports.generate = (payload, context) => gemini.generateStructured({
    feature: AI_FEATURES.READABILITY,
    ...prompt(payload),
    adminId: context.adminId
});

