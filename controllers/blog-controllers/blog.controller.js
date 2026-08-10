const service = require("../../services/blog-services/blog.service");
const { MESSAGES } = require("../../constants/blog-constants/blog.const");

const sendError = (res, err) => res.status(err.statusCode || (err.code === 11000 ? 409 : 500)).json({
    success: false,
    message: err.code === 11000 ? "Blog slug or code already exists." : err.message
});

const handler = (action, message, status = 200) => async (req, res) => {
    try {
        const data = await action(req);
        const response = { success: true, message };
        if (data !== undefined) response.data = data;
        return res.status(status).json(response);
    } catch (err) {
        return sendError(res, err);
    }
};

exports.createBlog = handler(req => service.createBlog(req.body, req.admin), MESSAGES.CREATE_SUCCESS, 201);
exports.listBlogs = handler(req => service.listBlogs(req.query), MESSAGES.FETCH_ALL_SUCCESS);
exports.getBlog = handler(req => service.getBlog(req.params.id), MESSAGES.FETCH_SUCCESS);
exports.updateBlog = handler(req => service.updateBlog(req.params.id, req.body, req.admin), MESSAGES.UPDATE_SUCCESS);
exports.publishBlog = handler(req => service.publishBlog(req.params.id, req.admin), MESSAGES.PUBLISH_SUCCESS);
exports.unpublishBlog = handler(req => service.unpublishBlog(req.params.id, req.admin), MESSAGES.UNPUBLISH_SUCCESS);
exports.scheduleBlog = handler(req => service.scheduleBlog(req.params.id, req.body.scheduledAt, req.admin), MESSAGES.SCHEDULE_SUCCESS);
exports.duplicateBlog = handler(req => service.duplicateBlog(req.params.id, req.admin), MESSAGES.DUPLICATE_SUCCESS, 201);
exports.deleteBlog = handler(req => service.deleteBlog(req.params.id, req.admin), MESSAGES.DELETE_SUCCESS);
exports.permanentDeleteBlog = handler(req => service.permanentDeleteBlog(req.params.id, req.admin), "Blog deleted permanently from database.");
exports.restoreBlog = handler(req => service.restoreBlog(req.params.id, req.admin), MESSAGES.RESTORE_SUCCESS);
exports.getStatistics = handler(() => service.getStatistics(), MESSAGES.STATISTICS_SUCCESS);
exports.uploadFeaturedImage = handler(
    req => service.uploadFeaturedImage(req.params.id, req.file, req.body, req.admin),
    "Featured image uploaded and attached successfully."
);
