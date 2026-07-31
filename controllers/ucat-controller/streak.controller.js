"use strict";

const streakService = require("../../services/ucat-services/streak.service");

const getStreak = async (req, res, next) => {
    try {
        const userId = req.user ? req.user.userId : 1;
        const streak = await streakService.getStreak(userId);
        return res.status(200).json({
            success: true,
            message: "UCAT streak fetched successfully.",
            data: streak
        });
    } catch (error) {
        next(error);
    }
};

const recordActivity = async (req, res, next) => {
    try {
        const userId = req.user ? req.user.userId : 1;
        const { activityType } = req.body;
        const streak = await streakService.recordActivity(userId, activityType);
        return res.status(200).json({
            success: true,
            message: "UCAT daily streak recorded successfully.",
            data: streak
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getStreak,
    recordActivity
};
