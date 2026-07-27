"use strict";

const gemini = require("./gemini.service");
const { AI_FEATURES } = require("../constants/ai.constants");

exports.generate = (payload, context) => gemini.generateStructured({
    feature: AI_FEATURES.TRANSLATION,
    instruction: [
        `Translate from ${payload.sourceLanguage} to ${payload.targetLanguage}.`,
        "Preserve meaning, headings, medical terminology, and formatting.",
        'Return JSON {"translatedContent":"","targetLanguage":""}.'
    ].join(" "),
    payload,
    adminId: context.adminId
});

