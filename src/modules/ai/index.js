"use strict";

module.exports = {
    aiRouter: require("./routes/ai.routes"),
    cleanupAiUsage: require("./cron/aiCleanup.cron").cleanupAiUsage
};

