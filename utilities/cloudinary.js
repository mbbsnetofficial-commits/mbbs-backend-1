const cloudinary = require("cloudinary").v2;

const streamifier = require("streamifier");

cloudinary.config({

    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,

    api_key: process.env.CLOUDINARY_API_KEY,

    api_secret: process.env.CLOUDINARY_API_SECRET

});

const assertCloudinaryConfig = () => {
    const missing = [
        "CLOUDINARY_CLOUD_NAME",
        "CLOUDINARY_API_KEY",
        "CLOUDINARY_API_SECRET"
    ].filter(name => !process.env[name]);
    if (missing.length) {
        throw Object.assign(new Error(`Cloudinary configuration is missing: ${missing.join(", ")}.`), {
            statusCode: 500
        });
    }
};

/*
==================================================
Upload File
==================================================
*/

const uploadToCloudinary = (

    file,

    folder,

    resourceType = "auto"

) => {

    return new Promise((resolve, reject) => {
        assertCloudinaryConfig();

        const uploadStream = cloudinary.uploader.upload_stream(

            {

                folder,

                resource_type: resourceType

            },

            (error, result) => {

                if (error) {

                    return reject(error);

                }

                resolve(result);

            }

        );

        streamifier

            .createReadStream(file.buffer)

            .pipe(uploadStream);

    });

};

/*
==================================================
Delete File
==================================================
*/

const deleteFromCloudinary = async (

    publicId,

    resourceType = "image"

) => {

    assertCloudinaryConfig();
    return cloudinary.uploader.destroy(

        publicId,

        {

            resource_type: resourceType

        }

    );

};

/*
==================================================
Rename File
==================================================
*/

const renameCloudinaryFile = async (

    publicId,

    newPublicId

) => {

    return cloudinary.uploader.rename(

        publicId,

        newPublicId

    );

};

/*
==================================================
Generate URL
==================================================
*/

const generateUrl = (

    publicId,

    options = {}

) => {

    return cloudinary.url(

        publicId,

        options

    );

};

module.exports = {

    cloudinary,

    assertCloudinaryConfig,

    uploadToCloudinary,

    deleteFromCloudinary,

    renameCloudinaryFile,

    generateUrl

};
