const express = require("express");
const controller = require("../../controllers/blog-controllers/seo.controller");
const { protectAdmin } = require("../../utilities/adminAuth");
const { validate } = require("../../middleware/blog-middleware/seo.middleware");
const {
    createSeoSchema,
    updateSeoSchema,
    idSchema,
    moduleReferenceSchema,
    listSeoSchema
} = require("../../validation/blog-validation/seo.validation");

const router = express.Router();
router.use(protectAdmin);

router
    .route("/")
    .get(validate(listSeoSchema, "query"), controller.list)
    .post(validate(createSeoSchema), controller.create);
router.get("/statistics", controller.statistics);
router.get(
    "/module/:module/:referenceId",
    validate(moduleReferenceSchema, "params"),
    controller.getByModule
);
router.patch("/:id/restore", validate(idSchema, "params"), controller.restore);
router
    .route("/:id")
    .get(validate(idSchema, "params"), controller.getById)
    .patch(validate(idSchema, "params"), validate(updateSeoSchema), controller.update)
    .delete(validate(idSchema, "params"), controller.remove);

module.exports = router;
