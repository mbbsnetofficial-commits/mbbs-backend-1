"use strict";

const gemini = require("./gemini.service");
const prompt = require("../prompts/faq.prompt");
const { AI_FEATURES } = require("../constants/ai.constants");

exports.generate = (payload, context) => gemini.generateStructured({
    feature: AI_FEATURES.FAQ,
    ...prompt(payload),
    adminId: context.adminId
});

