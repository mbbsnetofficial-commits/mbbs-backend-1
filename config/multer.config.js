const multer = require("multer");

const path = require("path");

/*
==================================================
Allowed File Types
==================================================
*/

const ALLOWED_IMAGE_TYPES = [

    "image/jpeg",

    "image/jpg",

    "image/png",

    "image/webp",

    "image/gif",

    "image/svg+xml"

];

const ALLOWED_VIDEO_TYPES = [

    "video/mp4",

    "video/mpeg",

    "video/webm",

    "video/quicktime"

];

const ALLOWED_DOCUMENT_TYPES = [

    "application/pdf",

    "application/msword",

    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    "application/vnd.ms-excel",

    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

];

const ALLOWED_FILE_TYPES = [

    ...ALLOWED_IMAGE_TYPES,

    ...ALLOWED_VIDEO_TYPES,

    ...ALLOWED_DOCUMENT_TYPES

];

/*
==================================================
Memory Storage
==================================================
*/

const storage = multer.memoryStorage();

/*
==================================================
File Filter
==================================================
*/

const fileFilter = (req, file, cb) => {

    if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {

        return cb(null, true);

    }

    cb(

        new Error(

            `Unsupported file type: ${path.extname(file.originalname)}`

        ),

        false

    );

};

/*
==================================================
Limits
==================================================
*/

const limits = {

    fileSize: 20 * 1024 * 1024 // 20 MB

};

/*
==================================================
Single Upload
==================================================
*/

const uploadSingle = multer({

    storage,

    fileFilter,

    limits

});

/*
==================================================
Multiple Upload
==================================================
*/

const uploadMultiple = multer({

    storage,

    fileFilter,

    limits

});

/*
==================================================
Exports
==================================================
*/

module.exports = {

    uploadSingle,

    uploadMultiple

};