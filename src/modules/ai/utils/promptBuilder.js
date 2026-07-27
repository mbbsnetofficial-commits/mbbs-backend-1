"use strict";

const buildPrompt = ({ instruction, payload }) => [
    instruction,
    "",
    "INPUT:",
    JSON.stringify(payload)
].join("\n");

module.exports = { buildPrompt };

