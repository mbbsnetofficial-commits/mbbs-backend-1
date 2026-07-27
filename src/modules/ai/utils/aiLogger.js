"use strict";

const logAiError = ({ feature, model, error }) => {
    if (process.env.NODE_ENV !== "test") {
        console.error(`[AI:${feature}] model=${model || "unknown"} error=${error.message}`);
    }
};

module.exports = { logAiError };

