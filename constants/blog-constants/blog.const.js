/**
 * ==========================================
 * BLOG STATUS
 * ==========================================
 */

const BLOG_STATUS = {

    DRAFT: "DRAFT",

    REVIEW: "REVIEW",

    SCHEDULED: "SCHEDULED",

    PUBLISHED: "PUBLISHED",

    ARCHIVED: "ARCHIVED"

};


/**
 * ==========================================
 * BLOG VISIBILITY
 * ==========================================
 */

const BLOG_VISIBILITY = {

    PUBLIC: "PUBLIC",

    PRIVATE: "PRIVATE",

    PASSWORD: "PASSWORD"

};


/**
 * ==========================================
 * BLOG TYPES
 * ==========================================
 */

const BLOG_TYPES = {

    BLOG: "BLOG",

    NEWS: "NEWS",

    ARTICLE: "ARTICLE",

    GUIDE: "GUIDE",

    FAQ: "FAQ",

    CASE_STUDY: "CASE_STUDY"

};


/**
 * ==========================================
 * DEFAULT VALUES
 * ==========================================
 */

const DEFAULT_VALUES = {

    STATUS: BLOG_STATUS.DRAFT,

    VISIBILITY: BLOG_VISIBILITY.PUBLIC,

    IS_FEATURED: false,

    IS_TRENDING: false,

    IS_PINNED: false,

    READING_TIME: 0,

    TOTAL_VIEWS: 0,

    TOTAL_LIKES: 0,

    TOTAL_SHARES: 0,

    TOTAL_COMMENTS: 0,

    IS_DELETED: false

};


/**
 * ==========================================
 * FIELD LIMITS
 * ==========================================
 */

const LIMITS = {

    TITLE_MIN: 10,

    TITLE_MAX: 250,

    SHORT_DESCRIPTION_MAX: 500,

    EXCERPT_MAX: 1000,

    PAGE_LIMIT: 10,

    MAX_PAGE_LIMIT: 100,

    MAX_TAGS: 20,

    MAX_FAQS: 20,

    MAX_RELATED_BLOGS: 20,

    MAX_GALLERY_IMAGES: 30,

    MAX_VIDEOS: 20

};


/**
 * ==========================================
 * BLOG RESPONSE MESSAGES
 * ==========================================
 */

const MESSAGES = {

    CREATE_SUCCESS: "Blog created successfully.",

    UPDATE_SUCCESS: "Blog updated successfully.",

    DELETE_SUCCESS: "Blog deleted successfully.",

    RESTORE_SUCCESS: "Blog restored successfully.",

    PUBLISH_SUCCESS: "Blog published successfully.",

    UNPUBLISH_SUCCESS: "Blog unpublished successfully.",

    SCHEDULE_SUCCESS: "Blog scheduled successfully.",

    DUPLICATE_SUCCESS: "Blog duplicated successfully.",

    STATUS_UPDATED: "Blog status updated successfully.",

    FETCH_SUCCESS: "Blog fetched successfully.",

    FETCH_ALL_SUCCESS: "Blogs fetched successfully.",

    SEARCH_SUCCESS: "Blogs fetched successfully.",

    FEATURED_SUCCESS: "Featured blogs fetched successfully.",

    TRENDING_SUCCESS: "Trending blogs fetched successfully.",

    LATEST_SUCCESS: "Latest blogs fetched successfully.",

    RELATED_SUCCESS: "Related blogs fetched successfully.",

    STATISTICS_SUCCESS: "Blog statistics fetched successfully.",

    NOT_FOUND: "Blog not found.",

    SLUG_EXISTS: "Slug already exists.",

    INVALID_STATUS: "Invalid blog status.",

    INVALID_VISIBILITY: "Invalid blog visibility.",

    INVALID_ID: "Invalid blog ID."

};


/**
 * ==========================================
 * SORT FIELDS
 * ==========================================
 */

const SORT_FIELDS = {

    TITLE: "title",

    CREATED_AT: "createdAt",

    UPDATED_AT: "updatedAt",

    PUBLISHED_AT: "publishedAt",

    TOTAL_VIEWS: "totalViews",

    TOTAL_LIKES: "totalLikes",

    TOTAL_COMMENTS: "totalComments",

    READING_TIME: "readingTime"

};


/**
 * ==========================================
 * SORT ORDER
 * ==========================================
 */

const SORT_ORDER = {

    ASC: "asc",

    DESC: "desc"

};


/**
 * ==========================================
 * SEARCHABLE FIELDS
 * ==========================================
 */

const SEARCH_FIELDS = [

    "title",

    "slug",

    "shortDescription",

    "excerpt"

];


/**
 * ==========================================
 * DEFAULT SEO
 * ==========================================
 */

const DEFAULT_SEO = {

    META_TITLE: "",

    META_DESCRIPTION: "",

    KEYWORDS: [],

    CANONICAL_URL: "",

    ROBOTS: "index,follow"

};


/**
 * ==========================================
 * DEFAULT ANALYTICS
 * ==========================================
 */

const ANALYTICS = {

    INITIAL_VIEWS: 0,

    INITIAL_LIKES: 0,

    INITIAL_SHARES: 0,

    INITIAL_COMMENTS: 0

};


/**
 * ==========================================
 * CACHE KEYS
 * ==========================================
 */

const CACHE_KEYS = {

    BLOG_LIST: "BLOG_LIST",

    FEATURED_BLOGS: "FEATURED_BLOGS",

    TRENDING_BLOGS: "TRENDING_BLOGS",

    LATEST_BLOGS: "LATEST_BLOGS"

};


/**
 * ==========================================
 * EXPORTS
 * ==========================================
 */

module.exports = {

    BLOG_STATUS,

    BLOG_VISIBILITY,

    BLOG_TYPES,

    DEFAULT_VALUES,

    LIMITS,

    MESSAGES,

    SORT_FIELDS,

    SORT_ORDER,

    SEARCH_FIELDS,

    DEFAULT_SEO,

    ANALYTICS,

    CACHE_KEYS

};