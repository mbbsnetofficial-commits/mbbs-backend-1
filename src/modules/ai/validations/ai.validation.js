"use strict";

const Joi = require("joi");
const { LIMITS } = require("../constants/ai.constants");

const title = Joi.string().trim().min(2).max(LIMITS.TITLE);
const content = Joi.string().trim().min(20).max(LIMITS.CONTENT).required();
const language = Joi.string().trim().min(2).max(LIMITS.LANGUAGE);
const baseContent = Joi.object({
    title: title.required(),
    content,
    targetAudience: Joi.string().trim().max(200).default("NEET and MBBS aspirants"),
    primaryKeyword: Joi.string().trim().max(150).allow("")
});

const schemas = {
    seo: baseContent,
    faq: baseContent.keys({
        count: Joi.number().integer().min(1).max(LIMITS.FAQ_COUNT).default(5)
    }),
    schema: baseContent.keys({
        pageUrl: Joi.string().uri({ scheme: ["http", "https"] }).max(LIMITS.URL).required(),
        schemaType: Joi.string().valid("Article", "BlogPosting", "FAQPage", "WebPage").default("Article")
    }),
    keywords: baseContent.keys({
        count: Joi.number().integer().min(1).max(LIMITS.KEYWORD_COUNT).default(15)
    }),
    slug: Joi.object({ title: title.required() }),
    meta: baseContent,
    imageAlt: Joi.object({
        imageUrl: Joi.string().uri({ scheme: ["http", "https"] }).max(LIMITS.URL).required(),
        title: title.required(),
        context: Joi.string().trim().max(1000).allow("")
    }),
    internalLinks: baseContent.keys({
        blogId: Joi.string().hex().length(24),
        count: Joi.number().integer().min(1).max(LIMITS.LINK_COUNT).default(5)
    }),
    readability: baseContent,
    summary: baseContent.keys({
        maxWords: Joi.number().integer().min(20).max(500).default(120)
    }),
    translation: Joi.object({
        content,
        targetLanguage: language.required(),
        sourceLanguage: language.default("English")
    }),
    contentScore: baseContent
};

module.exports = schemas;

