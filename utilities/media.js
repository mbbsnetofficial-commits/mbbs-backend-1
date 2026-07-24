const crypto = require("crypto");

/*
==================================================
Generate File Name
==================================================
*/

const generateFileName = (originalName) => {

    const extension = originalName.split(".").pop();

    const random = crypto.randomBytes(6).toString("hex");

    return `${Date.now()}_${random}.${extension}`;

};

/*
==================================================
Generate Folder
==================================================
*/

const generateFolder = (

    moduleName,

    folderName = ""

) => {

    if (!folderName) {

        return `mbbs-cms/${moduleName}`;

    }

    return `mbbs-cms/${moduleName}/${folderName}`;

};

/*
==================================================
Convert Bytes
==================================================
*/

const convertBytes = (bytes) => {

    if (bytes === 0) {

        return "0 Bytes";

    }

    const sizes = [

        "Bytes",

        "KB",

        "MB",

        "GB",

        "TB"

    ];

    const i = Math.floor(

        Math.log(bytes) / Math.log(1024)

    );

    return (

        bytes /

        Math.pow(1024, i)

    ).toFixed(2) +

        " " +

        sizes[i];

};

/*
==================================================
Build Pagination
==================================================
*/

const getPagination = (

    page = 1,

    limit = 20

) => {

    page = Math.max(1, Number(page) || 1);

    limit = Math.max(1, Number(limit) || 20);

    return {

        page,

        limit,

        skip: (page - 1) * limit

    };

};

/*
==================================================
Build Sort
==================================================
*/

const buildSort = (

    field = "createdAt",

    order = "desc"

) => {

    return {

        [field]: order === "asc" ? 1 : -1

    };

};

module.exports = {

    generateFileName,

    generateFolder,

    convertBytes,

    getPagination,

    buildSort

};
