"use strict";

const CURRENT_MODEL = "gemini-3.6-flash";
const CURRENT_FALLBACK_MODEL = "gemini-3.5-flash-lite";

const retiredModelReplacements = {
    "gemini-2.5-flash": CURRENT_FALLBACK_MODEL,
    "models/gemini-2.5-flash": CURRENT_FALLBACK_MODEL
};

const supportedModel = (value, fallback) => {
    const model = value?.trim() || fallback;
    return retiredModelReplacements[model] || model.replace(/^models\//, "");
};

const getGeminiConfig = () => {
    const apiKeys = [
        process.env.GEMINI_API_KEY,
        process.env.GEMINI_API_KEY_2,
        process.env.GEMINI_API_KEY_3
    ].map(value => value?.trim()).filter(Boolean);

    if (!apiKeys.length) {
        throw Object.assign(new Error("Gemini API is not configured."), { statusCode: 503 });
    }

    return {
        apiKeys,
        model: supportedModel(process.env.GEMINI_MODEL, CURRENT_MODEL),
        fallbackModel: supportedModel(
            process.env.GEMINI_FALLBACK_MODEL,
            CURRENT_FALLBACK_MODEL
        ),
        timeoutMs: Number(process.env.GEMINI_TIMEOUT_MS) || 60000,
        maxOutputTokens: Number(process.env.GEMINI_MAX_OUTPUT_TOKENS) || 4096
    };
};

module.exports = {
    getGeminiConfig,
    CURRENT_MODEL,
    CURRENT_FALLBACK_MODEL
};
