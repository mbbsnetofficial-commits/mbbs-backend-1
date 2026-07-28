"use strict";

const Joi = require("joi");

const slug = Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .required();

const commentId = Joi.string()
    .pattern(/^[a-fA-F0-9]{24}$/)
    .required();

const blogParams = Joi.object({ slug });
const commentParams = Joi.object({ slug, commentId });

const commentBody = Joi.object({
    comment: Joi.string().trim().min(1).max(2000).required()
});

module.exports = { blogParams, commentParams, commentBody };
