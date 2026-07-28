"use strict";

const Auth = require("../../model/neet-models/auth");
const repository = require("../../repositories/blog-repositories/blogComment.repository");
const { buildPagination } = require("../../utilities/page");

const error = (message, statusCode) =>
    Object.assign(new Error(message), { statusCode });

const publishedBlog = async slug => {
    const blog = await repository.findPublishedBlogBySlug(slug);
    if (!blog) throw error("Published blog not found.", 404);
    return blog;
};

const studentProfile = async user => {
    const student = await Auth.findById(user.id)
        .select("student_id firstName lastName profile_picture is_active")
        .lean();
    if (!student || student.is_active === false) {
        throw error("Student account not found or inactive.", 401);
    }
    return student;
};

const format = comment => ({
    id: comment._id,
    student_id: comment.student_id,
    commenterName: comment.commenterName,
    profilePicture: comment.profilePicture || null,
    comment: comment.comment,
    isEdited: comment.isEdited,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt
});

exports.list = async (slug, page, limit) => {
    const blog = await publishedBlog(slug);
    const data = await repository.list(blog._id, page, limit);
    return {
        blog: { id: blog._id, slug: blog.slug, title: blog.title },
        comments: data.comments.map(format),
        pagination: buildPagination(page, limit, data.total)
    };
};

exports.create = async (slug, payload, user) => {
    const [blog, student] = await Promise.all([
        publishedBlog(slug),
        studentProfile(user)
    ]);
    const commenterName = [student.firstName, student.lastName]
        .filter(Boolean)
        .join(" ")
        .trim() || "Student";
    const created = await repository.create({
        blog: blog._id,
        studentId: student._id,
        student_id: student.student_id,
        commenterName,
        profilePicture: student.profile_picture || "",
        comment: payload.comment
    });
    await repository.incrementCount(blog._id);
    return format(created);
};

exports.update = async (slug, commentId, payload, user) => {
    const blog = await publishedBlog(slug);
    const comment = await repository.findOwned(commentId, blog._id, user.id);
    if (!comment) throw error("Comment not found or you cannot edit it.", 404);
    comment.comment = payload.comment;
    comment.isEdited = true;
    await comment.save();
    return format(comment);
};

exports.remove = async (slug, commentId, user) => {
    const blog = await publishedBlog(slug);
    const comment = await repository.findOwned(commentId, blog._id, user.id);
    if (!comment) throw error("Comment not found or you cannot delete it.", 404);
    comment.isDeleted = true;
    comment.deletedAt = new Date();
    await comment.save();
    await repository.decrementCount(blog._id);
};
