const BlogAuthor = require("../../model/blog-model/aurthor.model");

const create = data => BlogAuthor.create(data);
const findById = id => BlogAuthor.findById(id);
const findActiveById = id => BlogAuthor.findOne({ _id: id, isDeleted: false });

const findDuplicate = ({ email, slug, excludeId }) => {
    const filter = { $or: [{ email }, { slug }] };
    if (excludeId) filter._id = { $ne: excludeId };
    return BlogAuthor.findOne(filter).lean();
};

const findAll = ({ filter, sort, skip, limit }) => BlogAuthor
    .find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();

const count = filter => BlogAuthor.countDocuments(filter);

const findDropdown = () => BlogAuthor
    .find({ isDeleted: false, status: true })
    .select("authorCode fullName slug designation authorType profileImage")
    .sort({ displayOrder: 1, fullName: 1 })
    .lean();

const findFeatured = limit => BlogAuthor
    .find({ isDeleted: false, status: true, isFeatured: true })
    .sort({ displayOrder: 1, totalBlogs: -1 })
    .limit(limit)
    .lean();

const findPublic = ({ filter = {}, skip, limit }) => BlogAuthor
    .find({ ...filter, isDeleted: false, status: true })
    .sort({ isFeatured: -1, displayOrder: 1, totalBlogs: -1, fullName: 1 })
    .skip(skip)
    .limit(limit)
    .lean();

const countPublic = (filter = {}) => BlogAuthor.countDocuments({
    ...filter,
    isDeleted: false,
    status: true
});

const findPublicById = id => BlogAuthor.findOne({
    _id: id,
    isDeleted: false,
    status: true
}).lean();

const getStatistics = () => BlogAuthor.aggregate([
    { $match: { isDeleted: false } },
    {
        $group: {
            _id: null,
            totalAuthors: { $sum: 1 },
            activeAuthors: { $sum: { $cond: ["$status", 1, 0] } },
            inactiveAuthors: { $sum: { $cond: ["$status", 0, 1] } },
            featuredAuthors: { $sum: { $cond: ["$isFeatured", 1, 0] } },
            totalBlogs: { $sum: "$totalBlogs" },
            totalViews: { $sum: "$totalViews" }
        }
    },
    { $project: { _id: 0 } }
]);

const save = author => author.save();

module.exports = {
    create,
    findById,
    findActiveById,
    findDuplicate,
    findAll,
    count,
    findDropdown,
    findFeatured,
    findPublic,
    countPublic,
    findPublicById,
    getStatistics,
    save
};
