const service = require("../../services/blog-services/search.service");
const { MESSAGES } = require("../../constants/blog-constants/search.const");

const handler = action => async (req, res) => {
    try {
        const data = await action(req);
        return res.status(200).json({ success: true, message: MESSAGES.SEARCH_SUCCESS, data });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};

exports.globalSearch = handler(req => service.globalSearch(req.query));
exports.moduleSearch = handler(req => service.moduleSearch(req.query));
exports.advancedSearch = handler(req => service.advancedSearch(req.body));
exports.suggestions = async (req, res) => {
    try {
        const data = await service.suggestions(req.query);
        return res.status(200).json({ success: true, message: MESSAGES.SUGGESTIONS_SUCCESS, data });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};
