"use strict";

const mongoose = require("mongoose");
const UcatPreviousYear = require("../../model/ucat-model/ucatPreviousYear");

const listPapers = async () => {
    return UcatPreviousYear.find({})
        .sort({ id: 1 })
        .lean();
};

const getPaperById = async (paperId) => {
    if (!paperId) return null;
    const numId = Number(paperId);
    const filter = {
        $or: [
            ...(isNaN(numId) ? [] : [{ id: numId }]),
            { name: new RegExp("^" + paperId + "$", "i") },
            ...(mongoose.Types.ObjectId.isValid(paperId) ? [{ _id: paperId }] : [])
        ]
    };
    return UcatPreviousYear.findOne(filter).lean();
};

module.exports = {
    listPapers,
    getPaperById
};
