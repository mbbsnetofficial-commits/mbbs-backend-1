const mongoose = require("mongoose");

const userActivitySchema = new mongoose.Schema({
    // Legacy activity records may contain a numeric id. New login-event records
    // use MongoDB _id and intentionally leave this field unset.
    id: {
        type: Number,
        default: undefined
    },
    user_id: {
        // Mixed keeps existing numeric activity records readable while new
        // login events store the neet-auth ObjectId.
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    student_id: {
        type: String,
        trim: true,
        default: null
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        default: null
    },
    first_name: {
        type: String,
        trim: true,
        default: null
    },
    last_name: {
        type: String,
        trim: true,
        default: null
    },
    event_type: {
        type: String,
        enum: ["login"],
        default: undefined
    },
    auth_method: {
        type: String,
        enum: ["password"],
        default: undefined
    },
    login_at: {
        type: Date,
        default: undefined
    },
    session_id: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    last_seen: {
        type: Date,
        default: undefined
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
    timestamps: { createdAt: "created_at", updatedAt: false },
    versionKey: false
});

userActivitySchema.index(
    { event_type: 1, login_at: -1 },
    { name: "login_activity_time" }
);
userActivitySchema.index(
    { user_id: 1, login_at: -1 },
    { name: "login_activity_user_time" }
);
userActivitySchema.index(
    { student_id: 1, login_at: -1 },
    { name: "login_activity_student_time" }
);
userActivitySchema.index(
    { email: 1, login_at: -1 },
    { name: "login_activity_email_time" }
);

module.exports = mongoose.model("UserActivity", userActivitySchema);
