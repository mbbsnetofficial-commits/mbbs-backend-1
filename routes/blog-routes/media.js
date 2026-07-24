const express = require("express");
const controller = require("../../controllers/blog-controllers/media.controller");
const { protectAdmin } = require("../../utilities/adminAuth");
const {
    uploadSingle,
    uploadMultiple,
    validateActualSize,
    validate,
    handleUploadError
} = require("../../middleware/blog-middleware/media.middleware");
const {
    idSchema,
    uploadSchema,
    updateSchema,
    listSchema
} = require("../../validation/blog-validation/media.valaidation");

const router = express.Router();
router.use(protectAdmin);

router.get("/", validate(listSchema, "query"), controller.list);
router.post("/upload", uploadSingle, handleUploadError, validateActualSize, validate(uploadSchema), controller.uploadOne);
router.post("/upload-multiple", uploadMultiple, handleUploadError, validateActualSize, validate(uploadSchema), controller.uploadMany);
router.post(
    "/:id/replace",
    validate(idSchema, "params"),
    uploadSingle,
    handleUploadError,
    validateActualSize,
    validate(uploadSchema),
    controller.replace
);
router.patch("/:id/restore", validate(idSchema, "params"), controller.restore);
router
    .route("/:id")
    .get(validate(idSchema, "params"), controller.getOne)
    .patch(validate(idSchema, "params"), validate(updateSchema), controller.update)
    .delete(validate(idSchema, "params"), controller.remove);

module.exports = router;
