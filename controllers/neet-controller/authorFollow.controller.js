const authorFollowService = require("../../services/authorFollow.service");

const sendError = (res, error) => res.status(error.statusCode || 500).json({
    status: "fail",
    message: error.message
});

exports.listAuthors = async (req, res) => {
    try {
        const data = await authorFollowService.listAuthors(req.user.id, req.query);
        return res.status(200).json({
            status: "success",
            message: "Authors fetched successfully.",
            data
        });
    } catch (error) {
        return sendError(res, error);
    }
};

exports.listFollowing = async (req, res) => {
    try {
        const data = await authorFollowService.listFollowing(req.user.id, req.query);
        return res.status(200).json({
            status: "success",
            message: "Followed authors fetched successfully.",
            data
        });
    } catch (error) {
        return sendError(res, error);
    }
};

exports.getAuthor = async (req, res) => {
    try {
        const data = await authorFollowService.getAuthor(req.user.id, req.params.authorId);
        return res.status(200).json({
            status: "success",
            message: "Author fetched successfully.",
            data
        });
    } catch (error) {
        return sendError(res, error);
    }
};

exports.followAuthor = async (req, res) => {
    try {
        const data = await authorFollowService.followAuthor({
            userId: req.user.id,
            studentId: req.user.student_id,
            authorId: req.params.authorId
        });
        return res.status(200).json({
            status: "success",
            message: "Author followed successfully.",
            data
        });
    } catch (error) {
        return sendError(res, error);
    }
};

exports.unfollowAuthor = async (req, res) => {
    try {
        const data = await authorFollowService.unfollowAuthor({
            userId: req.user.id,
            authorId: req.params.authorId
        });
        return res.status(200).json({
            status: "success",
            message: "Author unfollowed successfully.",
            data
        });
    } catch (error) {
        return sendError(res, error);
    }
};
