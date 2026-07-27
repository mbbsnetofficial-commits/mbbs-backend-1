"use strict";

const { aiLimiter } = require("../../../../middleware/rateLimit.middleware");

module.exports = { aiRateLimit: aiLimiter };

