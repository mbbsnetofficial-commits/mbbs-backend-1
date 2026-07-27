"use strict";

module.exports = payload => ({
    instruction: [
        `Create a factual summary of no more than ${payload.maxWords} words.`,
        'Return JSON {"summary":"","keyPoints":[]}.'
    ].join(" "),
    payload
});

