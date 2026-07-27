"use strict";

const repository = require("../repositories/ai.repository");

const cleanupAiUsage = async (retentionDays = 90) => {
    const cutoff = new Date(Date.now() - retentionDays * 86400000);
    return repository.deleteUsageBefore(cutoff);
};

module.exports = { cleanupAiUsage };

