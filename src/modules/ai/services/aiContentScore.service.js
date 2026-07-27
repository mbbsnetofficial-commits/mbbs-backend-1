"use strict";

const gemini = require("./gemini.service");
const { AI_FEATURES } = require("../constants/ai.constants");

exports.generate = (payload, context) => gemini.generateStructured({
    feature: AI_FEATURES.CONTENT_SCORE,
    instruction: [
        "Evaluate SEO and editorial quality.",
        "Return JSON with overallScore (0-100), seoScore, readabilityScore, structureScore,",
        "medicalSafetyScore, strengths (array), issues (array), and recommendations (array)."
    ].join(" "),
    payload,
    adminId: context.adminId
});

