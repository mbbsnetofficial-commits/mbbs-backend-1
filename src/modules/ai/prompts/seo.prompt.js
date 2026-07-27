"use strict";

module.exports = payload => ({
    instruction: [
        "Generate a complete SEO suggestion.",
        "Return JSON with: slug, metaTitle (50-60 characters), metaDescription (140-160 characters),",
        "metaKeywords (array), robots, openGraph {title,description,imageAlt,type},",
        "twitter {card,title,description}, sitemap {priority,changeFrequency}, schemaType."
    ].join(" "),
    payload
});

