const Analytics = require("../../model/blog-model/analytics.model");
const Blog = require("../../model/blog-model/blog.model");
const Category = require("../../model/blog-model/category.model");
const Tag = require("../../model/blog-model/tag.model");
const Author = require("../../model/blog-model/aurthor.model");
const Review = require("../../model/blog-model/review.model");
const Media = require("../../model/blog-model/media.model");
const SEO = require("../../model/blog-model/seo.model");

const countCreated = (Model, filter, start, end) => Model.countDocuments({
    ...filter,
    createdAt: { $gte: start, $lt: end }
});

const dashboard = async () => {
    const [
        totalBlogs, publishedBlogs, draftBlogs,
        totalCategories, totalTags, totalAuthors
    ] = await Promise.all([
        Blog.countDocuments({ isDeleted: false }),
        Blog.countDocuments({ isDeleted: false, status: "PUBLISHED" }),
        Blog.countDocuments({ isDeleted: false, status: "DRAFT" }),
        Category.countDocuments({ isDeleted: false }),
        Tag.countDocuments({ isDeleted: false }),
        Author.countDocuments({ isDeleted: false })
    ]);
    return { totalBlogs, publishedBlogs, draftBlogs, totalCategories, totalTags, totalAuthors };
};

const reviews = async () => {
    const [row] = await Review.aggregate([
        { $match: { isDeleted: false } },
        {
            $group: {
                _id: null,
                totalReviews: { $sum: 1 },
                approvedReviews: { $sum: { $cond: [{ $eq: ["$status", "APPROVED"] }, 1, 0] } },
                pendingReviews: { $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] } },
                rejectedReviews: { $sum: { $cond: [{ $eq: ["$status", "REJECTED"] }, 1, 0] } },
                averageRating: { $avg: "$rating" }
            }
        },
        { $project: { _id: 0 } }
    ]);
    return row || { totalReviews: 0, approvedReviews: 0, pendingReviews: 0, rejectedReviews: 0, averageRating: 0 };
};

const media = async () => {
    const [row] = await Media.aggregate([
        { $match: { isDeleted: false } },
        {
            $group: {
                _id: null,
                totalFiles: { $sum: 1 },
                totalImages: { $sum: { $cond: [{ $eq: ["$resourceType", "image"] }, 1, 0] } },
                totalVideos: { $sum: { $cond: [{ $eq: ["$resourceType", "video"] }, 1, 0] } },
                storageUsed: { $sum: "$bytes" }
            }
        },
        { $project: { _id: 0 } }
    ]);
    return row || { totalFiles: 0, totalImages: 0, totalVideos: 0, storageUsed: 0 };
};

const seo = async () => {
    const [row] = await SEO.aggregate([
        { $match: { isDeleted: false, isActive: true } },
        {
            $group: {
                _id: null,
                indexedPages: { $sum: { $cond: [{ $regexMatch: { input: "$robots", regex: /^index/ } }, 1, 0] } },
                missingMetaTitles: { $sum: { $cond: [{ $eq: [{ $strLenCP: { $ifNull: ["$metaTitle", ""] } }, 0] }, 1, 0] } },
                missingMetaDescriptions: { $sum: { $cond: [{ $eq: [{ $strLenCP: { $ifNull: ["$metaDescription", ""] } }, 0] }, 1, 0] } },
                averageSeoScore: {
                    $avg: {
                        $add: [
                            { $cond: [{ $gt: [{ $strLenCP: { $ifNull: ["$metaTitle", ""] } }, 0] }, 25, 0] },
                            { $cond: [{ $gt: [{ $strLenCP: { $ifNull: ["$metaDescription", ""] } }, 0] }, 25, 0] },
                            { $cond: [{ $gt: [{ $strLenCP: { $ifNull: ["$canonicalUrl", ""] } }, 0] }, 20, 0] },
                            { $cond: [{ $gt: [{ $size: { $ifNull: ["$metaKeywords", []] } }, 0] }, 15, 0] },
                            { $cond: [{ $gt: [{ $strLenCP: { $ifNull: ["$schemaType", ""] } }, 0] }, 15, 0] }
                        ]
                    }
                }
            }
        },
        { $project: { _id: 0 } }
    ]);
    return row || { indexedPages: 0, missingMetaTitles: 0, missingMetaDescriptions: 0, averageSeoScore: 0 };
};

const traffic = async () => {
    const [row] = await Blog.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: null, pageViews: { $sum: "$totalViews" } } },
        { $project: { _id: 0 } }
    ]);
    return {
        totalVisitors: 0,
        uniqueVisitors: 0,
        pageViews: row?.pageViews || 0,
        bounceRate: 0
    };
};

const growthCounts = async ({ start, end, previousStart }) => {
    const [blogs, previousBlogs, reviews, previousReviews] = await Promise.all([
        countCreated(Blog, { isDeleted: false }, start, end),
        countCreated(Blog, { isDeleted: false }, previousStart, start),
        countCreated(Review, { isDeleted: false }, start, end),
        countCreated(Review, { isDeleted: false }, previousStart, start)
    ]);
    return { blogs, previousBlogs, reviews, previousReviews };
};

const upsertSnapshot = (period, date, data) => Analytics.findOneAndUpdate(
    { period, date },
    { $set: { ...data, generatedAt: new Date() } },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
);
const listSnapshots = ({ filter, skip, limit }) => Analytics.find(filter).sort({ date: -1 }).skip(skip).limit(limit).lean();
const countSnapshots = filter => Analytics.countDocuments(filter);
const latest = period => Analytics.findOne({ period }).sort({ date: -1 }).lean();

const topContent = async limit => {
    const [blogs, authors, categories] = await Promise.all([
        Blog.find({ isDeleted: false, status: "PUBLISHED" })
            .select("title slug totalViews totalLikes totalComments publishedAt")
            .sort({ totalViews: -1, totalLikes: -1 }).limit(limit).lean(),
        Author.find({ isDeleted: false, status: true })
            .select("fullName slug totalBlogs totalViews totalLikes")
            .sort({ totalViews: -1, totalBlogs: -1 }).limit(limit).lean(),
        Category.find({ isDeleted: false, status: true })
            .select("categoryName slug totalBlogs")
            .sort({ totalBlogs: -1 }).limit(limit).lean()
    ]);
    return { blogs, authors, categories };
};

module.exports = {
    dashboard,
    reviews,
    media,
    seo,
    traffic,
    growthCounts,
    upsertSnapshot,
    listSnapshots,
    countSnapshots,
    latest,
    topContent
};
