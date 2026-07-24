const crypto = require("crypto");

/**
 * ==========================================
 * Generate SEO Slug
 * ==========================================
 */

const generateSlug = (title = "") => {

    return title
        .trim()
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

};

/**
 * ==========================================
 * Generate Blog Code
 * ==========================================
 */

const generateBlogCode = (title = "") => {

    const random = crypto
        .randomBytes(3)
        .toString("hex")
        .toUpperCase();

    return `BLOG_${generateSlug(title)
        .replace(/-/g, "_")
        .toUpperCase()}_${random}`;

};

/**
 * ==========================================
 * Generate Excerpt
 * ==========================================
 */

const generateExcerpt = (

    content = "",

    length = 180

) => {

    if (!content) return "";
    if (typeof content !== "string") content = JSON.stringify(content);

    const plainText = content
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim();

    if (plainText.length <= length) {

        return plainText;

    }

    return plainText.substring(0, length) + "...";

};

/**
 * ==========================================
 * Calculate Reading Time
 * ==========================================
 */

const calculateReadingTime = (content = "") => {

    if (typeof content !== "string") content = JSON.stringify(content);
    const text = content
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim();

    const words = text.split(" ").length;

    return Math.max(1, Math.ceil(words / 200));

};

/**
 * ==========================================
 * Generate Table Of Contents
 * ==========================================
 */

const generateTOC = (html = "") => {

    const regex = /<h([1-6])[^>]*>(.*?)<\/h\1>/gi;

    const toc = [];

    let match;

    while ((match = regex.exec(html)) !== null) {

        toc.push({

            level: Number(match[1]),

            title: match[2]
                .replace(/<[^>]*>/g, ""),

            slug: generateSlug(match[2])

        });

    }

    return toc;

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

const buildSort = (

    sortBy = "createdAt",

    order = "desc"

) => {

    return {

        [sortBy]: order === "asc" ? 1 : -1

    };

};

/**
 * ==========================================
 * Search Regex
 * ==========================================
 */

const buildSearchRegex = (keyword = "") => {

    const escaped = keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(escaped, "i");

};

/**
 * ==========================================
 * Remove Duplicate IDs
 * ==========================================
 */

const uniqueIds = (ids = []) => {

    return [...new Set(ids)];

};

/**
 * ==========================================
 * Default SEO
 * ==========================================
 */

const getDefaultSeo = (title = "") => {

    return {

        metaTitle: title,

        metaDescription: "",

        keywords: [],

        canonicalUrl: "",

        robots: "index,follow"

    };

};

/**
 * ==========================================
 * Build Canonical URL
 * ==========================================
 */

const generateCanonicalUrl = (

    domain,

    slug

) => {

    return `${domain}/blogs/${slug}`;

};

/**
 * ==========================================
 * Featured Image Validation
 * ==========================================
 */

const isValidImage = (url = "") => {

    return /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(url);

};

/**
 * ==========================================
 * HTML Strip
 * ==========================================
 */

const stripHtml = (html = "") => {

    return html
        .replace(/<[^>]*>/g, "")
        .trim();

};

/**
 * ==========================================
 * Format Blog Response
 * ==========================================
 */

const formatBlogResponse = (blog) => {

    if (!blog) return null;

    return {

        id: blog._id,

        blogCode: blog.blogCode,

        title: blog.title,

        slug: blog.slug,

        shortDescription: blog.shortDescription,

        excerpt: blog.excerpt,

        content: blog.content,

        blogType: blog.blogType,

        featuredImage: blog.featuredImage,

        gallery: blog.gallery,

        videos: blog.videos,

        category: blog.category,

        tags: blog.tags,

        author: blog.author,

        template: blog.template,

        readingTime: blog.readingTime,

        totalViews: blog.totalViews,

        totalLikes: blog.totalLikes,

        totalShares: blog.totalShares,

        totalComments: blog.totalComments,

        status: blog.status,

        visibility: blog.visibility,

        isFeatured: blog.isFeatured,

        isTrending: blog.isTrending,

        isPinned: blog.isPinned,

        publishedAt: blog.publishedAt,

        scheduledAt: blog.scheduledAt,

        seo: blog.seo,

        faqs: blog.faqs,

        relatedBlogs: blog.relatedBlogs,

        metadata: blog.metadata,

        createdAt: blog.createdAt,

        updatedAt: blog.updatedAt

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
 * EXPORTS
 * ==========================================
 */

module.exports = {

    generateSlug,

    generateBlogCode,

    generateExcerpt,

    calculateReadingTime,

    generateTOC,

    getPagination,

    buildSort,

    buildSearchRegex,

    uniqueIds,

    getDefaultSeo,

    generateCanonicalUrl,

    isValidImage,

    stripHtml,

    formatBlogResponse,

    deepClone

};
