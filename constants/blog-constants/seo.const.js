/**
 * =========================================================
 * MODULE TYPES
 * =========================================================
 */

const MODULES = {

    BLOG: "BLOG",

    PAGE: "PAGE",

    AUTHOR: "AUTHOR",

    CATEGORY: "CATEGORY",

    TAG: "TAG",

    COUNTRY: "COUNTRY",

    UNIVERSITY: "UNIVERSITY",

    HOME: "HOME",

    SERVICE: "SERVICE"

};


/**
 * =========================================================
 * ROBOTS
 * =========================================================
 */

const ROBOTS = {

    INDEX_FOLLOW: "index,follow",

    INDEX_NOFOLLOW: "index,nofollow",

    NOINDEX_FOLLOW: "noindex,follow",

    NOINDEX_NOFOLLOW: "noindex,nofollow"

};


/**
 * =========================================================
 * OPEN GRAPH TYPES
 * =========================================================
 */

const OPEN_GRAPH_TYPES = {

    WEBSITE: "website",

    ARTICLE: "article",

    PROFILE: "profile",

    BOOK: "book"

};


/**
 * =========================================================
 * TWITTER CARDS
 * =========================================================
 */

const TWITTER_CARDS = {

    SUMMARY: "summary",

    SUMMARY_LARGE_IMAGE: "summary_large_image",

    APP: "app",

    PLAYER: "player"

};


/**
 * =========================================================
 * SCHEMA TYPES
 * =========================================================
 */

const SCHEMA_TYPES = {

    ARTICLE: "Article",

    BLOG_POSTING: "BlogPosting",

    FAQ: "FAQPage",

    ORGANIZATION: "Organization",

    PERSON: "Person",

    WEB_SITE: "WebSite",

    WEB_PAGE: "WebPage",

    BREADCRUMB: "BreadcrumbList",

    LOCAL_BUSINESS: "LocalBusiness"

};


/**
 * =========================================================
 * CHANGE FREQUENCY
 * =========================================================
 */

const CHANGE_FREQUENCY = {

    ALWAYS: "always",

    HOURLY: "hourly",

    DAILY: "daily",

    WEEKLY: "weekly",

    MONTHLY: "monthly",

    YEARLY: "yearly",

    NEVER: "never"

};


/**
 * =========================================================
 * PRIORITY
 * =========================================================
 */

const PRIORITY = {

    HOME: 1.0,

    BLOG: 0.8,

    CATEGORY: 0.7,

    TAG: 0.6,

    UNIVERSITY: 0.8,

    COUNTRY: 0.8,

    AUTHOR: 0.5,

    PAGE: 0.7

};


/**
 * =========================================================
 * LIMITS
 * =========================================================
 */

const LIMITS = {

    META_TITLE_MIN: 10,

    META_TITLE_MAX: 60,

    META_DESCRIPTION_MIN: 50,

    META_DESCRIPTION_MAX: 160,

    META_KEYWORDS_MAX: 15,

    SLUG_MIN: 3,

    SLUG_MAX: 200

};


/**
 * =========================================================
 * DEFAULT VALUES
 * =========================================================
 */

const DEFAULTS = {

    ROBOTS: ROBOTS.INDEX_FOLLOW,

    SCHEMA_TYPE: SCHEMA_TYPES.ARTICLE,

    OPEN_GRAPH_TYPE: OPEN_GRAPH_TYPES.WEBSITE,

    TWITTER_CARD: TWITTER_CARDS.SUMMARY_LARGE_IMAGE,

    CHANGE_FREQUENCY: CHANGE_FREQUENCY.WEEKLY,

    PRIORITY: 0.8,

    IS_ACTIVE: true,

    IS_DELETED: false

};


/**
 * =========================================================
 * RESPONSE MESSAGES
 * =========================================================
 */

const MESSAGES = {

    CREATE_SUCCESS: "SEO created successfully.",

    UPDATE_SUCCESS: "SEO updated successfully.",

    DELETE_SUCCESS: "SEO deleted successfully.",

    RESTORE_SUCCESS: "SEO restored successfully.",

    FETCH_SUCCESS: "SEO fetched successfully.",

    FETCH_ALL_SUCCESS: "SEO records fetched successfully.",

    SEARCH_SUCCESS: "SEO search completed successfully.",

    NOT_FOUND: "SEO record not found.",

    DUPLICATE_SLUG: "Slug already exists.",

    INVALID_SLUG: "Invalid slug.",

    INVALID_ROBOTS: "Invalid robots value.",

    INVALID_SCHEMA: "Invalid schema type."

};


/**
 * =========================================================
 * SORT FIELDS
 * =========================================================
 */

const SORT_FIELDS = {

    CREATED_AT: "createdAt",

    UPDATED_AT: "updatedAt",

    META_TITLE: "metaTitle",

    SLUG: "slug"

};


/**
 * =========================================================
 * SORT ORDER
 * =========================================================
 */

const SORT_ORDER = {

    ASC: "asc",

    DESC: "desc"

};


/**
 * =========================================================
 * SEARCHABLE FIELDS
 * =========================================================
 */

const SEARCH_FIELDS = [

    "metaTitle",

    "metaDescription",

    "slug",

    "metaKeywords"

];


/**
 * =========================================================
 * EXPORTS
 * =========================================================
 */

module.exports = {

    MODULES,

    ROBOTS,

    OPEN_GRAPH_TYPES,

    TWITTER_CARDS,

    SCHEMA_TYPES,

    CHANGE_FREQUENCY,

    PRIORITY,

    LIMITS,

    DEFAULTS,

    MESSAGES,

    SORT_FIELDS,

    SORT_ORDER,

    SEARCH_FIELDS

};