"use strict";

const leaderboardService = require("../../services/testLeaderboard.service");

const sendError = (res, error) => res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Unable to load the leaderboard."
});

exports.getLeaderboard = async (req, res) => {
    try {
        const result = await leaderboardService.getLeaderboard(req.query);
        return res.status(200).json({
            success: true,
            message: "Test leaderboard loaded successfully.",
            ...result
        });
    } catch (error) {
        return sendError(res, error);
    }
};

exports.getMyRank = async (req, res) => {
    try {
        const result = await leaderboardService.getMyRank(
            req.user.student_id,
            req.query
        );
        return res.status(200).json({
            success: true,
            message: "Student leaderboard rank loaded successfully.",
            ...result
        });
    } catch (error) {
        return sendError(res, error);
    }
};

