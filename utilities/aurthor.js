const crypto = require("crypto");

/**
 * ==========================================
 * Generate SEO Slug
 * ==========================================
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
 * Generate Author Code
 * Example:
 * AUT_DR_JOHN_SMITH_5AF8E1
 * ==========================================
 */

const generateAuthorCode = (fullName = "") => {

    const random = crypto
        .randomBytes(3)
        .toString("hex")
        .toUpperCase();

    return `AUT_${generateSlug(fullName)
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
 * Pagination Helper
 * ==========================================
 */

const getPagination = (

    page = 1,

    limit = 10

) => {

    page = Math.max(1, Number(page) || 1);

    limit = Math.max(1, Number(limit) || 10);

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
 * Remove Duplicate Array Values
 * ==========================================
 */

const removeDuplicates = (array = []) => {

    return [...new Set(array)];

};


/**
 * ==========================================
 * Email Validation
 * ==========================================
 */

const isValidEmail = (email = "") => {

    const regex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return regex.test(email);

};


/**
 * ==========================================
 * Phone Validation
 * ==========================================
 */

const isValidPhone = (phone = "") => {

    const regex =
        /^[+]?[0-9]{7,15}$/;

    return regex.test(phone);

};


/**
 * ==========================================
 * HEX Color Validation
 * ==========================================
 */

const isValidColor = (color = "") => {

    return /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(color);

};


/**
 * ==========================================
 * Image Validation
 * ==========================================
 */

const isValidImage = (url = "") => {

    return /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(url);

};


/**
 * ==========================================
 * Empty Object Check
 * ==========================================
 */

const isEmptyObject = (object = {}) => {

    return (

        object &&

        Object.keys(object).length === 0 &&

        object.constructor === Object

    );

};


/**
 * ==========================================
 * Default SEO
 * ==========================================
 */

const getDefaultSeo = (authorName = "") => {

    return {

        metaTitle: `${authorName} | MBBS.NET`,

        metaDescription: `${authorName} - Expert Author at MBBS.NET`,

        keywords: [],

        canonicalUrl: ""

    };

};


/**
 * ==========================================
 * Format Author Response
 * ==========================================
 */

const formatAuthorResponse = (author) => {

    if (!author) {

        return null;

    }

    return {

        id: author._id,

        authorCode: author.authorCode,

        fullName: author.fullName,

        slug: author.slug,

        email: author.email,

        phone: author.phone,

        designation: author.designation,

        bio: author.bio,

        authorType: author.authorType,

        profileImage: author.profileImage,

        coverImage: author.coverImage,

        experience: author.experience,

        qualifications: author.qualifications,

        specializations: author.specializations,

        languages: author.languages,

        country: author.country,

        city: author.city,

        socialLinks: author.socialLinks,

        totalBlogs: author.totalBlogs,

        totalViews: author.totalViews,

        totalLikes: author.totalLikes,

        totalComments: author.totalComments,

        isFeatured: author.isFeatured,

        status: author.status,

        displayOrder: author.displayOrder,

        seo: author.seo,

        createdAt: author.createdAt,

        updatedAt: author.updatedAt

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
 * Generate Profile URL
 * ==========================================
 */

const getAuthorProfilePath = (slug) => {

    return `/authors/${slug}`;

};


/**
 * ==========================================
 * Badge Label
 * ==========================================
 */

const getAuthorBadge = (authorType) => {

    const badges = {

        ADMIN: "Administrator",

        EDITOR: "Editor",

        COUNSELOR: "Admission Counselor",

        DOCTOR: "Medical Expert",

        UNIVERSITY_REPRESENTATIVE: "University Representative",

        GUEST_AUTHOR: "Guest Author"

    };

    return badges[authorType] || "Author";

};


/**
 * ==========================================
 * Sort By Popularity
 * ==========================================
 */

const sortByPopularity = (authors = []) => {

    return authors.sort(

        (a, b) => b.totalBlogs - a.totalBlogs

    );

};


/**
 * ==========================================
 * Sort Alphabetically
 * ==========================================
 */

const sortAlphabetically = (authors = []) => {

    return authors.sort(

        (a, b) => a.fullName.localeCompare(b.fullName)

    );

};


/**
 * ==========================================
 * EXPORTS
 * ==========================================
 */

module.exports = {

    generateSlug,

    generateAuthorCode,

    buildSearchRegex,

    getPagination,

    buildSortObject,

    removeDuplicates,

    isValidEmail,

    isValidPhone,

    isValidColor,

    isValidImage,

    isEmptyObject,

    getDefaultSeo,

    formatAuthorResponse,

    deepClone,

    getAuthorProfilePath,

    getAuthorBadge,

    sortByPopularity,

    sortAlphabetically

};
