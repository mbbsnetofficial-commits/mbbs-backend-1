"use strict";

const zoneInsightRepository = require("../../repositories/ucat-repositories/zoneInsight.repository");
const testSessionRepository = require("../../repositories/ucat-repositories/testSession.repository");

const generateZoneInsight = async (testSessionId, userId) => {
    const testSession = await testSessionRepository.getSessionById(testSessionId);
    if (!testSession) {
        const error = new Error("Test session not found for generating insights.");
        error.statusCode = 404;
        throw error;
    }

    const overallAccuracy = testSession.score ? testSession.score.accuracyPercentage : 0;
    const strongSections = ["VERBAL_REASONING"];
    const weakSections = overallAccuracy < 60 ? ["QUANTITATIVE_REASONING"] : [];

    const insightData = {
        testSessionId,
        userId: userId || testSession.userId || 1,
        overallAccuracy,
        strongSections,
        weakSections,
        recommendedFocusTopics: weakSections.length > 0 ? ["Math & Multi-step Calculations"] : ["Speed & Timing Strategy"],
        insightsSummary: `Your accuracy for this session was ${overallAccuracy}%. Focus on speed and section accuracy.`
    };

    return zoneInsightRepository.createZoneInsight(insightData);
};

const getZoneInsight = async (testSessionId) => {
    const insight = await zoneInsightRepository.getInsightByTestSessionId(testSessionId);
    if (!insight) {
        const error = new Error("Zone insight not found for this test session.");
        error.statusCode = 404;
        throw error;
    }
    return insight;
};

module.exports = {
    generateZoneInsight,
    getZoneInsight
};
