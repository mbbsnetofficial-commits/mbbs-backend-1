const crypto = require("crypto");

/**
 * Generate Slug
 * Example:
 * Country Guide
 * =>
 * country-guide
 */
const generateSlug = (value = "") => {

    return value
        .trim()
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

};

/**
 * Generate Template Code
 * Example:
 * Country Guide
 * =>
 * TMP_COUNTRY_GUIDE_8A12BC
 */

const generateTemplateCode = (templateName) => {

    const random = crypto
        .randomBytes(3)
        .toString("hex")
        .toUpperCase();

    return `TMP_${generateSlug(templateName)
        .replace(/-/g, "_")
        .toUpperCase()}_${random}`;

};


/**
 * Check Empty Object
 */

const isEmptyObject = (obj) => {

    return (
        obj &&
        Object.keys(obj).length === 0 &&
        obj.constructor === Object
    );

};


/**
 * Generate Version
 */

const generateNextVersion = (currentVersion = 1) => {

    return Number(currentVersion) + 1;

};


/**
 * Sort Preview Images
 */

const sortPreviewImages = (images = []) => {

    return images.filter(Boolean);

};


/**
 * Remove Duplicate Sections
 */

const removeDuplicateSections = (sections = []) => {

    return [...new Set(sections)];

};


/**
 * Format Template Response
 */

const formatTemplateResponse = (template) => {

    if (!template) return null;

    const value = typeof template.toObject === "function"
        ? template.toObject()
        : template;

    return {

        id: value._id,

        templateName: value.templateName,

        templateCode: value.templateCode,

        description: value.description,

        thumbnail: value.thumbnail,

        previewImages: value.previewImages,

        allowedSections: value.allowedSections,

        status: value.status,

        version: value.version,

        displayOrder: value.displayOrder,

        isDefault: value.isDefault,

        metadata: value.metadata,

        createdAt: value.createdAt,

        updatedAt: value.updatedAt

    };

};


/**
 * Generate Search Regex
 */

const generateSearchRegex = (keyword = "") => {

    const escapedKeyword = keyword
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    return new RegExp(escapedKeyword, "i");

};


/**
 * Pagination
 */

const getPagination = (page = 1, limit = 10) => {

    page = Number(page);

    limit = Number(limit);

    const skip = (page - 1) * limit;

    return {

        page,

        limit,

        skip

    };

};


/**
 * Build Sort Object
 */

const buildSortObject = (

    sortBy = "displayOrder",

    sortOrder = "asc"

) => {

    return {

        [sortBy]: sortOrder === "asc" ? 1 : -1

    };

};


/**
 * Default Sections
 */

const getDefaultSections = () => {

    return [

        "hero",

        "overview",

        "content",

        "faq",

        "relatedBlogs",

        "cta"

    ];

};


/**
 * Check Valid Status
 */

const isValidStatus = (status) => {

    return typeof status === "boolean";

};


/**
 * Deep Clone
 */

const deepClone = (obj) => {

    return JSON.parse(JSON.stringify(obj));

};

module.exports = {

    generateSlug,

    generateTemplateCode,

    generateNextVersion,

    sortPreviewImages,

    removeDuplicateSections,

    formatTemplateResponse,

    generateSearchRegex,

    getPagination,

    buildSortObject,

    getDefaultSections,

    isEmptyObject,

    isValidStatus,

    deepClone

};
