const mongoose = require("mongoose");
const AuthorFollow = require("../model/neet-models/authorFollow");

const toObjectIds = authorIds => authorIds.map(id => new mongoose.Types.ObjectId(id));

const follow = async ({ userId, studentId, authorId }) => {
    try {
        return await AuthorFollow.findOneAndUpdate(
            { user_id: userId, author_id: authorId },
            {
                $set: { student_id: studentId },
                $setOnInsert: { user_id: userId, author_id: authorId }
            },
            { upsert: true, new: true, runValidators: true }
        ).lean();
    } catch (error) {
        // Two near-simultaneous first follows may race on the unique index.
        // Treat the winning document as the idempotent result.
        if (error.code === 11000) {
            return AuthorFollow.findOne({
                user_id: userId,
                author_id: authorId
            }).lean();
        }
        throw error;
    }
};

const unfollow = ({ userId, authorId }) => AuthorFollow.deleteOne({
    user_id: userId,
    author_id: authorId
});

const findForUserAndAuthors = (userId, authorIds) => {
    if (!authorIds.length) return Promise.resolve([]);
    return AuthorFollow.find({
        user_id: userId,
        author_id: { $in: toObjectIds(authorIds) }
    }).select("author_id followed_at").lean();
};

const findAllForUser = userId => AuthorFollow
    .find({ user_id: userId })
    .select("author_id followed_at")
    .sort({ followed_at: -1 })
    .lean();

const countFollowersByAuthor = authorIds => {
    if (!authorIds.length) return Promise.resolve([]);
    return AuthorFollow.aggregate([
        { $match: { author_id: { $in: toObjectIds(authorIds) } } },
        { $group: { _id: "$author_id", followerCount: { $sum: 1 } } }
    ]);
};

const countForAuthor = authorId => AuthorFollow.countDocuments({ author_id: authorId });

module.exports = {
    follow,
    unfollow,
    findForUserAndAuthors,
    findAllForUser,
    countFollowersByAuthor,
    countForAuthor
};
