const mongoose = require("mongoose");

const userActivitySchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    user_id: {
        type: Number,
        required: true,
        unique: true,
        index: true
    },
    last_seen: {
        type: Date,
        required: true,
        default: Date.now
    },
    ip_address: {
        type: String,
        required: true,
        trim: true
    },
    user_agent: {
        type: String,
        required: true,
        trim: true
    }
}, {
    collection: "neet-app-user-activity",
    versionKey: false
});

userActivitySchema.index({ last_seen: -1 });

module.exports = mongoose.model("UserActivity", userActivitySchema);
