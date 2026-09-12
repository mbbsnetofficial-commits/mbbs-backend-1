const mongoose = require("mongoose");

const deviceTokenSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            required: true,
            index: true
        },
        student_id: {
            type: String,
            trim: true,
            index: true,
            default: null
        },
        token: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true
        },
        device_type: {
            type: String,
            enum: ["android", "ios", "web"],
            default: "android",
            lowercase: true,
            trim: true
        },
        device_id: {
            type: String,
            trim: true,
            default: null
        },
        app_version: {
            type: String,
            trim: true,
            default: null
        },
        is_active: {
            type: Boolean,
            default: true,
            index: true
        },
        last_used_at: {
            type: Date,
            default: Date.now
        }
    },
    {
        collection: "devicetokens",
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
    }
);

deviceTokenSchema.index({ user_id: 1, is_active: 1 });
deviceTokenSchema.index({ student_id: 1, is_active: 1 });
deviceTokenSchema.index({ token: 1, is_active: 1 });

module.exports = mongoose.model("DeviceToken", deviceTokenSchema);
