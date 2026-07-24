const Joi = require("joi");
const {
    TAG_TYPES,
    LIMITS,
    SORT_FIELDS,
    SORT_ORDER,
    DEFAULT_VALUES
} = require("../../constants/blog-constants/tag.const");

const optionalUrl = Joi.string().uri().allow("");

const tagId = Joi.string().length(24).hex().required().messages({
    "string.empty": "Tag ID is required.",
    "string.length": "Tag ID must be 24 characters.",
    "string.hex": "Tag ID is invalid."
});

const tagIdSchema = Joi.object({ id: tagId });

const seoSchema = Joi.object({
    metaTitle: Joi.string().trim().max(160).allow(""),
    metaDescription: Joi.string().trim().max(320).allow(""),
    keywords: Joi.array().items(Joi.string().trim().min(1).max(80)),
    canonicalUrl: optionalUrl
});

const tagFields = {
    tagName: Joi.string().trim().min(LIMITS.TAG_NAME_MIN).max(LIMITS.TAG_NAME_MAX),
    slug: Joi.string().trim().lowercase().pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    description: Joi.string().trim().max(LIMITS.DESCRIPTION_MAX).allow(""),
    tagType: Joi.string().valid(...Object.values(TAG_TYPES)),
    color: Joi.string().pattern(/^#(?:[A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/),
    icon: optionalUrl,
    bannerImage: optionalUrl,
    displayOrder: Joi.number().integer().min(0),
    isFeatured: Joi.boolean(),
    status: Joi.boolean(),
    seo: seoSchema,
    metadata: Joi.object()
};

const createTagSchema = Joi.object({
    ...tagFields,
    tagName: tagFields.tagName.required(),
    tagType: tagFields.tagType.default(TAG_TYPES.GENERAL),
    color: tagFields.color.default(DEFAULT_VALUES.DEFAULT_COLOR),
    displayOrder: tagFields.displayOrder.default(DEFAULT_VALUES.DISPLAY_ORDER),
    isFeatured: tagFields.isFeatured.default(DEFAULT_VALUES.IS_FEATURED),
    status: tagFields.status.default(DEFAULT_VALUES.STATUS)
});

const updateTagSchema = Joi.object(tagFields).min(1);

const updateTagStatusSchema = Joi.object({ status: Joi.boolean().required() });

const listTagSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(LIMITS.MAX_PAGE_LIMIT).default(LIMITS.PAGE_LIMIT),
    search: Joi.string().trim().allow("").default(""),
    status: Joi.boolean(),
    isFeatured: Joi.boolean(),
    tagType: Joi.string().valid(...Object.values(TAG_TYPES)),
    sortBy: Joi.string().valid(...Object.values(SORT_FIELDS)).default(SORT_FIELDS.DISPLAY_ORDER),
    order: Joi.string().valid(...Object.values(SORT_ORDER)).default(SORT_ORDER.ASC)
});

const popularTagSchema = Joi.object({
    limit: Joi.number().integer().min(1).max(LIMITS.MAX_PAGE_LIMIT).default(10),
    tagType: Joi.string().valid(...Object.values(TAG_TYPES))
});

module.exports = {
    tagId,
    tagIdSchema,
    createTagSchema,
    updateTagSchema,
    updateTagStatusSchema,
    listTagSchema,
    popularTagSchema
};
