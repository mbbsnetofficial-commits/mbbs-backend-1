const service = require("../../services/blog-services/analytics.service");
const { MESSAGES } = require("../../constants/blog-constants/analytics.const");

const handler = (action, message, status = 200) => async (req, res) => {
    try {
        const data = await action(req);
        return res.status(status).json({ success: true, message, data });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};

exports.dashboard = handler(() => service.dashboard(), MESSAGES.DASHBOARD_SUCCESS);
exports.generate = handler(req => service.generate(req.body), MESSAGES.GENERATED_SUCCESS, 201);
exports.list = handler(req => service.list(req.query), MESSAGES.LIST_SUCCESS);
exports.latest = handler(req => service.latest(req.params.period), MESSAGES.LATEST_SUCCESS);
exports.performance = handler(req => service.performance(req.query.limit), MESSAGES.PERFORMANCE_SUCCESS);
