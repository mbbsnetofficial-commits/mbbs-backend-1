const express = require("express");
const { protect, optionalProtect } = require("../../utilities/auth");
const { validate } = require("../../middleware/blog-middleware/aurthor.middleware");
const controller = require("../../controllers/neet-controller/blogEngagement.controller");
const {
    listBlogsSchema,
    blogIdSchema
} = require("../../validation/blogEngagement.validation");

const router = express.Router();

// Public / Guest user routes (accessible without login; enriches user state if logged in)
router.get("/blogs", optionalProtect, validate(listBlogsSchema, "query"), controller.listBlogs);
router.get("/blogs/saved", protect, validate(listBlogsSchema, "query"), controller.listSavedBlogs);
router.get("/blogs/:blogId", optionalProtect, validate(blogIdSchema, "params"), controller.getBlog);
router.post("/blogs/:blogId/like", protect, validate(blogIdSchema, "params"), controller.likeBlog);
router.delete("/blogs/:blogId/like", protect, validate(blogIdSchema, "params"), controller.unlikeBlog);
router.post("/blogs/:blogId/save", protect, validate(blogIdSchema, "params"), controller.saveBlog);
router.delete("/blogs/:blogId/save", protect, validate(blogIdSchema, "params"), controller.unsaveBlog);

module.exports = router;
