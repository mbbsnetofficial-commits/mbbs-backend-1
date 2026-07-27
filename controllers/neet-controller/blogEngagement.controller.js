const service = require("../../services/blogEngagement.service");

const sendError = (res, error) => res.status(error.statusCode || 500).json({
    status: "fail",
    message: error.message
});

const handler = (action, message) => async (req, res) => {
    try {
        return res.status(200).json({
            status: "success",
            message,
            data: await action(req)
        });
    } catch (error) {
        return sendError(res, error);
    }
};

exports.listBlogs = handler(
    req => service.listBlogs(req.user.id, req.query),
    "Blogs fetched successfully."
);
exports.listSavedBlogs = handler(
    req => service.listSavedBlogs(req.user.id, req.query),
    "Saved blogs fetched successfully."
);
exports.getBlog = handler(
    req => service.getBlog(req.user.id, req.params.blogId),
    "Blog fetched successfully."
);
exports.likeBlog = handler(
    req => service.likeBlog({
        userId: req.user.id,
        studentId: req.user.student_id,
        blogId: req.params.blogId
    }),
    "Blog liked successfully."
);
exports.unlikeBlog = handler(
    req => service.unlikeBlog({
        userId: req.user.id,
        blogId: req.params.blogId
    }),
    "Blog unliked successfully."
);
exports.saveBlog = handler(
    req => service.saveBlog({
        userId: req.user.id,
        studentId: req.user.student_id,
        blogId: req.params.blogId
    }),
    "Blog saved successfully."
);
exports.unsaveBlog = handler(
    req => service.unsaveBlog({
        userId: req.user.id,
        blogId: req.params.blogId
    }),
    "Blog removed from saved blogs."
);
