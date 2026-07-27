"use strict";

const gemini = require("./gemini.service");
const prompt = require("../prompts/seo.prompt");
const { AI_FEATURES } = require("../constants/ai.constants");

exports.generate = async (payload, context) => {
    const request = prompt(payload);
    return gemini.generateStructured({
        feature: AI_FEATURES.SEO,
        ...request,
        adminId: context.adminId
    });
};

