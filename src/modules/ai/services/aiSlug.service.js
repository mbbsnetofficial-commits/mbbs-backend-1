"use strict";

const gemini = require("./gemini.service");
const { AI_FEATURES } = require("../constants/ai.constants");

exports.generate = (payload, context) => gemini.generateStructured({
    feature: AI_FEATURES.SLUG,
    instruction: [
        "Generate one concise lowercase ASCII SEO slug.",
        'Use hyphens only and return JSON {"slug":""}.'
    ].join(" "),
    payload,
    adminId: context.adminId
});

