"use strict";

module.exports = payload => ({
    instruction: [
        `Generate valid schema.org JSON-LD for ${payload.schemaType}.`,
        "Return the JSON-LD object only. Include @context, @type, headline/name, description, and url.",
        "Do not invent author, organization, rating, dates, or medical-review claims."
    ].join(" "),
    payload
});

