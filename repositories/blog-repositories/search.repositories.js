const Blog = require("../../model/blog-model/blog.model");
const Category = require("../../model/blog-model/category.model");
const Tag = require("../../model/blog-model/tag.model");
const Author = require("../../model/blog-model/aurthor.model");
const Review = require("../../model/blog-model/review.model");
const SEO = require("../../model/blog-model/seo.model");
const Media = require("../../model/blog-model/media.model");

const definitions = {
    BLOG: {
        model: Blog,
        fields: ["title", "slug", "excerpt", "shortDescription"],
        base: { isDeleted: false, status: "PUBLISHED", visibility: "PUBLIC" },
        select: "title slug excerpt shortDescription featuredImage createdAt totalViews category author tags"
    },
    CATEGORY: {
        model: Category,
        fields: ["categoryName", "slug", "description"],
        base: { isDeleted: false, status: true },
        select: "categoryName slug description icon bannerImage createdAt"
    },
    TAG: {
        model: Tag,
        fields: ["tagName", "slug", "description"],
        base: { isDeleted: false, status: true },
        select: "tagName slug description color icon createdAt"
    },
    AUTHOR: {
        model: Author,
        fields: ["fullName", "slug", "bio", "designation"],
        base: { isDeleted: false, status: true },
        select: "fullName slug bio designation profileImage createdAt"
    },
    REVIEW: {
        model: Review,
        fields: ["title", "review", "reviewerName"],
        base: { isDeleted: false, status: "APPROVED" },
        select: "title review reviewerName rating createdAt reviewType referenceId"
    },
    SEO: {
        model: SEO,
        fields: ["metaTitle", "metaDescription", "slug", "metaKeywords"],
        base: { isDeleted: false, isActive: true },
        select: "metaTitle metaDescription slug module referenceId createdAt"
    },
    MEDIA: {
        model: Media,
        fields: ["displayName", "originalName", "altText", "caption"],
        base: { isDeleted: false, status: "ACTIVE", resourceType: "image" },
        select: "displayName originalName altText caption secureUrl createdAt"
    }
};

const supportedModules = () => Object.keys(definitions);
const search = async (module, regex, filters = {}, limit = 100) => {
    const definition = definitions[module];
    if (!definition) return [];
    const filter = {
        ...definition.base,
        ...filters,
        $or: definition.fields.map(field => ({ [field]: regex }))
    };
    return definition.model.find(filter).select(definition.select).limit(limit).lean();
};

module.exports = { supportedModules, search };
