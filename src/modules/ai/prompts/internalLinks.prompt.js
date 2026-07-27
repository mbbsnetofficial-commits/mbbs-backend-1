"use strict";

module.exports = payload => ({
    instruction: [
        `Choose up to ${payload.count} genuinely relevant internal links from candidates.`,
        'Return JSON {"links":[{"blogId":"","slug":"","anchorText":"","reason":""}]}.',
        "Use only candidate blogId and slug values supplied in the input."
    ].join(" "),
    payload
});

