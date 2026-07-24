/**
 * ==========================================
 * CATEGORY STATUS
 * ==========================================
 */

const CATEGORY_STATUS = {

    ACTIVE: true,

    INACTIVE: false

};


/**
 * ==========================================
 * CATEGORY LEVEL
 * ==========================================
 */

const CATEGORY_LEVEL = {

    ROOT: 1,

    CHILD: 2

};


/**
 * ==========================================
 * DEFAULT VALUES
 * ==========================================
 */

const DEFAULT_VALUES = {

    DISPLAY_ORDER: 0,

    TOTAL_BLOGS: 0,

    IS_FEATURED: false,

    IS_DELETED: false,

    STATUS: true

};


/**
 * ==========================================
 * CATEGORY LIMITS
 * ==========================================
 */

const LIMITS = {

    CATEGORY_NAME_MIN: 3,

    CATEGORY_NAME_MAX: 100,

    DESCRIPTION_MAX: 500,

    PAGE_LIMIT: 10,

    MAX_PAGE_LIMIT: 100

};


/**
 * ==========================================
 * CATEGORY MESSAGES
 * ==========================================
 */

const MESSAGES = {

    CREATE_SUCCESS: "Category created successfully.",

    UPDATE_SUCCESS: "Category updated successfully.",

    DELETE_SUCCESS: "Category deleted successfully.",

    RESTORE_SUCCESS: "Category restored successfully.",

    STATUS_UPDATED: "Category status updated successfully.",

    FETCH_SUCCESS: "Category fetched successfully.",

    FETCH_ALL_SUCCESS: "Categories fetched successfully.",

    DROPDOWN_SUCCESS: "Category dropdown fetched successfully.",

    NOT_FOUND: "Category not found.",

    ALREADY_EXISTS: "Category already exists.",

    SLUG_EXISTS: "Category slug already exists.",

    INVALID_PARENT: "Invalid parent category.",

    CANNOT_DELETE_PARENT: "Cannot delete a category that contains child categories.",

    CANNOT_DELETE_BLOG_CATEGORY: "Cannot delete category because blogs are assigned to it.",

    INVALID_STATUS: "Invalid category status.",

    INVALID_ID: "Invalid category ID."

};


/**
 * ==========================================
 * SORT OPTIONS
 * ==========================================
 */

const SORT_FIELDS = {

    NAME: "categoryName",

    CREATED_AT: "createdAt",

    UPDATED_AT: "updatedAt",

    DISPLAY_ORDER: "displayOrder"

};


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

    "categoryName",

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
 * CATEGORY TYPES
 * ==========================================
 */

const CATEGORY_TYPES = {

    BLOG: "BLOG",

    EXAM: "EXAM",

    COUNTRY: "COUNTRY",

    UNIVERSITY: "UNIVERSITY",

    REVIEW: "REVIEW",

    NEWS: "NEWS",

    SCHOLARSHIP: "SCHOLARSHIP",

    VISA: "VISA",

    HOSTEL: "HOSTEL"

};


/**
 * ==========================================
 * EXPORTS
 * ==========================================
 */

module.exports = {

    CATEGORY_STATUS,

    CATEGORY_LEVEL,

    DEFAULT_VALUES,

    LIMITS,

    MESSAGES,

    SORT_FIELDS,

    SORT_ORDER,

    SEARCH_FIELDS,

    DEFAULT_SEO,

    CATEGORY_TYPES

};