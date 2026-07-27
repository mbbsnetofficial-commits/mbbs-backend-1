"use strict";

const { formatSuccess, formatError } = require("../utils/aiResponseFormatter");
const seoService = require("../services/aiSeo.service");
const faqService = require("../services/aiFaq.service");
const schemaService = require("../services/aiSchema.service");
const keywordService = require("../services/aiKeyword.service");
const slugService = require("../services/aiSlug.service");
const metaService = require("../services/aiMeta.service");
const imageAltService = require("../services/aiImageAlt.service");
const internalLinkService = require("../services/aiInternalLink.service");
const readabilityService = require("../services/aiReadability.service");
const summaryService = require("../services/aiSummary.service");
const translationService = require("../services/aiTranslation.service");
const contentScoreService = require("../services/aiContentScore.service");

const handler = (feature, service) => async (req, res) => {
    try {
        const result = await service.generate(req.validatedAiBody, {
            adminId: req.admin.id
        });
        return res.status(200).json(
            formatSuccess(feature, result.data, result.usage)
        );
    } catch (error) {
        return res.status(error.statusCode || 500).json(formatError(error));
    }
};

exports.generateSeo = handler("SEO", seoService);
exports.generateFaq = handler("FAQ", faqService);
exports.generateSchema = handler("Schema", schemaService);
exports.generateKeywords = handler("Keywords", keywordService);
exports.generateSlug = handler("Slug", slugService);
exports.generateMeta = handler("Meta", metaService);
exports.generateImageAlt = handler("Image ALT text", imageAltService);
exports.generateInternalLinks = handler("Internal links", internalLinkService);
exports.analyzeReadability = handler("Readability analysis", readabilityService);
exports.generateSummary = handler("Summary", summaryService);
exports.translate = handler("Translation", translationService);
exports.scoreContent = handler("Content score", contentScoreService);

