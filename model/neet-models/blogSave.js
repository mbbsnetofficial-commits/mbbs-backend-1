const mongoose = require("mongoose");

const blogSaveSchema = new mongoose.Schema({
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
    blog_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    }
}, {
    collection: "blog-saves",
    timestamps: { createdAt: "saved_at", updatedAt: "updated_at" },
    versionKey: false
});

blogSaveSchema.index(
    { user_id: 1, blog_id: 1 },
    { unique: true, name: "unique_user_blog_save" }
);
blogSaveSchema.index({ user_id: 1, saved_at: -1 });

module.exports = mongoose.model("BlogSave", blogSaveSchema);
