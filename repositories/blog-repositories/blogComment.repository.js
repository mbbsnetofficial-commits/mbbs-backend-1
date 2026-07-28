"use strict";

const Blog = require("../../model/blog-model/blog.model");
const BlogComment = require("../../model/blog-model/blogComment.model");
const BlogCommentLike = require("../../model/blog-model/blogCommentLike.model");

const publishedFilter = {
    isDeleted: false,
    status: "PUBLISHED",
    visibility: "PUBLIC"
};

exports.findPublishedBlogBySlug = slug =>
    Blog.findOne({ ...publishedFilter, slug })
        .select("_id slug title totalComments")
        .lean();

exports.list = async (blogId, page, limit) => {
    const filter = { blog: blogId, isDeleted: false };
    const skip = (page - 1) * limit;
    const [comments, total] = await Promise.all([
        BlogComment.find(filter)
            .select("student_id commenterName profilePicture comment isEdited totalLikes createdAt updatedAt")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        BlogComment.countDocuments(filter)
    ]);
    return { comments, total };
};

exports.create = data => BlogComment.create(data);

exports.findActiveComment = (commentId, blogId) =>
    BlogComment.findOne({
        _id: commentId,
        blog: blogId,
        isDeleted: false
    });

exports.findOwned = (commentId, blogId, studentId) =>
    BlogComment.findOne({
        _id: commentId,
        blog: blogId,
        studentId,
        isDeleted: false
    });

exports.incrementCount = blogId =>
    Blog.updateOne({ _id: blogId }, { $inc: { totalComments: 1 } });

exports.decrementCount = blogId =>
    Blog.updateOne(
        { _id: blogId, totalComments: { $gt: 0 } },
        { $inc: { totalComments: -1 } }
    );

exports.findLikedCommentIds = async (commentIds, studentId) => {
    if (!studentId || !commentIds.length) return [];
    const likes = await BlogCommentLike.find({
        comment: { $in: commentIds },
        studentId
    }).select("comment").lean();
    return likes.map(item => String(item.comment));
};

exports.createLike = data => BlogCommentLike.create(data);

exports.deleteLike = (commentId, studentId) =>
    BlogCommentLike.deleteOne({ comment: commentId, studentId });

exports.deleteLikesForComment = commentId =>
    BlogCommentLike.deleteMany({ comment: commentId });

exports.incrementLikes = commentId =>
    BlogComment.findOneAndUpdate(
        { _id: commentId, isDeleted: false },
        { $inc: { totalLikes: 1 } },
        { new: true }
    );

exports.decrementLikes = commentId =>
    BlogComment.findOneAndUpdate(
        { _id: commentId, isDeleted: false, totalLikes: { $gt: 0 } },
        { $inc: { totalLikes: -1 } },
        { new: true }
    );
