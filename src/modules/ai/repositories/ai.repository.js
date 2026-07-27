"use strict";

const { blogConnection } = require("../../../../config/database");
const Blog = require("../../../../model/blog-model/blog.model");

const usageCollection = () => blogConnection.collection("ai-usage-logs");

exports.createUsage = payload => usageCollection().insertOne({
    ...payload,
    created_at: new Date()
});

exports.findInternalLinkCandidates = ({ excludeBlogId, limit = 50 }) => {
    const filter = {
        status: "PUBLISHED",
        visibility: "PUBLIC",
        isDeleted: false
    };
    if (excludeBlogId) filter._id = { $ne: excludeBlogId };
    return Blog.find(filter)
        .select("_id title slug shortDescription excerpt")
        .sort({ publishedAt: -1 })
        .limit(limit)
        .lean();
};

exports.deleteUsageBefore = date => usageCollection().deleteMany({
    created_at: { $lt: date }
});

