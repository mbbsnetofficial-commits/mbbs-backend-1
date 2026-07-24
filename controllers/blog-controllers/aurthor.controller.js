const authorService = require("../../services/blog-services/aurthor.service");
const { MESSAGES } = require("../../constants/blog-constants/aurthor.const");

const sendError = (res, error) => {
    const statusCode = error.statusCode || (error.code === 11000 ? 409 : 500);
    return res.status(statusCode).json({
        success: false,
        message: error.code === 11000 ? "Author email or slug already exists." : error.message
    });
};

const handler = (serviceMethod, message, statusCode = 200) => async (req, res) => {
    try {
        const data = await serviceMethod(req);
        const response = { success: true, message };
        if (data !== undefined) response.data = data;
        return res.status(statusCode).json(response);
    } catch (error) {
        return sendError(res, error);
    }
};

exports.createAuthor = handler(
    req => authorService.createAuthor(req.body, req.admin),
    MESSAGES.CREATE_SUCCESS,
    201
);
exports.getAuthors = handler(req => authorService.getAuthors(req.query), MESSAGES.FETCH_ALL_SUCCESS);
exports.getDropdown = handler(() => authorService.getDropdown(), MESSAGES.DROPDOWN_SUCCESS);
exports.getFeatured = handler(() => authorService.getFeatured(), MESSAGES.FEATURED_SUCCESS);
exports.getStatistics = handler(() => authorService.getStatistics(), MESSAGES.STATISTICS_SUCCESS);
exports.getAuthorById = handler(req => authorService.getAuthorById(req.params.id), MESSAGES.FETCH_SUCCESS);
exports.updateAuthor = handler(
    req => authorService.updateAuthor(req.params.id, req.body, req.admin),
    MESSAGES.UPDATE_SUCCESS
);
exports.changeStatus = handler(
    req => authorService.changeStatus(req.params.id, req.body.status, req.admin),
    MESSAGES.STATUS_UPDATED
);
exports.deleteAuthor = handler(
    req => authorService.deleteAuthor(req.params.id, req.admin),
    MESSAGES.DELETE_SUCCESS
);
exports.restoreAuthor = handler(
    req => authorService.restoreAuthor(req.params.id, req.admin),
    MESSAGES.RESTORE_SUCCESS
);
