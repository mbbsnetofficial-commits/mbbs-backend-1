const Review = require("../../model/blog-model/review.model");
const Blog = require("../../model/blog-model/blog.model");
const Author = require("../../model/blog-model/aurthor.model");
const Media = require("../../model/blog-model/media.model");

const populate = query => query.populate("media.mediaId", "secureUrl resourceType altText");
const create = data => Review.create(data);
const findById = id => populate(Review.findById(id));
const findActiveById = id => populate(Review.findOne({ _id: id, isDeleted: false }));
const findDocumentById = id => Review.findById(id);
const findDuplicate = (studentId, reviewType, referenceId, excludeId) => {
    const filter = { studentId, reviewType, referenceId, isDeleted: false };
    if (excludeId) filter._id = { $ne: excludeId };
    return Review.findOne(filter).lean();
};
const findAll = ({ filter, sort, skip, limit }) =>
    populate(Review.find(filter).sort(sort).skip(skip).limit(limit)).lean();
const count = filter => Review.countDocuments(filter);
const save = review => review.save();
const referenceExists = async (reviewType, referenceId) => {
    const model = { BLOG: Blog, AUTHOR: Author }[reviewType];
    if (!model) return true;
    return Boolean(await model.exists({ _id: referenceId, isDeleted: false }));
};
const mediaExist = async media => {
    const ids = (media || []).map(item => item.mediaId);
    return !ids.length || await Media.countDocuments({ _id: { $in: ids }, isDeleted: false }) === ids.length;
};
const statistics = () => Review.aggregate([
    { $match: { isDeleted: false } },
    {
        $group: {
            _id: null,
            totalReviews: { $sum: 1 },
            pending: { $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] } },
            approved: { $sum: { $cond: [{ $eq: ["$status", "APPROVED"] }, 1, 0] } },
            rejected: { $sum: { $cond: [{ $eq: ["$status", "REJECTED"] }, 1, 0] } },
            spam: { $sum: { $cond: [{ $eq: ["$status", "SPAM"] }, 1, 0] } },
            averageRating: { $avg: "$rating" }
        }
    },
    { $project: { _id: 0 } }
]);

module.exports = {
    create, findById, findActiveById, findDocumentById, findDuplicate,
    findAll, count, save, referenceExists, mediaExist, statistics
};
