const express = require("express");
const authorController = require("../../controllers/blog-controllers/aurthor.controller");
const { protectAdmin } = require("../../utilities/adminAuth");
const { validate } = require("../../middleware/blog-middleware/aurthor.middleware");
const {
    createAuthorSchema,
    updateAuthorSchema,
    getAuthorsSchema,
    idSchema,
    updateStatusSchema
} = require("../../validation/blog-validation/aurthor.validation");

const authorRouter = express.Router();

authorRouter.use(protectAdmin);

authorRouter
    .route("/")
    .post(validate(createAuthorSchema), authorController.createAuthor)
    .get(validate(getAuthorsSchema, "query"), authorController.getAuthors);

authorRouter.get("/dropdown", authorController.getDropdown);
authorRouter.get("/featured", authorController.getFeatured);
authorRouter.get("/statistics", authorController.getStatistics);
authorRouter.patch(
    "/:id/status",
    validate(idSchema, "params"),
    validate(updateStatusSchema),
    authorController.changeStatus
);
authorRouter.patch(
    "/:id/restore",
    validate(idSchema, "params"),
    authorController.restoreAuthor
);
authorRouter
    .route("/:id")
    .get(validate(idSchema, "params"), authorController.getAuthorById)
    .patch(
        validate(idSchema, "params"),
        validate(updateAuthorSchema),
        authorController.updateAuthor
    )
    .delete(validate(idSchema, "params"), authorController.deleteAuthor);

module.exports = authorRouter;
