
const REVIEW_TYPES = {

    UNIVERSITY: "UNIVERSITY",

    COUNTRY: "COUNTRY",

    BLOG: "BLOG",

    CONSULTANT: "CONSULTANT",

    AUTHOR: "AUTHOR",

    WEBSITE: "WEBSITE"

};

/*
=========================================================
REVIEW STATUS
=========================================================
*/

const REVIEW_STATUS = {

    PENDING: "PENDING",

    APPROVED: "APPROVED",

    REJECTED: "REJECTED",

    SPAM: "SPAM"

};

/*
=========================================================
MEDIA TYPES
=========================================================
*/

const MEDIA_TYPES = {

    IMAGE: "IMAGE",

    VIDEO: "VIDEO"

};

/*
=========================================================
RATING
=========================================================
*/

const RATING = {

    MIN: 1,

    MAX: 5,

    DEFAULT: 5

};

/*
=========================================================
SORT FIELDS
=========================================================
*/

const SORT_FIELDS = {

    CREATED_AT: "createdAt",

    UPDATED_AT: "updatedAt",

    REVIEWER_NAME: "reviewerName",

    RATING: "rating",

    STATUS: "status"

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

const SEARCH_FIELDS = [

    "reviewerName",

    "title",

    "review",

    "country",

    "city"

];

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
FEATURE FLAGS
=========================================================
*/

const FEATURE = {

    FEATURED: true,

    NOT_FEATURED: false

};

/*
=========================================================
VERIFICATION
=========================================================
*/

const VERIFICATION = {

    VERIFIED: true,

    NOT_VERIFIED: false

};

/*
=========================================================
LIMITS
=========================================================
*/

const LIMITS = {

    REVIEW_TITLE_MIN: 5,

    REVIEW_TITLE_MAX: 150,

    REVIEW_MIN: 20,

    REVIEW_MAX: 5000,

    NAME_MIN: 2,

    NAME_MAX: 100,

    MAX_MEDIA: 10,

    MAX_REPORT_COUNT: 100

};

/*
=========================================================
DEFAULT VALUES
=========================================================
*/

const DEFAULTS = {

    STATUS: REVIEW_STATUS.PENDING,

    FEATURED: false,

    VERIFIED: false,

    HELPFUL_COUNT: 0,

    REPORT_COUNT: 0

};

/*
=========================================================
MESSAGES
=========================================================
*/

const MESSAGES = {

    REVIEW_CREATED: "Review created successfully.",

    REVIEW_UPDATED: "Review updated successfully.",

    REVIEW_DELETED: "Review deleted successfully.",

    REVIEW_RESTORED: "Review restored successfully.",

    REVIEW_APPROVED: "Review approved successfully.",

    REVIEW_REJECTED: "Review rejected successfully.",

    REVIEW_FEATURED: "Review marked as featured.",

    REVIEW_UNFEATURED: "Review removed from featured list.",

    REVIEW_NOT_FOUND: "Review not found.",

    DUPLICATE_REVIEW: "Review already exists.",

    INVALID_RATING: "Rating must be between 1 and 5.",

    INVALID_REVIEW_TYPE: "Invalid review type.",

    INVALID_STATUS: "Invalid review status.",

    FETCH_SUCCESS: "Review fetched successfully.",

    FETCH_ALL_SUCCESS: "Reviews fetched successfully."

};

/*
=========================================================
CACHE KEYS
=========================================================
*/

const CACHE_KEYS = {

    REVIEW_LIST: "REVIEW_LIST",

    REVIEW_DETAILS: "REVIEW_DETAILS",

    REVIEW_STATISTICS: "REVIEW_STATISTICS",

    FEATURED_REVIEWS: "FEATURED_REVIEWS"

};

/*
=========================================================
EXPORTS
=========================================================
*/

module.exports = {

    REVIEW_TYPES,

    REVIEW_STATUS,

    MEDIA_TYPES,

    RATING,

    SORT_FIELDS,

    SORT_ORDER,

    SEARCH_FIELDS,

    PAGINATION,

    FEATURE,

    VERIFICATION,

    LIMITS,

    DEFAULTS,

    MESSAGES,

    CACHE_KEYS

};