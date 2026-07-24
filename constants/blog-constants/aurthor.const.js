/**
 * ==========================================
 * AUTHOR STATUS
 * ==========================================
 */

const AUTHOR_STATUS = {

    ACTIVE: true,

    INACTIVE: false

};


/**
 * ==========================================
 * AUTHOR TYPES
 * ==========================================
 */

const AUTHOR_TYPES = {

    ADMIN: "ADMIN",

    EDITOR: "EDITOR",

    COUNSELOR: "COUNSELOR",

    DOCTOR: "DOCTOR",

    UNIVERSITY_REPRESENTATIVE: "UNIVERSITY_REPRESENTATIVE",

    GUEST_AUTHOR: "GUEST_AUTHOR"

};


/**
 * ==========================================
 * DEFAULT VALUES
 * ==========================================
 */

const DEFAULT_VALUES = {

    STATUS: true,

    IS_FEATURED: false,

    DISPLAY_ORDER: 0,

    EXPERIENCE: 0,

    TOTAL_BLOGS: 0,

    TOTAL_VIEWS: 0,

    TOTAL_LIKES: 0,

    TOTAL_COMMENTS: 0,

    IS_DELETED: false

};


/**
 * ==========================================
 * FIELD LIMITS
 * ==========================================
 */

const LIMITS = {

    NAME_MIN: 2,

    NAME_MAX: 100,

    BIO_MAX: 3000,

    DESIGNATION_MAX: 150,

    PHONE_MAX: 20,

    PAGE_LIMIT: 10,

    MAX_PAGE_LIMIT: 100

};


/**
 * ==========================================
 * API RESPONSE MESSAGES
 * ==========================================
 */

const MESSAGES = {

    CREATE_SUCCESS: "Author created successfully.",

    UPDATE_SUCCESS: "Author updated successfully.",

    DELETE_SUCCESS: "Author deleted successfully.",

    RESTORE_SUCCESS: "Author restored successfully.",

    STATUS_UPDATED: "Author status updated successfully.",

    FETCH_SUCCESS: "Author fetched successfully.",

    FETCH_ALL_SUCCESS: "Authors fetched successfully.",

    SEARCH_SUCCESS: "Authors fetched successfully.",

    FEATURED_SUCCESS: "Featured authors fetched successfully.",

    DROPDOWN_SUCCESS: "Author dropdown fetched successfully.",

    STATISTICS_SUCCESS: "Author statistics fetched successfully.",

    NOT_FOUND: "Author not found.",

    EMAIL_EXISTS: "Email already exists.",

    SLUG_EXISTS: "Slug already exists.",

    INVALID_STATUS: "Invalid author status.",

    INVALID_AUTHOR_TYPE: "Invalid author type.",

    INVALID_ID: "Invalid author ID."

};


/**
 * ==========================================
 * SORT FIELDS
 * ==========================================
 */

const SORT_FIELDS = {

    FULL_NAME: "fullName",

    DISPLAY_ORDER: "displayOrder",

    TOTAL_BLOGS: "totalBlogs",

    TOTAL_VIEWS: "totalViews",

    CREATED_AT: "createdAt",

    UPDATED_AT: "updatedAt"

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

    "fullName",

    "email",

    "designation",

    "bio",

    "country",

    "city"

];


/**
 * ==========================================
 * SOCIAL MEDIA PLATFORMS
 * ==========================================
 */

const SOCIAL_PLATFORMS = {

    WEBSITE: "website",

    LINKEDIN: "linkedin",

    FACEBOOK: "facebook",

    INSTAGRAM: "instagram",

    TWITTER: "twitter",

    YOUTUBE: "youtube"

};


/**
 * ==========================================
 * DEFAULT SEO
 * ==========================================
 */

const DEFAULT_SEO = {

    META_TITLE: "",

    META_DESCRIPTION: "",

    KEYWORDS: [],

    CANONICAL_URL: ""

};


/**
 * ==========================================
 * FEATURED AUTHOR LIMIT
 * ==========================================
 */

const FEATURED_LIMIT = 10;


/**
 * ==========================================
 * EXPORTS
 * ==========================================
 */

module.exports = {

    AUTHOR_STATUS,

    AUTHOR_TYPES,

    DEFAULT_VALUES,

    LIMITS,

    MESSAGES,

    SORT_FIELDS,

    SORT_ORDER,

    SEARCH_FIELDS,

    SOCIAL_PLATFORMS,

    DEFAULT_SEO,

    FEATURED_LIMIT

};