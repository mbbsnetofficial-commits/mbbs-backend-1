"use strict";

const Joi = require("joi");

/**
 * ==========================================================
 * Common Validators
 * ==========================================================
 */

const slug = Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .required()
    .messages({
        "string.empty": "Slug is required.",
        "string.pattern.base": "Invalid slug format.",
        "any.required": "Slug is required."
    });

const pagination = Joi.object({

    page: Joi.number()
        .integer()
        .min(1)
        .default(1),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10)

});

const search = Joi.object({

    q: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
            "string.empty": "Search query is required.",
            "string.min": "Search query must contain at least 2 characters.",
            "string.max": "Search query cannot exceed 100 characters.",
            "any.required": "Search query is required."
        }),

    page: Joi.number()
        .integer()
        .min(1)
        .default(1),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10)

});

/**
 * ==========================================================
 * Home Page
 * ==========================================================
 */

const homePageValidation = Joi.object({

    page: Joi.number()
        .integer()
        .min(1)
        .default(1)

});

/**
 * ==========================================================
 * Blog Page
 * ==========================================================
 */

const blogPageValidation = Joi.object({

    slug

});

/**
 * ==========================================================
 * Category Page
 * ==========================================================
 */

const categoryPageValidation = Joi.object({

    slug

});

/**
 * ==========================================================
 * Tag Page
 * ==========================================================
 */

const tagPageValidation = Joi.object({

    slug

});

/**
 * ==========================================================
 * Author Page
 * ==========================================================
 */

const authorPageValidation = Joi.object({

    slug

});

/**
 * ==========================================================
 * Exports
 * ==========================================================
 */

module.exports = {

    pagination,

    search,

    homePageValidation,

    blogPageValidation,

    categoryPageValidation,

    tagPageValidation,

    authorPageValidation

};