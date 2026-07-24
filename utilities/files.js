const path = require("path");

/*
==================================================
Extension
==================================================
*/

const getExtension = (filename) => {

    return path.extname(filename)

        .replace(".", "")

        .toLowerCase();

};

/*
==================================================
Filename
==================================================
*/

const getFilename = (filename) => {

    return path.basename(

        filename,

        path.extname(filename)

    );

};

/*
==================================================
Image Check
==================================================
*/

const isImage = (mime) => {

    return mime.startsWith("image/");

};

/*
==================================================
Video Check
==================================================
*/

const isVideo = (mime) => {

    return mime.startsWith("video/");

};

/*
==================================================
Document Check
==================================================
*/

const isDocument = (mime) => {

    return (

        mime.includes("pdf") ||

        mime.includes("word") ||

        mime.includes("excel") ||

        mime.includes("presentation")

    );

};

/*
==================================================
File Type
==================================================
*/

const getFileType = (mime) => {

    if (isImage(mime)) {

        return "IMAGE";

    }

    if (isVideo(mime)) {

        return "VIDEO";

    }

    return "DOCUMENT";

};

/*
==================================================
Readable Size
==================================================
*/

const getReadableSize = (size) => {

    if (size < 1024) {

        return `${size} Bytes`;

    }

    if (size < 1024 * 1024) {

        return `${(size / 1024).toFixed(2)} KB`;

    }

    if (size < 1024 * 1024 * 1024) {

        return `${(size / 1024 / 1024).toFixed(2)} MB`;

    }

    return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`;

};

module.exports = {

    getExtension,

    getFilename,

    isImage,

    isVideo,

    isDocument,

    getFileType,

    getReadableSize

};