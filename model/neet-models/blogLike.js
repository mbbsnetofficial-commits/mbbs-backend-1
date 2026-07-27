const mongoose = require("mongoose");

const blogLikeSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auth",
        required: true,
        index: true
    },
    student_id: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    // Blog documents use the separate blog database connection.
    blog_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    }
}, {
    collection: "blog-likes",
    timestamps: { createdAt: "liked_at", updatedAt: "updated_at" },
    versionKey: false
});

blogLikeSchema.index(
    { user_id: 1, blog_id: 1 },
    { unique: true, name: "unique_user_blog_like" }
);
blogLikeSchema.index({ user_id: 1, liked_at: -1 });
blogLikeSchema.index({ blog_id: 1, liked_at: -1 });

module.exports = mongoose.model("BlogLike", blogLikeSchema);
