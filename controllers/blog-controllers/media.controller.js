const service = require("../../services/blog-services/media.service");
const { MESSAGES } = require("../../constants/blog-constants/media.const");

const sendError = (res, error) => res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || MESSAGES.CLOUDINARY_ERROR
});
const handler = (action, message, status = 200) => async (req, res) => {
    try {
        const data = await action(req);
        const response = { success: true, message };
        if (data !== undefined) response.data = data;
        return res.status(status).json(response);
    } catch (error) {
        return sendError(res, error);
    }
};

exports.uploadOne = handler(req => service.uploadOne(req.file, req.body, req.admin), MESSAGES.UPLOAD_SUCCESS, 201);
exports.uploadMany = handler(req => service.uploadMany(req.files, req.body, req.admin), MESSAGES.MULTIPLE_UPLOAD_SUCCESS, 201);
exports.list = handler(req => service.list(req.query), MESSAGES.FETCH_ALL_SUCCESS);
exports.getOne = handler(req => service.getOne(req.params.id), MESSAGES.FETCH_SUCCESS);
exports.update = handler(req => service.update(req.params.id, req.body), "Media metadata updated successfully.");
exports.replace = handler(req => service.replace(req.params.id, req.file, req.body), MESSAGES.REPLACE_SUCCESS);
exports.remove = handler(req => service.remove(req.params.id), MESSAGES.DELETE_SUCCESS);
exports.restore = handler(req => service.restore(req.params.id), MESSAGES.RESTORE_SUCCESS);
