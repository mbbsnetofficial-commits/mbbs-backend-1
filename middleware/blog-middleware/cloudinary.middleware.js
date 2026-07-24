const {
    uploadToCloudinary,
    deleteFromCloudinary
} = require("../../utilities/cloudinary");

// Reusable wrappers; the Media service uses these operations directly so it
// can keep Cloudinary and MongoDB error handling in one place.
const uploadSingleToCloudinary = async (req, _res, next) => {
    try {
        if (req.file) req.cloudinary = await uploadToCloudinary(req.file, req.body.folder);
        return next();
    } catch (error) {
        return next(error);
    }
};

const removeFromCloudinary = async (req, _res, next) => {
    try {
        if (req.media?.publicId) {
            await deleteFromCloudinary(req.media.publicId, req.media.resourceType);
        }
        return next();
    } catch (error) {
        return next(error);
    }
};

module.exports = { uploadSingleToCloudinary, removeFromCloudinary };
