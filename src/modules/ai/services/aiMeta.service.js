"use strict";

const gemini = require("./gemini.service");
const { AI_FEATURES } = require("../constants/ai.constants");

exports.generate = (payload, context) => gemini.generateStructured({
    feature: AI_FEATURES.META,
    instruction: [
        "Generate search metadata.",
        'Return JSON {"metaTitle":"","metaDescription":""}.',
        "Keep metaTitle between 50 and 60 characters and metaDescription between 140 and 160 characters."
    ].join(" "),
    payload,
    adminId: context.adminId
});

