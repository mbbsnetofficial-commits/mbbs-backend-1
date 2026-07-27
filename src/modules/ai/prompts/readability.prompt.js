"use strict";

module.exports = payload => ({
    instruction: [
        "Analyze readability. Return JSON with score (0-100), gradeLevel, readingTimeMinutes,",
        "strengths (array), issues (array), and suggestions (array)."
    ].join(" "),
    payload
});

