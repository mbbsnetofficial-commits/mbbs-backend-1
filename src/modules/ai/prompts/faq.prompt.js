"use strict";

module.exports = payload => ({
    instruction: `Generate ${payload.count} useful FAQs. Return JSON {"faqs":[{"question":"","answer":""}]}.`,
    payload
});

