const mongoose = require("mongoose");
const {
    NOTIFICATION_TYPE_ENUM,
    NOTIFICATION_PRIORITY_ENUM
} = require("../../constants/enum");

const notificationSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auth",
        required: true,
        index: true
    },
    student_id: {
        type: String,
        required: false,
        trim: true,
        index: true,
        default: null
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 150
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    notification_type: {
        type: String,
        enum: NOTIFICATION_TYPE_ENUM,
        default: "system"
    },
    priority: {
        type: String,
        enum: NOTIFICATION_PRIORITY_ENUM,
        default: "normal"
    },
    action_url: {
        type: String,
        trim: true,
        maxlength: 500,
        default: null
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    is_read: {
        type: Boolean,
        default: false,
        index: true
    },
    read_at: {
        type: Date,
        default: null
    },
    is_deleted: {
        type: Boolean,
        default: false
    },
    deleted_at: {
        type: Date,
        default: null
    }
}, {
    collection: "notifications",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false
});

notificationSchema.index({ user_id: 1, is_deleted: 1, created_at: -1 });
notificationSchema.index({ user_id: 1, is_read: 1, is_deleted: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
