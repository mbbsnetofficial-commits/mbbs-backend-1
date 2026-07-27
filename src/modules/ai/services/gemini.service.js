"use strict";

const { GoogleGenAI } = require("@google/genai");
const { getGeminiConfig } = require("../config/gemini.config");
const { BASE_SYSTEM } = require("../constants/aiPrompt.constants");
const AI_ERRORS = require("../constants/aiError.constants");
const repository = require("../repositories/ai.repository");
const { buildPrompt } = require("../utils/promptBuilder");
const { extractJson } = require("../utils/jsonExtractor");
const { withRetry } = require("../utils/aiRetry");
const { logAiError } = require("../utils/aiLogger");
const { estimateTokens } = require("../utils/tokenCounter");

const providerError = (message, statusCode = 502) =>
    Object.assign(new Error(message), { statusCode });

exports.generateStructured = async ({
    feature,
    instruction,
    payload,
    adminId = null,
    systemInstruction = BASE_SYSTEM
}) => {
    const config = getGeminiConfig();
    const models = [...new Set([config.model, config.fallbackModel])];
    const startedAt = Date.now();
    let lastError;

    for (const model of models) {
        for (const apiKey of config.apiKeys) {
            try {
                const ai = new GoogleGenAI({
                    apiKey,
                    httpOptions: { timeout: config.timeoutMs }
                });
                const response = await withRetry(() => ai.models.generateContent({
                    model,
                    contents: [{
                        role: "user",
                        parts: [{ text: buildPrompt({ instruction, payload }) }]
                    }],
                    config: {
                        systemInstruction,
                        temperature: config.temperature,
                        maxOutputTokens: config.maxOutputTokens,
                        responseMimeType: "application/json"
                    }
                }));
                const rawText = response.text?.trim();
                if (!rawText) throw providerError(AI_ERRORS.EMPTY_RESPONSE);
                const data = extractJson(rawText);
                if (data === null) throw providerError(AI_ERRORS.INVALID_RESPONSE);

                const usageMetadata = response.usageMetadata || {};
                const usage = {
                    feature,
                    model,
                    duration_ms: Date.now() - startedAt,
                    prompt_tokens: usageMetadata.promptTokenCount ||
                        estimateTokens(JSON.stringify(payload)),
                    output_tokens: usageMetadata.candidatesTokenCount ||
                        estimateTokens(rawText)
                };
                repository.createUsage({
                    ...usage,
                    admin_id: adminId,
                    status: "SUCCESS"
                }).catch(() => {});
                return { data, usage };
            } catch (error) {
                lastError = error;
                logAiError({ feature, model, error });
            }
        }
    }

    repository.createUsage({
        feature,
        model: models.at(-1),
        admin_id: adminId,
        status: "FAILED",
        duration_ms: Date.now() - startedAt,
        error: String(lastError?.message || AI_ERRORS.TEMPORARILY_UNAVAILABLE).slice(0, 1000)
    }).catch(() => {});

    const temporary = /\b429\b|\b503\b|RESOURCE_EXHAUSTED|UNAVAILABLE|timeout/i
        .test(`${lastError?.status || ""} ${lastError?.message || ""}`);
    throw providerError(
        temporary ? AI_ERRORS.TEMPORARILY_UNAVAILABLE : `Gemini request failed: ${lastError?.message}`,
        temporary ? 503 : 502
    );
};

