const BlogTemplate = require("../../model/blog-model/template");

/**
 * Create and persist a new blog template.
 */
const create = data => BlogTemplate.create(data);

/**
 * Find one template that has not been soft-deleted.
 * Returns a Mongoose document because update operations call save().
 */
const findActiveById = id => BlogTemplate.findOne({
    _id: id,
    isDeleted: false
});

/**
 * Return a paginated template list as plain objects.
 */
const findAll = ({ filter, sort, skip, limit }) => BlogTemplate
    .find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();

/**
 * Count templates matching the supplied list filter.
 */
const count = filter => BlogTemplate.countDocuments(filter);

/**
 * Remove the default flag from existing templates.
 * excludeId is used while updating an existing template.
 */
const clearDefaultTemplates = excludeId => {
    const filter = {
        isDefault: true,
        isDeleted: false
    };

    if (excludeId) {
        filter._id = { $ne: excludeId };
    }

    return BlogTemplate.updateMany(
        filter,
        { $set: { isDefault: false } }
    );
};

/**
 * Persist changes made to a template document.
 */
const save = template => template.save();

module.exports = {
    create,
    findActiveById,
    findAll,
    count,
    clearDefaultTemplates,
    save
};
