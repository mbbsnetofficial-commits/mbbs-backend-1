const {

    uploadSingle,

    uploadMultiple

} = require("../config/multer.config");

/*
===========================================
Single Upload
===========================================
*/

const singleImage = uploadSingle.single("file");

/*
===========================================
Multiple Upload
===========================================
*/

const multipleImages = uploadMultiple.array(

    "files",

    20

);

/*
===========================================
Blog Upload
===========================================
*/

const blogUpload = uploadSingle.fields([

    {

        name: "featuredImage",

        maxCount: 1

    },

    {

        name: "gallery",

        maxCount: 20

    }

]);

module.exports = {

    singleImage,

    multipleImages,

    blogUpload

};