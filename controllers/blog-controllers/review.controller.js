const service = require("../../services/blog-services/review.service");
const { MESSAGES } = require("../../constants/blog-constants/review.const");
const sendError = (res, error) => res.status(error.statusCode || (error.code === 11000 ? 409 : 500)).json({
    success: false,
    message: error.code === 11000 ? MESSAGES.DUPLICATE_REVIEW : error.message
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

exports.create = handler(req => service.create(req.body, req.user), MESSAGES.REVIEW_CREATED, 201);
exports.listMine = handler(req => service.listMine(req.query, req.user), MESSAGES.FETCH_ALL_SUCCESS);
exports.updateMine = handler(req => service.updateMine(req.params.id, req.body, req.user), MESSAGES.REVIEW_UPDATED);
exports.listApprovedByReference = handler(req => service.listApprovedByReference(req.params, req.query), MESSAGES.FETCH_ALL_SUCCESS);
exports.listFeatured = handler(req => service.listFeatured(req.query), MESSAGES.FETCH_ALL_SUCCESS);
exports.listAdmin = handler(req => service.listAdmin(req.query), MESSAGES.FETCH_ALL_SUCCESS);
exports.getById = handler(req => service.getById(req.params.id), MESSAGES.FETCH_SUCCESS);
exports.approve = handler(req => service.approve(req.params.id, req.admin), MESSAGES.REVIEW_APPROVED);
exports.reject = handler(req => service.reject(req.params.id, req.body.rejectionReason), MESSAGES.REVIEW_REJECTED);
exports.feature = handler(req => service.setFeatured(req.params.id, req.body.isFeatured), "Review featured status updated successfully.");
exports.verify = handler(req => service.setVerified(req.params.id, req.body.isVerified), "Review verification updated successfully.");
exports.remove = handler(req => service.remove(req.params.id), MESSAGES.REVIEW_DELETED);
exports.restore = handler(req => service.restore(req.params.id), MESSAGES.REVIEW_RESTORED);
exports.statistics = handler(() => service.statistics(), "Review statistics fetched successfully.");
