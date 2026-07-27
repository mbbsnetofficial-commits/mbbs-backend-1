"use strict";

const extractJson = text => {
    const value = String(text || "").trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, "");
    try {
        return JSON.parse(value);
    } catch (_error) {
        const objectStart = value.indexOf("{");
        const objectEnd = value.lastIndexOf("}");
        const arrayStart = value.indexOf("[");
        const arrayEnd = value.lastIndexOf("]");
        const candidates = [];
        if (objectStart >= 0 && objectEnd > objectStart) {
            candidates.push(value.slice(objectStart, objectEnd + 1));
        }
        if (arrayStart >= 0 && arrayEnd > arrayStart) {
            candidates.push(value.slice(arrayStart, arrayEnd + 1));
        }
        for (const candidate of candidates) {
            try {
                return JSON.parse(candidate);
            } catch (_ignored) {
                // Continue to the next candidate.
            }
        }
        return null;
    }
};

module.exports = { extractJson };

