const Joi = require("joi");
const {
    SEARCH_MODULES,
    SORT_FIELDS,
    SORT_ORDER,
    SEARCH_LIMITS
} = require("../../constants/blog-constants/search.const");

const keyword = Joi.string().trim()
    .min(SEARCH_LIMITS.MIN_KEYWORD_LENGTH)
    .max(SEARCH_LIMITS.MAX_KEYWORD_LENGTH)
    .required();
const paging = {
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(SEARCH_LIMITS.MAX_GLOBAL_LIMIT).default(10)
};
const sorting = {
    sortBy: Joi.string().valid(...Object.values(SORT_FIELDS)).default(SORT_FIELDS.RELEVANCE),
    sortOrder: Joi.string().valid(...Object.values(SORT_ORDER)).default(SORT_ORDER.DESC)
};
const globalSearchSchema = Joi.object({ keyword, ...paging, ...sorting });
const moduleSearchSchema = Joi.object({
    module: Joi.string().valid(...Object.values(SEARCH_MODULES)).invalid(SEARCH_MODULES.GLOBAL).required(),
    keyword,
    ...paging,
    ...sorting
});
const suggestionSchema = Joi.object({
    keyword: Joi.string().trim().min(1).max(50).required(),
    limit: Joi.number().integer().min(1).max(SEARCH_LIMITS.DEFAULT_SUGGESTION_LIMIT).default(5)
});
const advancedSearchSchema = Joi.object({
    keyword,
    module: Joi.string().valid(...Object.values(SEARCH_MODULES)).default(SEARCH_MODULES.GLOBAL),
    category: Joi.string().length(24).hex(),
    author: Joi.string().length(24).hex(),
    tag: Joi.string().length(24).hex(),
    rating: Joi.number().integer().min(1).max(5),
    ...paging,
    ...sorting
});

module.exports = { globalSearchSchema, moduleSearchSchema, suggestionSchema, advancedSearchSchema };
