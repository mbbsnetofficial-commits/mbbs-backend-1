"use strict";

const mongoose = require("mongoose");
const UcatTestSession = require("../../model/ucat-model/ucatTestSession");

const createSession = async (sessionData) => {
    return UcatTestSession.create(sessionData);
};

const getSessionById = async (id) => {
    if (!id) return null;
    const filter = mongoose.Types.ObjectId.isValid(id)
        ? { $or: [{ _id: id }, { sessionId: id }] }
        : { sessionId: id };

    return UcatTestSession.findOne(filter).lean();
};

const updateSession = async (id, updateData) => {
    if (!id) return null;
    const filter = mongoose.Types.ObjectId.isValid(id)
        ? { $or: [{ _id: id }, { sessionId: id }] }
        : { sessionId: id };

    return UcatTestSession.findOneAndUpdate(
        filter,
        { $set: updateData },
        { returnDocument: "after" }
    ).lean();
};

const getUserHistory = async (studentId, options = {}) => {
    const { page = 1, limit = 20, status } = options;
    const p = Math.max(Number(page) || 1, 1);
    const l = Math.max(Number(limit) || 20, 1);
    const skip = (p - 1) * l;

    const filter = {};

    if (studentId) {
        filter.$or = [
            { student_id: studentId },
            { userId: studentId },
            { student_id: null },
            { userId: 1 }
        ];
    }

    if (status && status !== "all") {
        filter.status = new RegExp("^" + status + "$", "i");
    }

    const [sessions, total] = await Promise.all([
        UcatTestSession.find(filter)
            .select("-questions")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(l)
            .lean(),
        UcatTestSession.countDocuments(filter)
    ]);

    return { sessions, total, page: p, limit: l, totalPages: Math.ceil(total / l) };
};

module.exports = {
    createSession,
    getSessionById,
    updateSession,
    getUserHistory
};
