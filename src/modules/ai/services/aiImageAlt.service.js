"use strict";

const gemini = require("./gemini.service");
const { AI_FEATURES } = require("../constants/ai.constants");

exports.generate = (payload, context) => gemini.generateStructured({
    feature: AI_FEATURES.IMAGE_ALT,
    instruction: [
        "Write accessible, descriptive image ALT text from the supplied image URL and page context.",
        'Return JSON {"altText":"","caption":""}.',
        "Do not keyword-stuff and do not claim visual details that cannot be inferred safely."
    ].join(" "),
    payload,
    adminId: context.adminId
});

