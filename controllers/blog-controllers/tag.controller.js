const tagService = require("../../services/blog-services/tag.service");
const { MESSAGES } = require("../../constants/blog-constants/tag.const");

const sendError = (res, error) => {
    const statusCode = error.statusCode || (error.code === 11000 ? 409 : 500);
    const message = error.code === 11000
        ? MESSAGES.ALREADY_EXISTS
        : error.message || "An unexpected error occurred.";
    return res.status(statusCode).json({ success: false, message });
};

const handler = (serviceMethod, successMessage, statusCode = 200) =>
    async (req, res) => {
        try {
            const data = await serviceMethod(req);
            const response = { success: true, message: successMessage };
            if (data !== undefined) response.data = data;
            return res.status(statusCode).json(response);
        } catch (error) {
            return sendError(res, error);
        }
    };

exports.createTag = handler(req => tagService.createTag(req.body, req.admin), MESSAGES.CREATE_SUCCESS, 201);
exports.getAllTags = handler(req => tagService.getAllTags(req.query), MESSAGES.FETCH_ALL_SUCCESS);
exports.getTagDropdown = handler(() => tagService.getTagDropdown(), MESSAGES.DROPDOWN_SUCCESS);
exports.getPopularTags = handler(req => tagService.getPopularTags(req.query), MESSAGES.POPULAR_SUCCESS);
exports.getTagStatistics = handler(() => tagService.getTagStatistics(), MESSAGES.STATISTICS_SUCCESS);
exports.getTagById = handler(req => tagService.getTagById(req.params.id), MESSAGES.FETCH_SUCCESS);
exports.updateTag = handler(req => tagService.updateTag(req.params.id, req.body, req.admin), MESSAGES.UPDATE_SUCCESS);
exports.changeTagStatus = handler(req => tagService.changeTagStatus(req.params.id, req.body.status, req.admin), MESSAGES.STATUS_UPDATED);
exports.deleteTag = handler(req => tagService.deleteTag(req.params.id, req.admin), MESSAGES.DELETE_SUCCESS);
exports.restoreTag = handler(req => tagService.restoreTag(req.params.id, req.admin), MESSAGES.RESTORE_SUCCESS);
