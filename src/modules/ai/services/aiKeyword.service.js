"use strict";

const gemini = require("./gemini.service");
const prompt = require("../prompts/keyword.prompt");
const { AI_FEATURES } = require("../constants/ai.constants");

exports.generate = (payload, context) => gemini.generateStructured({
    feature: AI_FEATURES.KEYWORDS,
    ...prompt(payload),
    adminId: context.adminId
});

