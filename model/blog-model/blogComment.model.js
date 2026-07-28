"use strict";

const mongoose = require("mongoose");
const { blogConnection } = require("../../config/database");

const blogCommentSchema = new mongoose.Schema(
    {
        blog: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Blog",
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
            trim: true,
            index: true
        },
        commenterName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200
        },
        profilePicture: {
            type: String,
            default: "",
            trim: true
        },
        comment: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 2000
        },
        isEdited: {
            type: Boolean,
            default: false
        },
        isDeleted: {
            type: Boolean,
            default: false,
            index: true
        },
        deletedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true,
        collection: "blog_comments"
    }
);

blogCommentSchema.index({ blog: 1, isDeleted: 1, createdAt: -1 });

module.exports = blogConnection.model("BlogComment", blogCommentSchema);
