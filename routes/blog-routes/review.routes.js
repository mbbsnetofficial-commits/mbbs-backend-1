const express = require("express");
const controller = require("../../controllers/blog-controllers/review.controller");
const { protect } = require("../../utilities/auth");
const { protectAdmin } = require("../../utilities/adminAuth");
const { validate } = require("../../middleware/blog-middleware/review.middleware");
const {
    createReviewSchema,
    updateReviewSchema,
    listReviewSchema,
    idSchema,
    referenceSchema,
    rejectSchema,
    featureSchema,
    verifySchema
} = require("../../validation/blog-validation/review.validation");

const publicReviewRouter = express.Router();
publicReviewRouter.get("/featured", validate(listReviewSchema, "query"), controller.listFeatured);
publicReviewRouter.get(
    "/reference/:reviewType/:referenceId",
    validate(referenceSchema, "params"),
    validate(listReviewSchema, "query"),
    controller.listApprovedByReference
);
publicReviewRouter.post("/", protect, validate(createReviewSchema), controller.create);
publicReviewRouter.get("/mine", protect, validate(listReviewSchema, "query"), controller.listMine);
publicReviewRouter.patch(
    "/:id",
    protect,
    validate(idSchema, "params"),
    validate(updateReviewSchema),
    controller.updateMine
);

const adminReviewRouter = express.Router();
adminReviewRouter.use(protectAdmin);
adminReviewRouter.get("/", validate(listReviewSchema, "query"), controller.listAdmin);
adminReviewRouter.get("/statistics", controller.statistics);
adminReviewRouter.post("/:id/approve", validate(idSchema, "params"), controller.approve);
adminReviewRouter.post(
    "/:id/reject",
    validate(idSchema, "params"),
    validate(rejectSchema),
    controller.reject
);
adminReviewRouter.patch(
    "/:id/featured",
    validate(idSchema, "params"),
    validate(featureSchema),
    controller.feature
);
adminReviewRouter.patch(
    "/:id/verified",
    validate(idSchema, "params"),
    validate(verifySchema),
    controller.verify
);
adminReviewRouter.patch("/:id/restore", validate(idSchema, "params"), controller.restore);
adminReviewRouter
    .route("/:id")
    .get(validate(idSchema, "params"), controller.getById)
    .delete(validate(idSchema, "params"), controller.remove);

module.exports = { publicReviewRouter, adminReviewRouter };
