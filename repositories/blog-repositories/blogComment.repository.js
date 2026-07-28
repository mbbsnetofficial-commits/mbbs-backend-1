"use strict";

const Blog = require("../../model/blog-model/blog.model");
const BlogComment = require("../../model/blog-model/blogComment.model");

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
            .select("student_id commenterName profilePicture comment isEdited createdAt updatedAt")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        BlogComment.countDocuments(filter)
    ]);
    return { comments, total };
};

exports.create = data => BlogComment.create(data);

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
