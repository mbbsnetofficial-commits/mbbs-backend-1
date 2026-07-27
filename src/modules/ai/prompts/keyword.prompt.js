"use strict";

module.exports = payload => ({
    instruction: [
        `Extract up to ${payload.count} useful SEO keywords.`,
        'Return JSON {"primaryKeyword":"","secondaryKeywords":[],"longTailKeywords":[],"entities":[]}.'
    ].join(" "),
    payload
});

