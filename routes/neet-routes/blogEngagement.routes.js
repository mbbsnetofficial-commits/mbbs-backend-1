const express = require("express");
const { protect } = require("../../utilities/auth");
const { validate } = require("../../middleware/blog-middleware/aurthor.middleware");
const controller = require("../../controllers/neet-controller/blogEngagement.controller");
const {
    listBlogsSchema,
    blogIdSchema
} = require("../../validation/blogEngagement.validation");

const router = express.Router();
router.use(protect);

router.get("/blogs", validate(listBlogsSchema, "query"), controller.listBlogs);
router.get("/blogs/saved", validate(listBlogsSchema, "query"), controller.listSavedBlogs);
router.get("/blogs/:blogId", validate(blogIdSchema, "params"), controller.getBlog);
router.post("/blogs/:blogId/like", validate(blogIdSchema, "params"), controller.likeBlog);
router.delete("/blogs/:blogId/like", validate(blogIdSchema, "params"), controller.unlikeBlog);
router.post("/blogs/:blogId/save", validate(blogIdSchema, "params"), controller.saveBlog);
router.delete("/blogs/:blogId/save", validate(blogIdSchema, "params"), controller.unsaveBlog);

module.exports = router;
