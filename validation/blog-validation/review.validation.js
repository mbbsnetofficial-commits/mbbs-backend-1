const Joi = require("joi");
const {
    REVIEW_TYPES,
    REVIEW_STATUS,
    MEDIA_TYPES,
    LIMITS,
    RATING,
    SORT_FIELDS,
    SORT_ORDER,
    PAGINATION
} = require("../../constants/blog-constants/review.const");

const objectId = Joi.string().length(24).hex();
const mediaSchema = Joi.object({
    mediaId: objectId.required(),
    mediaType: Joi.string().valid(...Object.values(MEDIA_TYPES)).default(MEDIA_TYPES.IMAGE)
});
const reviewFields = {
    reviewerName: Joi.string().trim().min(LIMITS.NAME_MIN).max(LIMITS.NAME_MAX),
    email: Joi.string().trim().lowercase().email().allow("", null),
    phone: Joi.string().trim().allow("", null).max(20),
    country: Joi.string().trim().allow("", null).max(100),
    city: Joi.string().trim().allow("", null).max(100),
    title: Joi.string().trim().min(LIMITS.REVIEW_TITLE_MIN).max(LIMITS.REVIEW_TITLE_MAX),
    review: Joi.string().trim().min(LIMITS.REVIEW_MIN).max(LIMITS.REVIEW_MAX),
    rating: Joi.number().integer().min(RATING.MIN).max(RATING.MAX),
    media: Joi.array().items(mediaSchema).max(LIMITS.MAX_MEDIA)
};
const createReviewSchema = Joi.object({
    ...reviewFields,
    reviewType: Joi.string().valid(...Object.values(REVIEW_TYPES)).required(),
    referenceId: objectId.required(),
    reviewerName: reviewFields.reviewerName.required(),
    title: reviewFields.title.required(),
    review: reviewFields.review.required(),
    rating: reviewFields.rating.required()
});
const updateReviewSchema = Joi.object(reviewFields).min(1);
const listReviewSchema = Joi.object({
    page: Joi.number().integer().min(1).default(PAGINATION.DEFAULT_PAGE),
    limit: Joi.number().integer().min(1).max(PAGINATION.MAX_LIMIT).default(PAGINATION.DEFAULT_LIMIT),
    search: Joi.string().trim().allow(""),
    reviewType: Joi.string().valid(...Object.values(REVIEW_TYPES)),
    referenceId: objectId,
    status: Joi.string().valid(...Object.values(REVIEW_STATUS)),
    rating: Joi.number().integer().min(RATING.MIN).max(RATING.MAX),
    isFeatured: Joi.boolean(),
    isVerified: Joi.boolean(),
    sortBy: Joi.string().valid(...Object.values(SORT_FIELDS)).default(SORT_FIELDS.CREATED_AT),
    sortOrder: Joi.string().valid(...Object.values(SORT_ORDER)).default(SORT_ORDER.DESC)
});
const idSchema = Joi.object({ id: objectId.required() });
const referenceSchema = Joi.object({
    reviewType: Joi.string().valid(...Object.values(REVIEW_TYPES)).required(),
    referenceId: objectId.required()
});
const rejectSchema = Joi.object({ rejectionReason: Joi.string().trim().min(5).max(500).required() });
const flagSchema = key => Joi.object({ [key]: Joi.boolean().required() });

module.exports = {
    createReviewSchema,
    updateReviewSchema,
    listReviewSchema,
    idSchema,
    referenceSchema,
    rejectSchema,
    featureSchema: flagSchema("isFeatured"),
    verifySchema: flagSchema("isVerified")
};
