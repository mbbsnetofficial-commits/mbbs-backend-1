const BlogCategory = require("../../model/blog-model/category.model");

const create = data => BlogCategory.create(data);

const findById = id => BlogCategory.findById(id);

const findActiveById = id => BlogCategory.findOne({ _id: id, isDeleted: false });

const findDuplicate = ({ categoryName, slug, excludeId }) => {
    const filter = {
        isDeleted: false,
        $or: [{ categoryName }, { slug }]
    };
    if (excludeId) filter._id = { $ne: excludeId };
    return BlogCategory.findOne(filter).lean();
};

const findAll = ({ filter, sort, skip, limit }) => BlogCategory
    .find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();

const findTreeCategories = filter => BlogCategory
    .find(filter)
    .sort({ displayOrder: 1, categoryName: 1 })
    .lean();

const findDropdownCategories = filter => BlogCategory
    .find(filter)
    .select("categoryName categoryCode slug parentCategory level categoryType")
    .sort({ displayOrder: 1, categoryName: 1 })
    .lean();

const count = filter => BlogCategory.countDocuments(filter);

const countChildren = parentCategory => BlogCategory.countDocuments({
    parentCategory,
    isDeleted: false
});

const save = category => category.save();

module.exports = {
    create,
    findById,
    findActiveById,
    findDuplicate,
    findAll,
    findTreeCategories,
    findDropdownCategories,
    count,
    countChildren,
    save
};
