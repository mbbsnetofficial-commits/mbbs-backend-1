const SEO = require("../../model/blog-model/seo.model");
const Blog = require("../../model/blog-model/blog.model");
const Author = require("../../model/blog-model/aurthor.model");
const Category = require("../../model/blog-model/category.model");
const Tag = require("../../model/blog-model/tag.model");

const create = payload => SEO.create(payload);
const findById = id => SEO.findById(id);
const findActiveById = id => SEO.findOne({ _id: id, isDeleted: false });
const findBySlug = (slug, excludeId) => {
    const filter = { slug };
    if (excludeId) filter._id = { $ne: excludeId };
    return SEO.findOne(filter).lean();
};
const findByModule = (module, referenceId, excludeId) => {
    const filter = { module, referenceId };
    if (excludeId) filter._id = { $ne: excludeId };
    return SEO.findOne(filter).lean();
};
const findAll = ({ filter, sort, skip, limit }) => SEO.find(filter).sort(sort).skip(skip).limit(limit).lean();
const count = filter => SEO.countDocuments(filter);
const save = seo => seo.save();
const statistics = () => SEO.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: "$module", total: { $sum: 1 }, active: { $sum: { $cond: ["$isActive", 1, 0] } } } },
    { $sort: { _id: 1 } }
]);

const referenceExists = async (module, referenceId) => {
    const model = { BLOG: Blog, AUTHOR: Author, CATEGORY: Category, TAG: Tag }[module];
    if (!model) return true;
    return Boolean(await model.exists({ _id: referenceId, isDeleted: false }));
};

module.exports = {
    create,
    findById,
    findActiveById,
    findBySlug,
    findByModule,
    findAll,
    count,
    save,
    statistics,
    referenceExists
};
