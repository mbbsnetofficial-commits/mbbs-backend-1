const express = require("express");
const controller = require("../../controllers/blog-controllers/search.controller");
const { validate } = require("../../middleware/blog-middleware/search.middleware");
const {
    globalSearchSchema,
    moduleSearchSchema,
    suggestionSchema,
    advancedSearchSchema
} = require("../../validation/blog-validation/search.validation");

const router = express.Router();

router.get("/", validate(globalSearchSchema), controller.globalSearch);
router.get("/module", validate(moduleSearchSchema), controller.moduleSearch);
router.get("/suggestions", validate(suggestionSchema), controller.suggestions);
router.post("/advanced", validate(advancedSearchSchema, "body"), controller.advancedSearch);

module.exports = router;
