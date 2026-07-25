"use strict";

const express = require("express");
const controller = require("../../controllers/blog-controllers/page.controller");
const { validate, cacheControl } = require("../../middleware/blog-middleware/page.middleware");
const {
    pagination,
    search,
    blogPageValidation,
    categoryPageValidation,
    tagPageValidation,
    authorPageValidation
} = require("../../validation/blog-validation/page.validation");

const router = express.Router();
router.use(cacheControl);

router.get("/home", controller.getHomePage);
router.get("/search", validate(search), controller.searchPage);
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
