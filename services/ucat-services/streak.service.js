"use strict";

const streakRepository = require("../../repositories/ucat-repositories/streak.repository");

const getStreak = async (userId) => {
    const streak = await streakRepository.getStreakByUserId(userId || 1);
    if (!streak) {
        return {
            userId: userId || 1,
            currentStreak: 0,
            longestStreak: 0,
            lastActivityDate: null,
            history: []
        };
    }
    return streak;
};

const recordActivity = async (userId, activityType = "PRACTICE_TEST") => {
    const today = new Date().toISOString().split("T")[0];
    let streak = await streakRepository.getStreakByUserId(userId || 1);

    if (!streak) {
        streak = {
            userId: userId || 1,
            currentStreak: 1,
            longestStreak: 1,
            lastActivityDate: today,
            history: [{ date: today, activityType }]
        };
    } else {
        if (streak.lastActivityDate === today) {
            return streak;
        }

        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
        let newCurrent = streak.lastActivityDate === yesterday ? streak.currentStreak + 1 : 1;
        let newLongest = Math.max(streak.longestStreak, newCurrent);

        streak.currentStreak = newCurrent;
        streak.longestStreak = newLongest;
        streak.lastActivityDate = today;
        streak.history = streak.history || [];
        streak.history.push({ date: today, activityType });
    }

    return streakRepository.updateOrCreateStreak(userId || 1, streak);
};

module.exports = {
    getStreak,
    recordActivity
};
