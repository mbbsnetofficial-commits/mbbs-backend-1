/**
 * ==========================================
 * TAG STATUS
 * ==========================================
 */

const TAG_STATUS = {

    ACTIVE: true,

    INACTIVE: false

};


/**
 * ==========================================
 * TAG TYPES
 * ==========================================
 */

const TAG_TYPES = {

    COUNTRY: "COUNTRY",

    EXAM: "EXAM",

    UNIVERSITY: "UNIVERSITY",

    COURSE: "COURSE",

    SCHOLARSHIP: "SCHOLARSHIP",

    HOSTEL: "HOSTEL",

    VISA: "VISA",

    NEWS: "NEWS",

    GENERAL: "GENERAL"

};


/**
 * ==========================================
 * DEFAULT VALUES
 * ==========================================
 */

const DEFAULT_VALUES = {

    DISPLAY_ORDER: 0,

    TOTAL_BLOGS: 0,

    TOTAL_VIEWS: 0,

    STATUS: true,

    IS_FEATURED: false,

    IS_DELETED: false,

    DEFAULT_COLOR: "#2196F3"

};


/**
 * ==========================================
 * FIELD LIMITS
 * ==========================================
 */

const LIMITS = {

    TAG_NAME_MIN: 2,

    TAG_NAME_MAX: 100,

    DESCRIPTION_MAX: 500,

    PAGE_LIMIT: 10,

    MAX_PAGE_LIMIT: 100

};


/**
 * ==========================================
 * API MESSAGES
 * ==========================================
 */

const MESSAGES = {

    CREATE_SUCCESS: "Tag created successfully.",

    UPDATE_SUCCESS: "Tag updated successfully.",

    DELETE_SUCCESS: "Tag deleted successfully.",

    RESTORE_SUCCESS: "Tag restored successfully.",

    STATUS_UPDATED: "Tag status updated successfully.",

    FETCH_SUCCESS: "Tag fetched successfully.",

    FETCH_ALL_SUCCESS: "Tags fetched successfully.",

    SEARCH_SUCCESS: "Tags searched successfully.",

    DROPDOWN_SUCCESS: "Tag dropdown fetched successfully.",

    POPULAR_SUCCESS: "Popular tags fetched successfully.",

    STATISTICS_SUCCESS: "Tag statistics fetched successfully.",

    NOT_FOUND: "Tag not found.",

    ALREADY_EXISTS: "Tag already exists.",

    SLUG_EXISTS: "Tag slug already exists.",

    CANNOT_DELETE_ASSIGNED: "Cannot delete tag because blogs are assigned to it.",

    INVALID_STATUS: "Invalid tag status.",

    INVALID_ID: "Invalid tag ID.",

    INVALID_TAG_TYPE: "Invalid tag type."

};


/**
 * ==========================================
 * SORT FIELDS
 * ==========================================
 */

const SORT_FIELDS = {

    TAG_NAME: "tagName",

    CREATED_AT: "createdAt",

    UPDATED_AT: "updatedAt",

    DISPLAY_ORDER: "displayOrder",

    TOTAL_BLOGS: "totalBlogs",

    TOTAL_VIEWS: "totalViews"

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

    "tagName",

    "description",

    "slug"

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

    CANONICAL_URL: ""

};


/**
 * ==========================================
 * FEATURED LIMIT
 * ==========================================
 */

const FEATURED_LIMIT = 10;


/**
 * ==========================================
 * EXPORTS
 * ==========================================
 */

module.exports = {

    TAG_STATUS,

    TAG_TYPES,

    DEFAULT_VALUES,

    LIMITS,

    MESSAGES,

    SORT_FIELDS,

    SORT_ORDER,

    SEARCH_FIELDS,

    DEFAULT_SEO,

    FEATURED_LIMIT

};
