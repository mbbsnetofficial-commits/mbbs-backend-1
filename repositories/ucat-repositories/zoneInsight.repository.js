"use strict";

const UcatZoneInsight = require("../../model/ucat-model/ucatZoneInsight");
const UcatUserSession = require("../../model/ucat-model/ucatUserSession");

const createZoneInsight = async (insightData) => {
    return UcatZoneInsight.findOneAndUpdate(
        { testSessionId: insightData.testSessionId },
        { $set: insightData },
        { new: true, upsert: true }
    ).lean();
};

const getInsightByTestSessionId = async (testSessionId) => {
    return UcatZoneInsight.findOne({ testSessionId }).lean();
};

const updateActiveUserSession = async (userId, sessionData) => {
    return UcatUserSession.findOneAndUpdate(
        { userId },
        { $set: sessionData },
        { new: true, upsert: true }
    ).lean();
};

module.exports = {
    createZoneInsight,
    getInsightByTestSessionId,
    updateActiveUserSession
};
