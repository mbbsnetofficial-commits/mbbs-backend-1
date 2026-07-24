const Joi = require("joi");
const { CATEGORY_TYPES, LIMITS, SORT_FIELDS, SORT_ORDER } = require("../../constants/blog-constants/category.constant");

const optionalUrl = Joi.string().uri().allow("");

const categoryId = Joi.string().length(24).hex().required().messages({
    "string.empty": "Category ID is required.",
    "string.length": "Category ID must be 24 characters.",
    "string.hex": "Category ID is invalid."
});

const categoryIdSchema = Joi.object({ id: categoryId });

const seoSchema = Joi.object({
    metaTitle: Joi.string().trim().max(160).allow(""),
    metaDescription: Joi.string().trim().max(320).allow(""),
    keywords: Joi.array().items(Joi.string().trim().min(1).max(80)),
    canonicalUrl: optionalUrl
});

const categoryFields = {
    categoryName: Joi.string().trim().min(LIMITS.CATEGORY_NAME_MIN).max(LIMITS.CATEGORY_NAME_MAX),
    categoryType: Joi.string().valid(...Object.values(CATEGORY_TYPES)),
    description: Joi.string().trim().max(LIMITS.DESCRIPTION_MAX).allow(""),
    icon: optionalUrl,
    bannerImage: optionalUrl,
    parentCategory: Joi.string().length(24).hex().allow(null),
    displayOrder: Joi.number().integer().min(0),
    isFeatured: Joi.boolean(),
    status: Joi.boolean(),
    seo: seoSchema,
    metadata: Joi.object()
};

const createCategorySchema = Joi.object({
    ...categoryFields,
    categoryName: categoryFields.categoryName.required(),
    categoryType: categoryFields.categoryType.required()
});

const updateCategorySchema = Joi.object(categoryFields).min(1);

const updateCategoryStatusSchema = Joi.object({
    status: Joi.boolean().required()
});

const listCategorySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(LIMITS.MAX_PAGE_LIMIT).default(LIMITS.PAGE_LIMIT),
    search: Joi.string().trim().allow("").default(""),
    status: Joi.boolean(),
    isFeatured: Joi.boolean(),
    categoryType: Joi.string().valid(...Object.values(CATEGORY_TYPES)),
    parentCategory: Joi.string().length(24).hex().allow("root"),
    sortBy: Joi.string().valid(...Object.values(SORT_FIELDS)).default(SORT_FIELDS.DISPLAY_ORDER),
    order: Joi.string().valid(...Object.values(SORT_ORDER)).default(SORT_ORDER.ASC)
});

module.exports = {
    categoryId,
    categoryIdSchema,
    createCategorySchema,
    updateCategorySchema,
    updateCategoryStatusSchema,
    listCategorySchema
};
