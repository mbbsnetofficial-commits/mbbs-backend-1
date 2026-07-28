"use strict";

const mongoose = require("mongoose");
const { blogConnection } = require("../../config/database");

const blogCommentLikeSchema = new mongoose.Schema(
    {
        comment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "BlogComment",
            required: true,
            index: true
        },
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true
        },
        student_id: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true,
        collection: "blog_comment_likes"
    }
);

blogCommentLikeSchema.index(
    { comment: 1, studentId: 1 },
    { unique: true }
);

module.exports = blogConnection.model(
    "BlogCommentLike",
    blogCommentLikeSchema
);
