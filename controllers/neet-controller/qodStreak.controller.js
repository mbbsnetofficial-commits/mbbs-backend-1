"use strict";

const qodStreakService = require("../../services/qodStreak.service");

const sendError = (res, error) => res.status(error.statusCode || 500).json({
    status: "fail",
    message: error.message || "Unable to load QOD streak."
});

exports.getStreak = async (req, res) => {
    try {
        const data = await qodStreakService.getStudentStreak(req.user.student_id);
        return res.status(200).json({ status: "success", data });
    } catch (error) {
        return sendError(res, error);
    }
};

exports.getStreakHistory = async (req, res) => {
    try {
        const result = await qodStreakService.getStudentStreakHistory(
            req.user.student_id,
            req.query.month
        );
        return res.status(200).json({ status: "success", ...result });
    } catch (error) {
        return sendError(res, error);
    }
};

