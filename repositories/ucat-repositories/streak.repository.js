"use strict";

const UcatStreak = require("../../model/ucat-model/ucatStreak");

const getStreakByUserId = async (userId) => {
    return UcatStreak.findOne({ userId }).lean();
};

const updateOrCreateStreak = async (userId, streakData) => {
    return UcatStreak.findOneAndUpdate(
        { userId },
        { $set: streakData },
        { new: true, upsert: true }
    ).lean();
};

module.exports = {
    getStreakByUserId,
    updateOrCreateStreak
};
