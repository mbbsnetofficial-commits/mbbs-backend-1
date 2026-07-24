const Joi = require("joi");
const {
    AUTHOR_TYPES,
    LIMITS,
    SORT_FIELDS,
    SORT_ORDER
} = require("../../constants/blog-constants/aurthor.const");

const optionalText = max => Joi.string().trim().allow("").max(max).optional();
const stringArray = Joi.array().items(Joi.string().trim().min(1)).unique();
const socialLinksSchema = Joi.object({
    website: optionalText(500),
    linkedin: optionalText(500),
    facebook: optionalText(500),
    instagram: optionalText(500),
    twitter: optionalText(500),
    youtube: optionalText(500)
});
const seoSchema = Joi.object({
    metaTitle: optionalText(200),
    metaDescription: optionalText(500),
    keywords: stringArray,
    canonicalUrl: optionalText(500)
});

const authorFields = {
    fullName: Joi.string().trim().min(LIMITS.NAME_MIN).max(LIMITS.NAME_MAX),
    slug: Joi.string().trim().lowercase().pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    email: Joi.string().trim().lowercase().email(),
    phone: Joi.string().trim().allow("").pattern(/^[+]?[0-9]{7,15}$/),
    designation: optionalText(LIMITS.DESIGNATION_MAX),
    bio: optionalText(LIMITS.BIO_MAX),
    authorType: Joi.string().valid(...Object.values(AUTHOR_TYPES)),
    profileImage: optionalText(1000),
    coverImage: optionalText(1000),
    experience: Joi.number().integer().min(0),
    qualifications: stringArray,
    specializations: stringArray,
    languages: stringArray,
    country: optionalText(100),
    city: optionalText(100),
    socialLinks: socialLinksSchema,
    isFeatured: Joi.boolean(),
    status: Joi.boolean(),
    displayOrder: Joi.number().integer().min(0),
    seo: seoSchema,
    metadata: Joi.object()
};

const createAuthorSchema = Joi.object({
    ...authorFields,
    fullName: authorFields.fullName.required(),
    email: authorFields.email.required()
});

const updateAuthorSchema = Joi.object(authorFields).min(1);

const getAuthorsSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(LIMITS.MAX_PAGE_LIMIT).default(LIMITS.PAGE_LIMIT),
    search: Joi.string().trim().allow(""),
    authorType: Joi.string().valid(...Object.values(AUTHOR_TYPES)),
    status: Joi.boolean(),
    isFeatured: Joi.boolean(),
    sortBy: Joi.string().valid(...Object.values(SORT_FIELDS)).default(SORT_FIELDS.DISPLAY_ORDER),
    sortOrder: Joi.string().valid(...Object.values(SORT_ORDER)).default(SORT_ORDER.ASC)
});

const idSchema = Joi.object({
    id: Joi.string().length(24).hex().required()
});

const updateStatusSchema = Joi.object({
    status: Joi.boolean().required()
});

module.exports = {
    createAuthorSchema,
    updateAuthorSchema,
    getAuthorsSchema,
    idSchema,
    updateStatusSchema
};
