"use strict";

/**
 * ==========================================================
 * Page Types
 * ==========================================================
 */

const PAGE_TYPES = Object.freeze({

    HOME: "HOME",

    BLOG: "BLOG",

    CATEGORY: "CATEGORY",

    TAG: "TAG",

    AUTHOR: "AUTHOR",

    SEARCH: "SEARCH"

});

/**
 * ==========================================================
 * Default Pagination
 * ==========================================================
 */

const DEFAULT_PAGE = 1;

const DEFAULT_LIMIT = 10;

const MAX_LIMIT = 100;

/**
 * ==========================================================
 * Blog Limits
 * ==========================================================
 */

const FEATURED_BLOG_LIMIT = 6;

const LATEST_BLOG_LIMIT = 10;

const RELATED_BLOG_LIMIT = 6;

const POPULAR_BLOG_LIMIT = 8;

/**
 * ==========================================================
 * Search
 * ==========================================================
 */

const MIN_SEARCH_LENGTH = 2;

const MAX_SEARCH_LENGTH = 100;

/**
 * ==========================================================
 * Cache
 * ==========================================================
 */

const CACHE_DURATION = 300; // 5 Minutes

/**
 * ==========================================================
 * Breadcrumb
 * ==========================================================
 */

const HOME_BREADCRUMB = Object.freeze({

    title: "Home",

    slug: "",

    url: "/"

});

/**
 * ==========================================================
 * Response Messages
 * ==========================================================
 */

const PAGE_MESSAGES = Object.freeze({

    PAGE_FOUND: "Page loaded successfully.",

    PAGE_NOT_FOUND: "Requested page not found.",

    BLOG_NOT_FOUND: "Blog not found.",

    CATEGORY_NOT_FOUND: "Category not found.",

    TAG_NOT_FOUND: "Tag not found.",

    AUTHOR_NOT_FOUND: "Author not found.",

    INVALID_SLUG: "Invalid slug."

});

/**
 * ==========================================================
 * Exports
 * ==========================================================
 */

module.exports = {

    PAGE_TYPES,

    DEFAULT_PAGE,

    DEFAULT_LIMIT,

    MAX_LIMIT,

    FEATURED_BLOG_LIMIT,

    LATEST_BLOG_LIMIT,

    RELATED_BLOG_LIMIT,

    POPULAR_BLOG_LIMIT,

    MIN_SEARCH_LENGTH,

    MAX_SEARCH_LENGTH,

    CACHE_DURATION,

    HOME_BREADCRUMB,

    PAGE_MESSAGES

};