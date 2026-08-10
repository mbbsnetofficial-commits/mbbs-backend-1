const Joi = require("joi");

const listBlogsSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    search: Joi.string().trim().allow("").max(150),
    author: Joi.string().length(24).hex(),
    category: Joi.string().length(24).hex(),
    tag: Joi.string().length(24).hex()
});

const blogIdSchema = Joi.object({
    blogId: Joi.string().trim().min(1).max(250).required()
});

module.exports = { listBlogsSchema, blogIdSchema };
