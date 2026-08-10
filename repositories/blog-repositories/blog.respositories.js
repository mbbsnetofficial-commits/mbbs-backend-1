const Blog = require("../../model/blog-model/blog.model");
const BlogTemplate = require("../../model/blog-model/template");
const BlogCategory = require("../../model/blog-model/category.model");
const BlogTag = require("../../model/blog-model/tag.model");
const BlogAuthor = require("../../model/blog-model/aurthor.model");

const populate = query => query
    .populate("template", "templateName templateCode status")
    .populate("category", "categoryName categoryCode slug status")
    .populate("tags", "tagName tagCode slug status")
    .populate("author", "fullName authorCode slug designation status");

const create = data => Blog.create(data);
const findById = id => populate(Blog.findById(id));
const findDocumentById = id => Blog.findById(id);
const findActiveById = id => populate(Blog.findOne({ _id: id, isDeleted: false }));
const findActiveDocumentById = id => Blog.findOne({ _id: id, isDeleted: false });
const findBySlug = (slug, excludeId) => {
    const filter = { slug };
    if (excludeId) filter._id = { $ne: excludeId };
    return Blog.findOne(filter).lean();
};
const findAll = ({ filter, sort, skip, limit }) => populate(
    Blog.find(filter).sort(sort).skip(skip).limit(limit)
).lean();
const count = filter => Blog.countDocuments(filter);
const save = blog => blog.save();

const publicFilter = {
    isDeleted: false,
    status: "PUBLISHED",
    visibility: "PUBLIC"
};

const findPublished = ({ filter = {}, skip, limit }) => populate(
    Blog.find({ ...publicFilter, ...filter })
        .select("-password")
        .sort({ isPinned: -1, publishedAt: -1 })
        .skip(skip)
        .limit(limit)
).lean();

const countPublished = (filter = {}) => Blog.countDocuments({
    ...publicFilter,
    ...filter
});

const findPublishedById = id => populate(Blog.findOne({
    ...publicFilter,
    _id: id
}).select("-password")).lean();

const updateLikeCount = (id, amount) => Blog.findOneAndUpdate(
    { ...publicFilter, _id: id },
    [{
        $set: {
            totalLikes: {
                $max: [0, { $add: [{ $ifNull: ["$totalLikes", 0] }, amount] }]
            }
        }
    }],
    { new: true }
).select("totalLikes").lean();

const validateRelations = async ({ template, category, author, tags = [], relatedBlogs = [] }) => {
    const [templateExists, categoryExists, authorExists, tagCount, relatedCount] = await Promise.all([
        BlogTemplate.exists({ _id: template, isDeleted: false, status: true }),
        BlogCategory.exists({ _id: category, isDeleted: false, status: true }),
        BlogAuthor.exists({ _id: author, isDeleted: false, status: true }),
        BlogTag.countDocuments({ _id: { $in: tags }, isDeleted: false, status: true }),
        Blog.countDocuments({ _id: { $in: relatedBlogs }, isDeleted: false })
    ]);
    return {
        template: Boolean(templateExists),
        category: Boolean(categoryExists),
        author: Boolean(authorExists),
        tags: tagCount === tags.length,
        relatedBlogs: relatedCount === relatedBlogs.length
    };
};

const updateAssignmentCounts = async (blog, amount) => Promise.all([
    BlogCategory.updateOne({ _id: blog.category }, { $inc: { totalBlogs: amount } }),
    BlogAuthor.updateOne({ _id: blog.author }, { $inc: { totalBlogs: amount } }),
    BlogTag.updateMany({ _id: { $in: blog.tags } }, { $inc: { totalBlogs: amount } })
]);

const statistics = () => Blog.aggregate([
    { $match: { isDeleted: false } },
    {
        $group: {
            _id: null,
            totalBlogs: { $sum: 1 },
            drafts: { $sum: { $cond: [{ $eq: ["$status", "DRAFT"] }, 1, 0] } },
            inReview: { $sum: { $cond: [{ $eq: ["$status", "REVIEW"] }, 1, 0] } },
            scheduled: { $sum: { $cond: [{ $eq: ["$status", "SCHEDULED"] }, 1, 0] } },
            published: { $sum: { $cond: [{ $eq: ["$status", "PUBLISHED"] }, 1, 0] } },
            archived: { $sum: { $cond: [{ $eq: ["$status", "ARCHIVED"] }, 1, 0] } },
            totalViews: { $sum: "$totalViews" },
            totalLikes: { $sum: "$totalLikes" }
        }
    },
    { $project: { _id: 0 } }
]);

const hardDelete = id => Blog.deleteOne({ _id: id });

module.exports = {
    create,
    findById,
    findDocumentById,
    findActiveById,
    findActiveDocumentById,
    findBySlug,
    findAll,
    count,
    save,
    hardDelete,
    findPublished,
    countPublished,
    findPublishedById,
    updateLikeCount,
    validateRelations,
    updateAssignmentCounts,
    statistics
};
