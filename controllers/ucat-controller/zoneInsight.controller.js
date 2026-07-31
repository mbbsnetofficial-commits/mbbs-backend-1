"use strict";

const zoneInsightService = require("../../services/ucat-services/zoneInsight.service");

const generateZoneInsight = async (req, res, next) => {
    try {
        const userId = req.user ? req.user.userId : 1;
        const { testSessionId } = req.body;
        if (!testSessionId) {
            return res.status(400).json({ success: false, message: "testSessionId is required." });
        }
        const insight = await zoneInsightService.generateZoneInsight(testSessionId, userId);
        return res.status(201).json({
            success: true,
            message: "UCAT zone insight generated successfully.",
            data: insight
        });
    } catch (error) {
        next(error);
    }
};

const getZoneInsight = async (req, res, next) => {
    try {
        const insight = await zoneInsightService.getZoneInsight(req.params.testSessionId);
        return res.status(200).json({
            success: true,
            message: "UCAT zone insight fetched successfully.",
            data: insight
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    generateZoneInsight,
    getZoneInsight
};
