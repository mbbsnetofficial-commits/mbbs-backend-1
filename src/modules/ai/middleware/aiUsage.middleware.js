"use strict";

const aiUsage = (req, _res, next) => {
    req.aiUsageContext = {
        admin_id: req.admin?.id || null,
        started_at: Date.now()
    };
    return next();
};

module.exports = { aiUsage };

