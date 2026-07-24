/**
 * =====================================================
 * CLOUDINARY FOLDERS
 * =====================================================
 */

const CLOUDINARY_FOLDERS = {

    ROOT: "mbbs-cms",

    BLOGS: "mbbs-cms/blogs",

    AUTHORS: "mbbs-cms/authors",

    CATEGORIES: "mbbs-cms/categories",

    TAGS: "mbbs-cms/tags",

    TEMPLATES: "mbbs-cms/templates",

    UNIVERSITIES: "mbbs-cms/universities",

    COUNTRIES: "mbbs-cms/countries",

    USERS: "mbbs-cms/users",

    BANNERS: "mbbs-cms/banners",

    SEO: "mbbs-cms/seo",

    DOCUMENTS: "mbbs-cms/documents",

    VIDEOS: "mbbs-cms/videos",

    TEMP: "mbbs-cms/temp"

};

/**
 * =====================================================
 * RESOURCE TYPES
 * =====================================================
 */

const RESOURCE_TYPES = {

    IMAGE: "image",

    VIDEO: "video",

    RAW: "raw",

    AUTO: "auto"

};

/**
 * =====================================================
 * FILE TYPES
 * =====================================================
 */

const FILE_TYPES = {

    IMAGE: "IMAGE",

    VIDEO: "VIDEO",

    DOCUMENT: "DOCUMENT"

};

/**
 * =====================================================
 * IMAGE FORMATS
 * =====================================================
 */

const IMAGE_FORMATS = [

    "jpg",

    "jpeg",

    "png",

    "gif",

    "webp",

    "svg"

];

/**
 * =====================================================
 * VIDEO FORMATS
 * =====================================================
 */

const VIDEO_FORMATS = [

    "mp4",

    "mov",

    "avi",

    "mkv",

    "webm"

];

/**
 * =====================================================
 * DOCUMENT FORMATS
 * =====================================================
 */

const DOCUMENT_FORMATS = [

    "pdf",

    "doc",

    "docx",

    "xls",

    "xlsx",

    "ppt",

    "pptx"

];

/**
 * =====================================================
 * MIME TYPES
 * =====================================================
 */

const MIME_TYPES = {

    IMAGE: [

        "image/jpeg",

        "image/jpg",

        "image/png",

        "image/webp",

        "image/gif",

        "image/svg+xml"

    ],

    VIDEO: [

        "video/mp4",

        "video/webm",

        "video/quicktime",

        "video/mpeg"

    ],

    DOCUMENT: [

        "application/pdf",

        "application/msword",

        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

        "application/vnd.ms-excel",

        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

        "application/vnd.ms-powerpoint",

        "application/vnd.openxmlformats-officedocument.presentationml.presentation"

    ]

};

/**
 * =====================================================
 * FILE SIZE LIMITS
 * =====================================================
 */

const FILE_LIMITS = {

    IMAGE_SIZE: 10 * 1024 * 1024,

    VIDEO_SIZE: 100 * 1024 * 1024,

    DOCUMENT_SIZE: 20 * 1024 * 1024,

    MAX_FILES: 20

};

/**
 * =====================================================
 * IMAGE TRANSFORMATIONS
 * =====================================================
 */

const IMAGE_TRANSFORMATIONS = {

    QUALITY: "auto",

    FETCH_FORMAT: "auto",

    CROP: "fill",

    WIDTH: 1200,

    HEIGHT: 630

};

/**
 * =====================================================
 * MEDIA STATUS
 * =====================================================
 */

const MEDIA_STATUS = {

    ACTIVE: "ACTIVE",

    DELETED: "DELETED"

};

/**
 * =====================================================
 * DEFAULT VALUES
 * =====================================================
 */

const DEFAULTS = {

    ALT_TEXT: "",

    CAPTION: "",

    TAGS: [],

    IS_DELETED: false

};

/**
 * =====================================================
 * RESPONSE MESSAGES
 * =====================================================
 */

const MESSAGES = {

    UPLOAD_SUCCESS: "File uploaded successfully.",

    MULTIPLE_UPLOAD_SUCCESS: "Files uploaded successfully.",

    DELETE_SUCCESS: "File deleted successfully.",

    RESTORE_SUCCESS: "File restored successfully.",

    REPLACE_SUCCESS: "File replaced successfully.",

    FETCH_SUCCESS: "Media fetched successfully.",

    FETCH_ALL_SUCCESS: "Media list fetched successfully.",

    NOT_FOUND: "Media not found.",

    INVALID_FILE: "Invalid file type.",

    FILE_TOO_LARGE: "File size exceeds the allowed limit.",

    CLOUDINARY_ERROR: "Cloudinary upload failed."

};

/**
 * =====================================================
 * SORT FIELDS
 * =====================================================
 */

const SORT_FIELDS = {

    CREATED_AT: "createdAt",

    UPDATED_AT: "updatedAt",

    FILE_NAME: "originalName",

    SIZE: "bytes"

};

/**
 * =====================================================
 * SORT ORDER
 * =====================================================
 */

const SORT_ORDER = {

    ASC: "asc",

    DESC: "desc"

};

/**
 * =====================================================
 * SEARCHABLE FIELDS
 * =====================================================
 */

const SEARCH_FIELDS = [

    "originalName",

    "displayName",

    "altText",

    "caption",

    "folder"

];

/**
 * =====================================================
 * EXPORTS
 * =====================================================
 */

module.exports = {

    CLOUDINARY_FOLDERS,

    RESOURCE_TYPES,

    FILE_TYPES,

    IMAGE_FORMATS,

    VIDEO_FORMATS,

    DOCUMENT_FORMATS,

    MIME_TYPES,

    FILE_LIMITS,

    IMAGE_TRANSFORMATIONS,

    MEDIA_STATUS,

    DEFAULTS,

    MESSAGES,

    SORT_FIELDS,

    SORT_ORDER,

    SEARCH_FIELDS

};