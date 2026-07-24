const service = require("../../services/blog-services/seo.service");
const { MESSAGES } = require("../../constants/blog-constants/seo.const");

const sendError = (res, error) => res.status(error.statusCode || (error.code === 11000 ? 409 : 500)).json({
    success: false,
    message: error.code === 11000 ? "SEO slug or module reference already exists." : error.message
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

exports.create = handler(req => service.create(req.body), MESSAGES.CREATE_SUCCESS, 201);
exports.list = handler(req => service.list(req.query), MESSAGES.FETCH_ALL_SUCCESS);
exports.getById = handler(req => service.getById(req.params.id), MESSAGES.FETCH_SUCCESS);
exports.getByModule = handler(req => service.getByModule(req.params.module, req.params.referenceId), MESSAGES.FETCH_SUCCESS);
exports.update = handler(req => service.update(req.params.id, req.body), MESSAGES.UPDATE_SUCCESS);
exports.remove = handler(req => service.remove(req.params.id), MESSAGES.DELETE_SUCCESS);
exports.restore = handler(req => service.restore(req.params.id), MESSAGES.RESTORE_SUCCESS);
exports.statistics = handler(() => service.statistics(), "SEO statistics fetched successfully.");
