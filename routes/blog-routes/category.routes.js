const express = require("express");
const categoryController = require("../../controllers/blog-controllers/category.controller");
const { protectAdmin } = require("../../utilities/adminAuth");
const {
    categoryIdSchema,
    createCategorySchema,
    updateCategorySchema,
    updateCategoryStatusSchema,
    listCategorySchema
} = require("../../validation/blog-validation/category.validation");

const categoryRouter = express.Router();

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

categoryRouter.use(protectAdmin);

categoryRouter
    .route("/")
    .post(validate(createCategorySchema, "body"), categoryController.createCategory)
    .get(validate(listCategorySchema, "query"), categoryController.getAllCategories);

categoryRouter.get("/tree", validate(listCategorySchema, "query"), categoryController.getCategoryTree);
categoryRouter.get("/dropdown", categoryController.getCategoryDropdown);

categoryRouter.patch(
    "/:id/status",
    validate(categoryIdSchema, "params"),
    validate(updateCategoryStatusSchema, "body"),
    categoryController.changeCategoryStatus
);

categoryRouter.patch(
    "/:id/restore",
    validate(categoryIdSchema, "params"),
    categoryController.restoreCategory
);

categoryRouter
    .route("/:id")
    .get(validate(categoryIdSchema, "params"), categoryController.getCategoryById)
    .patch(
        validate(categoryIdSchema, "params"),
        validate(updateCategorySchema, "body"),
        categoryController.updateCategory
    )
    .delete(validate(categoryIdSchema, "params"), categoryController.deleteCategory);

module.exports = categoryRouter;
