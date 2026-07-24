const BlogTag = require("../../model/blog-model/tag.model");

const create = data => BlogTag.create(data);
const findById = id => BlogTag.findById(id);
const findActiveById = id => BlogTag.findOne({ _id: id, isDeleted: false });

const findDuplicate = ({ tagName, slug, excludeId }) => {
    const filter = { isDeleted: false, $or: [{ tagName }, { slug }] };
    if (excludeId) filter._id = { $ne: excludeId };
    return BlogTag.findOne(filter).lean();
};

const findAll = ({ filter, sort, skip, limit }) => BlogTag
    .find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();

const count = filter => BlogTag.countDocuments(filter);

const findDropdown = filter => BlogTag
    .find(filter)
    .select("tagName tagCode slug tagType color")
    .sort({ displayOrder: 1, tagName: 1 })
    .lean();

const findPopular = (filter, limit) => BlogTag
    .find(filter)
    .sort({ totalBlogs: -1, totalViews: -1, tagName: 1 })
    .limit(limit)
    .lean();

const getStatistics = () => BlogTag.aggregate([
    { $match: { isDeleted: false } },
    {
        $group: {
            _id: null,
            totalTags: { $sum: 1 },
            activeTags: { $sum: { $cond: ["$status", 1, 0] } },
            inactiveTags: { $sum: { $cond: ["$status", 0, 1] } },
            featuredTags: { $sum: { $cond: ["$isFeatured", 1, 0] } },
            totalBlogAssignments: { $sum: "$totalBlogs" },
            totalViews: { $sum: "$totalViews" }
        }
    },
    { $project: { _id: 0 } }
]);

const save = tag => tag.save();

module.exports = {
    create,
    findById,
    findActiveById,
    findDuplicate,
    findAll,
    count,
    findDropdown,
    findPopular,
    getStatistics,
    save
};
