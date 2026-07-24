/*
=========================================================
SEARCH MODULES
=========================================================
*/

const SEARCH_MODULES = {

    GLOBAL: "GLOBAL",

    BLOG: "BLOG",

    CATEGORY: "CATEGORY",

    TAG: "TAG",

    AUTHOR: "AUTHOR",

    REVIEW: "REVIEW",

    SEO: "SEO",

    MEDIA: "MEDIA",

    UNIVERSITY: "UNIVERSITY",

    COUNTRY: "COUNTRY"

};

/*
=========================================================
SORT FIELDS
=========================================================
*/

const SORT_FIELDS = {

    RELEVANCE: "relevance",

    CREATED_AT: "createdAt",

    UPDATED_AT: "updatedAt",

    TITLE: "title",

    NAME: "name",

    RATING: "rating",

    POPULARITY: "popularity"

};

/*
=========================================================
SORT ORDER
=========================================================
*/

const SORT_ORDER = {

    ASC: "asc",

    DESC: "desc"

};

/*
=========================================================
SEARCHABLE FIELDS
=========================================================
*/

const SEARCH_FIELDS = {

    BLOG: [

        "title",

        "slug",

        "excerpt",

        "content"

    ],

    CATEGORY: [

        "name",

        "slug",

        "description"

    ],

    TAG: [

        "name",

        "slug"

    ],

    AUTHOR: [

        "name",

        "bio",

        "designation"

    ],

    REVIEW: [

        "title",

        "review",

        "reviewerName"

    ],

    UNIVERSITY: [

        "name",

        "slug",

        "description"

    ],

    COUNTRY: [

        "name",

        "slug",

        "description"

    ],

    SEO: [

        "metaTitle",

        "metaDescription",

        "slug"

    ]

};

/*
=========================================================
PAGINATION
=========================================================
*/

const PAGINATION = {

    DEFAULT_PAGE: 1,

    DEFAULT_LIMIT: 10,

    MAX_LIMIT: 100

};

/*
=========================================================
SEARCH LIMITS
=========================================================
*/

const SEARCH_LIMITS = {

    MIN_KEYWORD_LENGTH: 2,

    MAX_KEYWORD_LENGTH: 100,

    DEFAULT_SUGGESTION_LIMIT: 10,

    DEFAULT_GLOBAL_LIMIT: 20,

    MAX_GLOBAL_LIMIT: 100

};

/*
=========================================================
CACHE KEYS
=========================================================
*/

const CACHE_KEYS = {

    GLOBAL_SEARCH: "GLOBAL_SEARCH",

    SEARCH_SUGGESTIONS: "SEARCH_SUGGESTIONS",

    TRENDING_SEARCHES: "TRENDING_SEARCHES",

    RECENT_SEARCHES: "RECENT_SEARCHES"

};

/*
=========================================================
MESSAGES
=========================================================
*/

const MESSAGES = {

    SEARCH_SUCCESS: "Search completed successfully.",

    SEARCH_NOT_FOUND: "No results found.",

    INVALID_KEYWORD: "Invalid search keyword.",

    INVALID_MODULE: "Invalid search module.",

    SUGGESTIONS_SUCCESS: "Suggestions fetched successfully.",

    TRENDING_SUCCESS: "Trending searches fetched successfully.",

    RECENT_SUCCESS: "Recent searches fetched successfully."

};

/*
=========================================================
FILTER TYPES
=========================================================
*/

const FILTERS = {

    COUNTRY: "country",

    CATEGORY: "category",

    UNIVERSITY: "university",

    AUTHOR: "author",

    TAG: "tag",

    RATING: "rating"

};

/*
=========================================================
REGEX
=========================================================
*/

const REGEX = {

    SEARCH: /[a-zA-Z0-9\s-]+/

};

/*
=========================================================
EXPORTS
=========================================================
*/

module.exports = {

    SEARCH_MODULES,

    SORT_FIELDS,

    SORT_ORDER,

    SEARCH_FIELDS,

    PAGINATION,

    SEARCH_LIMITS,

    CACHE_KEYS,

    MESSAGES,

    FILTERS,

    REGEX

};