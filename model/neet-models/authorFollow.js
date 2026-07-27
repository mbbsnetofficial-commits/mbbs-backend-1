const mongoose = require("mongoose");

const authorFollowSchema = new mongoose.Schema({
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
    // Authors live on the separate blog database connection, so this ID is
    // intentionally stored without a Mongoose ref and resolved by the service.
    author_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    }
}, {
    collection: "author-follows",
    timestamps: { createdAt: "followed_at", updatedAt: "updated_at" },
    versionKey: false
});

authorFollowSchema.index(
    { user_id: 1, author_id: 1 },
    { unique: true, name: "unique_user_author_follow" }
);
authorFollowSchema.index({ author_id: 1, followed_at: -1 });
authorFollowSchema.index({ user_id: 1, followed_at: -1 });

module.exports = mongoose.model("AuthorFollow", authorFollowSchema);
