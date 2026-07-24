const crypto = require("crypto");

/**
 * ==========================================
 * Generate Slug
 * ==========================================
 * Example:
 * Medical University
 * =>
 * medical-university
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
 * ==========================================
 * Generate Tag Code
 * Example:
 * TAG_MEDICAL_UNIVERSITY_A2F9B8
 * ==========================================
 */

const generateTagCode = (tagName) => {

    const random = crypto
        .randomBytes(3)
        .toString("hex")
        .toUpperCase();

    return `TAG_${generateSlug(tagName)
        .replace(/-/g, "_")
        .toUpperCase()}_${random}`;

};


/**
 * ==========================================
 * Build Search Regex
 * ==========================================
 */

const buildSearchRegex = (keyword = "") => {

    const escapedKeyword = keyword
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    return new RegExp(escapedKeyword, "i");

};


/**
 * ==========================================
 * Pagination
 * ==========================================
 */

const getPagination = (

    page = 1,

    limit = 10

) => {

    page = Number(page);

    limit = Number(limit);

    return {

        page,

        limit,

        skip: (page - 1) * limit

    };

};


/**
 * ==========================================
 * MongoDB Sort
 * ==========================================
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
 * ==========================================
 * Remove Duplicate Keywords
 * ==========================================
 */

const removeDuplicateKeywords = (keywords = []) => {

    return [...new Set(keywords)];

};


/**
 * ==========================================
 * Validate Color
 * ==========================================
 */

const isValidColor = (color = "") => {

    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);

};


/**
 * ==========================================
 * Validate Image URL
 * ==========================================
 */

const isValidImage = (url = "") => {

    return /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(url);

};


/**
 * ==========================================
 * Check Empty Object
 * ==========================================
 */

const isEmptyObject = (obj) => {

    return (

        obj &&

        Object.keys(obj).length === 0 &&

        obj.constructor === Object

    );

};


/**
 * ==========================================
 * Default SEO
 * ==========================================
 */

const getDefaultSeo = (tagName) => {

    return {

        metaTitle: `${tagName} | MBBS Blog`,

        metaDescription: `Explore blogs related to ${tagName}.`,

        keywords: [],

        canonicalUrl: ""

    };

};


/**
 * ==========================================
 * Format Tag Response
 * ==========================================
 */

const formatTagResponse = (tag) => {

    if (!tag) return null;

    const value = typeof tag.toObject === "function"
        ? tag.toObject()
        : tag;

    return {

        id: value._id,

        tagCode: value.tagCode,

        tagName: value.tagName,

        slug: value.slug,

        description: value.description,

        tagType: value.tagType,

        color: value.color,

        icon: value.icon,

        bannerImage: value.bannerImage,

        displayOrder: value.displayOrder,

        isFeatured: value.isFeatured,

        status: value.status,

        totalBlogs: value.totalBlogs,

        totalViews: value.totalViews,

        seo: value.seo,

        metadata: value.metadata,

        createdAt: value.createdAt,

        updatedAt: value.updatedAt

    };

};


/**
 * ==========================================
 * Deep Clone
 * ==========================================
 */

const deepClone = (object) => {

    return JSON.parse(

        JSON.stringify(object)

    );

};


/**
 * ==========================================
 * Generate Tag URL
 * ==========================================
 */

const getTagPath = (slug) => {

    return `/tag/${slug}`;

};


/**
 * ==========================================
 * Generate Badge Style
 * ==========================================
 */

const generateBadgeStyle = (color) => {

    return {

        backgroundColor: color,

        color: "#FFFFFF"

    };

};


/**
 * ==========================================
 * Sort Tags By Popularity
 * ==========================================
 */

const sortByPopularity = (tags = []) => {

    return tags.sort(

        (a, b) => b.totalBlogs - a.totalBlogs

    );

};


/**
 * ==========================================
 * Sort Tags Alphabetically
 * ==========================================
 */

const sortAlphabetically = (tags = []) => {

    return tags.sort(

        (a, b) => a.tagName.localeCompare(b.tagName)

    );

};


/**
 * ==========================================
 * Exports
 * ==========================================
 */

module.exports = {

    generateSlug,

    generateTagCode,

    buildSearchRegex,

    getPagination,

    buildSortObject,

    removeDuplicateKeywords,

    isValidColor,

    isValidImage,

    isEmptyObject,

    getDefaultSeo,

    formatTagResponse,

    deepClone,

    getTagPath,

    generateBadgeStyle,

    sortByPopularity,

    sortAlphabetically

};
