const crypto = require("crypto");

/**
 * ==========================================
 * Generate Slug
 * ==========================================
 * Example:
 * Study MBBS Abroad
 * =>
 * study-mbbs-abroad
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
 * Generate Category Code
 * ==========================================
 * Example:
 * CAT_MBBS_ABROAD_A3F6B2
 */

const generateCategoryCode = (categoryName) => {

    const random = crypto
        .randomBytes(3)
        .toString("hex")
        .toUpperCase();

    return `CAT_${generateSlug(categoryName)
        .replace(/-/g, "_")
        .toUpperCase()}_${random}`;

};


/**
 * ==========================================
 * Build Category Tree
 * ==========================================
 */

const buildCategoryTree = (categories, parent = null) => {

    return categories
        .filter(category => {

            if (parent === null) {
                return !category.parentCategory;
            }

            return (
                category.parentCategory &&
                category.parentCategory.toString() === parent.toString()
            );

        })
        .map(category => {

            const value = typeof category.toObject === "function"
                ? category.toObject()
                : category;

            return {

                ...value,

                children: buildCategoryTree(categories, value._id)

            };

        });

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
 * Search Regex
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
 * MongoDB Sort Object
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
 * Format Category Response
 * ==========================================
 */

const formatCategoryResponse = (category) => {

    if (!category) return null;

    const value = typeof category.toObject === "function"
        ? category.toObject()
        : category;

    return {

        id: value._id,

        categoryName: value.categoryName,

        categoryCode: value.categoryCode,

        categoryType: value.categoryType,

        slug: value.slug,

        description: value.description,

        icon: value.icon,

        bannerImage: value.bannerImage,

        parentCategory: value.parentCategory,

        level: value.level,

        displayOrder: value.displayOrder,

        totalBlogs: value.totalBlogs,

        isFeatured: value.isFeatured,

        status: value.status,

        seo: value.seo,

        metadata: value.metadata,

        createdAt: value.createdAt,

        updatedAt: value.updatedAt

    };

};


/**
 * ==========================================
 * Generate SEO Title
 * ==========================================
 */

const generateSeoTitle = (categoryName) => {

    return `${categoryName} | MBBS Abroad Blogs`;

};


/**
 * ==========================================
 * Generate SEO Description
 * ==========================================
 */

const generateSeoDescription = (categoryName) => {

    return `Explore the latest blogs, updates and complete guides related to ${categoryName}.`;

};


/**
 * ==========================================
 * Default SEO
 * ==========================================
 */

const getDefaultSeo = (categoryName) => {

    return {

        metaTitle: generateSeoTitle(categoryName),

        metaDescription: generateSeoDescription(categoryName),

        keywords: [],

        canonicalUrl: ""

    };

};


/**
 * ==========================================
 * Deep Clone Object
 * ==========================================
 */

const deepClone = (object) => {

    return JSON.parse(

        JSON.stringify(object)

    );

};


/**
 * ==========================================
 * Generate Breadcrumb
 * ==========================================
 */

const generateBreadcrumb = (

    category,

    parentCategory = null

) => {

    if (!parentCategory) {

        return [

            {

                title: category.categoryName,

                slug: category.slug

            }

        ];

    }

    return [

        {

            title: parentCategory.categoryName,

            slug: parentCategory.slug

        },

        {

            title: category.categoryName,

            slug: category.slug

        }

    ];

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
 * Get Category Path
 * ==========================================
 */

const getCategoryPath = (

    slug

) => {

    return `/category/${slug}`;

};


/**
 * ==========================================
 * Exports
 * ==========================================
 */

module.exports = {

    generateSlug,

    generateCategoryCode,

    buildCategoryTree,

    getPagination,

    buildSearchRegex,

    buildSortObject,

    removeDuplicateKeywords,

    isEmptyObject,

    formatCategoryResponse,

    generateSeoTitle,

    generateSeoDescription,

    getDefaultSeo,

    deepClone,

    generateBreadcrumb,

    isValidImage,

    getCategoryPath

};
