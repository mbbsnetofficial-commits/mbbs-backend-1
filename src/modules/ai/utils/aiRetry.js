"use strict";

const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

const withRetry = async (operation, attempts = 3) => {
    let lastError;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
        try {
            return await operation(attempt);
        } catch (error) {
            lastError = error;
            const temporary = /\b429\b|\b500\b|\b502\b|\b503\b|RESOURCE_EXHAUSTED|UNAVAILABLE|timeout/i
                .test(`${error.status || ""} ${error.message || ""}`);
            if (!temporary || attempt === attempts) throw error;
            await wait(500 * (2 ** (attempt - 1)));
        }
    }
    throw lastError;
};

module.exports = { withRetry };

