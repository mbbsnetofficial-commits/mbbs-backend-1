"use strict";

const mongoose = require("mongoose");
const gemini = require("./gemini.service");
const repository = require("../repositories/ai.repository");
const prompt = require("../prompts/internalLinks.prompt");
const AI_ERRORS = require("../constants/aiError.constants");
const { AI_FEATURES } = require("../constants/ai.constants");

exports.generate = async (payload, context) => {
    const candidates = await repository.findInternalLinkCandidates({
        excludeBlogId: payload.blogId && mongoose.isValidObjectId(payload.blogId)
            ? payload.blogId
            : null
    });
    if (!candidates.length) {
        throw Object.assign(new Error(AI_ERRORS.NO_LINK_CANDIDATES), { statusCode: 404 });
    }
    const candidatePayload = candidates.map(item => ({
        blogId: String(item._id),
        title: item.title,
        slug: item.slug,
        description: item.shortDescription || item.excerpt || ""
    }));
    const result = await gemini.generateStructured({
        feature: AI_FEATURES.INTERNAL_LINKS,
        ...prompt({ ...payload, candidates: candidatePayload }),
        adminId: context.adminId
    });

    const allowed = new Map(candidatePayload.map(item => [item.blogId, item]));
    const links = Array.isArray(result.data.links) ? result.data.links : [];
    result.data.links = links
        .filter(link => allowed.has(String(link.blogId)))
        .slice(0, payload.count)
        .map(link => ({
            blogId: String(link.blogId),
            slug: allowed.get(String(link.blogId)).slug,
            title: allowed.get(String(link.blogId)).title,
            anchorText: String(link.anchorText || allowed.get(String(link.blogId)).title),
            reason: String(link.reason || "")
        }));
    return result;
};

