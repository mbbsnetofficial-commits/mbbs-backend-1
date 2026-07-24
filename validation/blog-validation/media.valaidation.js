const Joi = require("joi");
const {
    CLOUDINARY_FOLDERS,
    RESOURCE_TYPES,
    SORT_FIELDS,
    SORT_ORDER
} = require("../../constants/blog-constants/media.const");

const idSchema = Joi.object({
    id: Joi.string().length(24).hex().required()
});

const uploadSchema = Joi.object({
    folder: Joi.string().valid(...Object.values(CLOUDINARY_FOLDERS)).default(CLOUDINARY_FOLDERS.BLOGS),
    displayName: Joi.string().trim().allow("").max(250),
    altText: Joi.string().trim().allow("").max(500),
    caption: Joi.string().trim().allow("").max(1000),
    tags: Joi.alternatives().try(
        Joi.array().items(Joi.string().trim().min(1)).unique(),
        Joi.string().allow("")
    ),
    resourceType: Joi.string().valid(...Object.values(RESOURCE_TYPES))
});

const updateSchema = Joi.object({
    displayName: Joi.string().trim().allow("").max(250),
    altText: Joi.string().trim().allow("").max(500),
    caption: Joi.string().trim().allow("").max(1000),
    tags: Joi.array().items(Joi.string().trim().min(1)).unique()
}).min(1);

const listSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    search: Joi.string().trim().allow(""),
    resourceType: Joi.string().valid(RESOURCE_TYPES.IMAGE, RESOURCE_TYPES.VIDEO, RESOURCE_TYPES.RAW),
    folder: Joi.string().valid(...Object.values(CLOUDINARY_FOLDERS)),
    tag: Joi.string().trim(),
    sortBy: Joi.string().valid(...Object.values(SORT_FIELDS)).default(SORT_FIELDS.CREATED_AT),
    sortOrder: Joi.string().valid(...Object.values(SORT_ORDER)).default(SORT_ORDER.DESC)
});

module.exports = { idSchema, uploadSchema, updateSchema, listSchema };
