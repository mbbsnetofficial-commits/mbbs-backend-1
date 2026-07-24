const express = require("express");
const templateController = require("../../controllers/blog-controllers/template.controller");
const { protectAdmin } = require("../../utilities/adminAuth");
const {
    templateIdSchema,
    createTemplateSchema,
    updateTemplateSchema,
    updateStatusSchema,
    listTemplateSchema
} = require("../../validation/blog-validation/template.validation");

const templateRouter = express.Router();

const validate = (schema, source) => (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
        abortEarly: false,
        stripUnknown: true
    });

    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details.map(detail => detail.message).join(" ")
        });
    }

    req[source] = value;
    return next();
};

templateRouter.use(protectAdmin);

templateRouter
    .route("/")
    .post(validate(createTemplateSchema, "body"), templateController.createTemplate)
    .get(validate(listTemplateSchema, "query"), templateController.getAllTemplates);

templateRouter
    .route("/:id")
    .get(validate(templateIdSchema, "params"), templateController.getTemplateById)
    .patch(
        validate(templateIdSchema, "params"),
        validate(updateTemplateSchema, "body"),
        templateController.updateTemplate
    )
    .delete(validate(templateIdSchema, "params"), templateController.deleteTemplate);

templateRouter.patch(
    "/:id/status",
    validate(templateIdSchema, "params"),
    validate(updateStatusSchema, "body"),
    templateController.changeTemplateStatus
);

module.exports = templateRouter;
