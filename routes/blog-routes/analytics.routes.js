const express = require("express");
const controller = require("../../controllers/blog-controllers/analytics.controller");
const { protectAdmin } = require("../../utilities/adminAuth");
const { validate } = require("../../middleware/blog-middleware/analytics.middleware");
const {
    generateSchema,
    listSchema,
    periodSchema,
    performanceSchema
} = require("../../validation/blog-validation/analytics.validation");

const router = express.Router();
router.use(protectAdmin);

router.get("/dashboard", controller.dashboard);
router.get("/snapshots", validate(listSchema), controller.list);
router.post("/snapshots", validate(generateSchema, "body"), controller.generate);
router.get("/snapshots/latest/:period", validate(periodSchema, "params"), controller.latest);
router.get("/content-performance", validate(performanceSchema), controller.performance);

module.exports = router;
