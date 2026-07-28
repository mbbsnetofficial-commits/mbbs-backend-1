"use strict";

const express = require("express");
const controller = require("../../controllers/blog-controllers/page.controller");
const commentController = require("../../controllers/blog-controllers/blogComment.controller");
const { protect, optionalProtect } = require("../../utilities/auth");
const { validate, cacheControl } = require("../../middleware/blog-middleware/page.middleware");
const {
    pagination,
    search,
    blogPageValidation,
    categoryPageValidation,
    tagPageValidation,
    authorPageValidation
} = require("../../validation/blog-validation/page.validation");
const {
    blogParams,
    commentParams,
    commentBody
} = require("../../validation/blog-validation/blogComment.validation");

const router = express.Router();
router.use(cacheControl);

router.get("/home", validate(pagination), controller.getHomePage);
router.get("/blogs", validate(pagination), controller.getBlogs);
router.get("/authors", validate(pagination), controller.getAuthors);
router.get("/categories", validate(pagination), controller.getCategories);
router.get("/search", validate(search), controller.searchPage);
router.get(
    "/blog/:slug/comments",
    optionalProtect,
    validate(blogParams, "params"),
    validate(pagination),
    commentController.list
);
router.post(
    "/blog/:slug/comments",
    protect,
    validate(blogParams, "params"),
    validate(commentBody, "body"),
    commentController.create
);
router.patch(
    "/blog/:slug/comments/:commentId",
    protect,
    validate(commentParams, "params"),
    validate(commentBody, "body"),
    commentController.update
);
router.delete(
    "/blog/:slug/comments/:commentId",
    protect,
    validate(commentParams, "params"),
    commentController.remove
);
router.post(
    "/blog/:slug/comments/:commentId/like",
    protect,
    validate(commentParams, "params"),
    commentController.like
);
router.delete(
    "/blog/:slug/comments/:commentId/like",
    protect,
    validate(commentParams, "params"),
    commentController.unlike
);
router.get(
    "/blog/:slug",
    validate(blogPageValidation, "params"),
    controller.getBlogPage
);
router.get(
    "/category/:slug",
    validate(categoryPageValidation, "params"),
    validate(pagination),
    controller.getCategoryPage
);
router.get(
    "/tag/:slug",
    validate(tagPageValidation, "params"),
    validate(pagination),
    controller.getTagPage
);
router.get(
    "/author/:slug",
    validate(authorPageValidation, "params"),
    validate(pagination),
    controller.getAuthorPage
);

module.exports = router;
