const express = require("express");
const controller = require("../../controllers/blog-controllers/blog.controller");
const { protectAdmin } = require("../../utilities/adminAuth");
const { validate } = require("../../middleware/blog-middleware/blog.middleware");
const {
    uploadSingle,
    validateActualSize,
    handleUploadError,
    validate: validateMedia
} = require("../../middleware/blog-middleware/media.middleware");
const { uploadSchema } = require("../../validation/blog-validation/media.valaidation");
const {
    createBlogSchema,
    updateBlogSchema,
    blogIdSchema,
    listBlogsSchema,
    scheduleBlogSchema
} = require("../../validation/blog-validation/blog.validation");

const router = express.Router();
router.use(protectAdmin);

router
    .route("/")
    .get(validate(listBlogsSchema, "query"), controller.listBlogs)
    .post(validate(createBlogSchema), controller.createBlog);

router.get("/statistics", controller.getStatistics);
router.post("/:id/publish", validate(blogIdSchema, "params"), controller.publishBlog);
router.post("/:id/unpublish", validate(blogIdSchema, "params"), controller.unpublishBlog);
router.post(
    "/:id/schedule",
    validate(blogIdSchema, "params"),
    validate(scheduleBlogSchema),
    controller.scheduleBlog
);
router.post("/:id/duplicate", validate(blogIdSchema, "params"), controller.duplicateBlog);
router.patch("/:id/restore", validate(blogIdSchema, "params"), controller.restoreBlog);
router.post(
    "/:id/featured-image",
    validate(blogIdSchema, "params"),
    uploadSingle,
    handleUploadError,
    validateActualSize,
    validateMedia(uploadSchema),
    controller.uploadFeaturedImage
);

router
    .route("/:id")
    .get(validate(blogIdSchema, "params"), controller.getBlog)
    .patch(validate(blogIdSchema, "params"), validate(updateBlogSchema), controller.updateBlog)
    .delete(validate(blogIdSchema, "params"), controller.deleteBlog);

module.exports = router;
