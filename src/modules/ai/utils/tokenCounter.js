"use strict";

// Useful fallback when the provider does not include usage metadata.
const estimateTokens = text => Math.ceil(String(text || "").length / 4);

module.exports = { estimateTokens };

