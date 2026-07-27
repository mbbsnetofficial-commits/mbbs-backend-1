"use strict";

const formatSuccess = (feature, result, usage) => ({
    success: true,
    message: `${feature} generated successfully.`,
    data: result,
    meta: usage
});

const formatError = error => ({
    success: false,
    message: error.message || "AI generation failed."
});

module.exports = { formatSuccess, formatError };

