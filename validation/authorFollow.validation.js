const Joi = require("joi");

const listAuthorsSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    search: Joi.string().trim().allow("").max(100),
    featured: Joi.boolean()
});

const authorIdSchema = Joi.object({
    authorId: Joi.string().length(24).hex().required()
});

module.exports = {
    listAuthorsSchema,
    authorIdSchema
};
