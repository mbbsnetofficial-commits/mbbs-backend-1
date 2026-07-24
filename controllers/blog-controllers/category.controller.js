const categoryService = require("../../services/blog-services/category.service");
const { MESSAGES } = require("../../constants/blog-constants/category.constant");

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
            const data = await serviceMethod(req, res);
            const response = { success: true, message: successMessage };
            if (data !== undefined) response.data = data;
            return res.status(statusCode).json(response);
        } catch (error) {
            return sendError(res, error);
        }
    };

exports.createCategory = handler(
    req => categoryService.createCategory(req.body, req.admin),
    MESSAGES.CREATE_SUCCESS,
    201
);
exports.getAllCategories = handler(
    req => categoryService.getAllCategories(req.query),
    MESSAGES.FETCH_ALL_SUCCESS
);
exports.getCategoryTree = handler(
    req => categoryService.getCategoryTree(req.query),
    MESSAGES.FETCH_ALL_SUCCESS
);
exports.getCategoryDropdown = handler(
    () => categoryService.getCategoryDropdown(),
    MESSAGES.DROPDOWN_SUCCESS
);
exports.getCategoryById = handler(
    req => categoryService.getCategoryById(req.params.id),
    MESSAGES.FETCH_SUCCESS
);
exports.updateCategory = handler(
    req => categoryService.updateCategory(req.params.id, req.body, req.admin),
    MESSAGES.UPDATE_SUCCESS
);
exports.changeCategoryStatus = handler(
    req => categoryService.changeCategoryStatus(req.params.id, req.body.status, req.admin),
    MESSAGES.STATUS_UPDATED
);
exports.deleteCategory = handler(
    req => categoryService.deleteCategory(req.params.id, req.admin),
    MESSAGES.DELETE_SUCCESS
);
exports.restoreCategory = handler(
    req => categoryService.restoreCategory(req.params.id, req.admin),
    MESSAGES.RESTORE_SUCCESS
);
