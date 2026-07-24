const express = require("express");
const tagController = require("../../controllers/blog-controllers/tag.controller");
const { protectAdmin } = require("../../utilities/adminAuth");
const {
    tagIdSchema,
    createTagSchema,
    updateTagSchema,
    updateTagStatusSchema,
    listTagSchema,
    popularTagSchema
} = require("../../validation/blog-validation/tag.validation");

const tagRouter = express.Router();

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

tagRouter.use(protectAdmin);

tagRouter
    .route("/")
    .post(validate(createTagSchema, "body"), tagController.createTag)
    .get(validate(listTagSchema, "query"), tagController.getAllTags);

tagRouter.get("/dropdown", tagController.getTagDropdown);
tagRouter.get("/popular", validate(popularTagSchema, "query"), tagController.getPopularTags);
tagRouter.get("/statistics", tagController.getTagStatistics);

tagRouter.patch(
    "/:id/status",
    validate(tagIdSchema, "params"),
    validate(updateTagStatusSchema, "body"),
    tagController.changeTagStatus
);

tagRouter.patch(
    "/:id/restore",
    validate(tagIdSchema, "params"),
    tagController.restoreTag
);

tagRouter
    .route("/:id")
    .get(validate(tagIdSchema, "params"), tagController.getTagById)
    .patch(
        validate(tagIdSchema, "params"),
        validate(updateTagSchema, "body"),
        tagController.updateTag
    )
    .delete(validate(tagIdSchema, "params"), tagController.deleteTag);

module.exports = tagRouter;
