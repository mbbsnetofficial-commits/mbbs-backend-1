"use strict";

const express = require("express");
const controller = require("../controllers/ai.controller");
const schemas = require("../validations/ai.validation");
const { protectAdmin } = require("../../../../utilities/adminAuth");
const { aiRateLimit } = require("../middleware/aiRateLimit.middleware");
const { aiUsage } = require("../middleware/aiUsage.middleware");
const { validateAiRequest } = require("../middleware/validateAiRequest.middleware");

const router = express.Router();

router.use(protectAdmin, aiRateLimit, aiUsage);

const post = (path, schema, action) => {
    router.post(path, validateAiRequest(schema), action);
};

post("/seo", schemas.seo, controller.generateSeo);
post("/faq", schemas.faq, controller.generateFaq);
post("/schema", schemas.schema, controller.generateSchema);
post("/keywords", schemas.keywords, controller.generateKeywords);
post("/slug", schemas.slug, controller.generateSlug);
post("/meta", schemas.meta, controller.generateMeta);
post("/image-alt", schemas.imageAlt, controller.generateImageAlt);
post("/internal-links", schemas.internalLinks, controller.generateInternalLinks);
post("/readability", schemas.readability, controller.analyzeReadability);
post("/summary", schemas.summary, controller.generateSummary);
post("/translation", schemas.translation, controller.translate);
post("/content-score", schemas.contentScore, controller.scoreContent);

module.exports = router;

