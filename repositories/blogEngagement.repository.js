const mongoose = require("mongoose");
const BlogLike = require("../model/neet-models/blogLike");
const BlogSave = require("../model/neet-models/blogSave");

const toObjectIds = ids => ids.map(id => new mongoose.Types.ObjectId(id));

const createIdempotent = async (Model, filter, insertData) => {
    try {
        const result = await Model.updateOne(
            filter,
            { $setOnInsert: insertData },
            { upsert: true, runValidators: true }
        );
        return { created: result.upsertedCount === 1 };
    } catch (error) {
        if (error.code === 11000) return { created: false };
        throw error;
    }
};

const like = ({ userId, studentId, blogId }) => createIdempotent(
    BlogLike,
    { user_id: userId, blog_id: blogId },
    { user_id: userId, student_id: studentId, blog_id: blogId }
);

const unlike = ({ userId, blogId }) => BlogLike.deleteOne({
    user_id: userId,
    blog_id: blogId
});

const save = ({ userId, studentId, blogId }) => createIdempotent(
    BlogSave,
    { user_id: userId, blog_id: blogId },
    { user_id: userId, student_id: studentId, blog_id: blogId }
);

const unsave = ({ userId, blogId }) => BlogSave.deleteOne({
    user_id: userId,
    blog_id: blogId
});

const findStates = async (userId, blogIds) => {
    if (!blogIds.length) return { likes: [], saves: [] };
    const ids = toObjectIds(blogIds);
    const [likes, saves] = await Promise.all([
        BlogLike.find({ user_id: userId, blog_id: { $in: ids } })
            .select("blog_id liked_at")
            .lean(),
        BlogSave.find({ user_id: userId, blog_id: { $in: ids } })
            .select("blog_id saved_at")
            .lean()
    ]);
    return { likes, saves };
};

const findSavedForUser = userId => BlogSave
    .find({ user_id: userId })
    .select("blog_id saved_at")
    .sort({ saved_at: -1 })
    .lean();

const countLikes = blogId => BlogLike.countDocuments({ blog_id: blogId });

module.exports = {
    like,
    unlike,
    save,
    unsave,
    countLikes,
    findStates,
    findSavedForUser
};
