"use strict";

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
        model: process.env.GEMINI_MODEL || "gemini-3.5-flash",
        fallbackModel: process.env.GEMINI_FALLBACK_MODEL || "gemini-2.5-flash",
        timeoutMs: Number(process.env.GEMINI_TIMEOUT_MS) || 60000,
        maxOutputTokens: Number(process.env.GEMINI_MAX_OUTPUT_TOKENS) || 4096,
        temperature: Number(process.env.GEMINI_TEMPERATURE) || 0.3
    };
};

module.exports = { getGeminiConfig };

