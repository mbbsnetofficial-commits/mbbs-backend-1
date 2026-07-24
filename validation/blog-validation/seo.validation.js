const Joi = require("joi");
const {
    MODULES,
    ROBOTS,
    OPEN_GRAPH_TYPES,
    TWITTER_CARDS,
    SCHEMA_TYPES,
    CHANGE_FREQUENCY,
    LIMITS,
    SORT_FIELDS,
    SORT_ORDER
} = require("../../constants/blog-constants/seo.const");

const objectId = Joi.string().length(24).hex();
const openGraph = Joi.object({
    title: Joi.string().trim().allow("").max(100),
    description: Joi.string().trim().allow("").max(200),
    image: objectId.allow(null),
    imageAlt: Joi.string().trim().allow("").max(250),
    type: Joi.string().valid(...Object.values(OPEN_GRAPH_TYPES))
});
const twitter = Joi.object({
    card: Joi.string().valid(...Object.values(TWITTER_CARDS)),
    title: Joi.string().trim().allow("").max(100),
    description: Joi.string().trim().allow("").max(200),
    image: objectId.allow(null)
});
const fields = {
    module: Joi.string().valid(...Object.values(MODULES)),
    referenceId: objectId,
    slug: Joi.string().trim().lowercase().min(LIMITS.SLUG_MIN).max(LIMITS.SLUG_MAX)
        .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    canonicalUrl: Joi.string().trim().allow("").uri({ scheme: ["http", "https"] }),
    metaTitle: Joi.string().trim().min(LIMITS.META_TITLE_MIN).max(LIMITS.META_TITLE_MAX),
    metaDescription: Joi.string().trim().min(LIMITS.META_DESCRIPTION_MIN).max(LIMITS.META_DESCRIPTION_MAX),
    metaKeywords: Joi.array().items(Joi.string().trim().min(1)).max(LIMITS.META_KEYWORDS_MAX).unique(),
    robots: Joi.string().valid(...Object.values(ROBOTS)),
    openGraph,
    twitter,
    sitemap: Joi.object({
        priority: Joi.number().min(0).max(1),
        changeFrequency: Joi.string().valid(...Object.values(CHANGE_FREQUENCY))
    }),
    schemaType: Joi.string().valid(...Object.values(SCHEMA_TYPES)),
    schemaData: Joi.object(),
    redirectUrl: Joi.string().trim().allow("").uri({ scheme: ["http", "https"] }),
    isActive: Joi.boolean()
};

const createSeoSchema = Joi.object({
    ...fields,
    module: fields.module.required(),
    referenceId: fields.referenceId.required(),
    slug: fields.slug.required(),
    metaTitle: fields.metaTitle.required(),
    metaDescription: fields.metaDescription.required()
});
const updateSeoSchema = Joi.object(fields).min(1);
const idSchema = Joi.object({ id: objectId.required() });
const moduleReferenceSchema = Joi.object({
    module: Joi.string().valid(...Object.values(MODULES)).required(),
    referenceId: objectId.required()
});
const listSeoSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    search: Joi.string().trim().allow(""),
    module: Joi.string().valid(...Object.values(MODULES)),
    isActive: Joi.boolean(),
    robots: Joi.string().valid(...Object.values(ROBOTS)),
    sortBy: Joi.string().valid(...Object.values(SORT_FIELDS)).default(SORT_FIELDS.CREATED_AT),
    sortOrder: Joi.string().valid(...Object.values(SORT_ORDER)).default(SORT_ORDER.DESC)
});

module.exports = { createSeoSchema, updateSeoSchema, idSchema, moduleReferenceSchema, listSeoSchema };
