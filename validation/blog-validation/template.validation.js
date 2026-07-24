// src/modules/blog-template/validations/template.validation.js

const Joi = require("joi");

// ----------------------------
// MongoDB ObjectId Validation
// ----------------------------
const objectId = Joi.string()
    .length(24)
    .hex()
    .required()
    .messages({
        "string.base": "Invalid Template ID.",
        "string.empty": "Template ID is required.",
        "string.length": "Template ID must be 24 characters.",
        "string.hex": "Template ID is invalid."
    });

const templateIdSchema = Joi.object({
    id: objectId
});

// ----------------------------
// Create Template
// ----------------------------
const createTemplateSchema = Joi.object({

    templateName: Joi.string()
        .trim()
        .min(3)
        .max(100)
        .required()
        .messages({
            "string.empty": "Template Name is required.",
            "string.min": "Template Name should contain at least 3 characters.",
            "string.max": "Template Name cannot exceed 100 characters."
        }),

    description: Joi.string()
        .allow("")
        .max(500),

    thumbnail: Joi.string()
        .uri()
        .allow("")
        .optional(),

    previewImages: Joi.array()
        .items(Joi.string().uri())
        .default([]),

    allowedSections: Joi.array()
        .items(Joi.string())
        .default([]),

    displayOrder: Joi.number()
        .integer()
        .min(0)
        .default(0),

    status: Joi.boolean()
        .default(true),

    isDefault: Joi.boolean()
        .default(false),

    metadata: Joi.object()
        .default({})
});

// ----------------------------
// Update Template
// ----------------------------
const updateTemplateSchema = Joi.object({

    templateName: Joi.string()
        .trim()
        .min(3)
        .max(100),

    description: Joi.string()
        .allow("")
        .max(500),

    thumbnail: Joi.string()
        .uri()
        .allow(""),

    previewImages: Joi.array()
        .items(Joi.string().uri()),

    allowedSections: Joi.array()
        .items(Joi.string()),

    displayOrder: Joi.number()
        .integer()
        .min(0),

    status: Joi.boolean(),

    isDefault: Joi.boolean(),

    metadata: Joi.object()

}).min(1);

// ----------------------------
// Change Status
// ----------------------------
const updateStatusSchema = Joi.object({

    status: Joi.boolean()
        .required()

});

// ----------------------------
// Query Validation
// ----------------------------
const listTemplateSchema = Joi.object({

    page: Joi.number()
        .integer()
        .min(1)
        .default(1),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10),

    search: Joi.string()
        .allow("")
        .default(""),

    status: Joi.boolean(),

    sortBy: Joi.string()
        .valid(
            "templateName",
            "createdAt",
            "displayOrder"
        )
        .default("displayOrder"),

    order: Joi.string()
        .valid("asc", "desc")
        .default("asc")

});

module.exports = {

    objectId,

    templateIdSchema,

    createTemplateSchema,

    updateTemplateSchema,

    updateStatusSchema,

    listTemplateSchema

};
