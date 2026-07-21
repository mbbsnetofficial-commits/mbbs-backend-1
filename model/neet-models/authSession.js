const mongoose = require("mongoose");

const authSessionSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auth",
        required: true,
        index: true
    },
    refresh_jti: {
        type: String,
        required: true,
        unique: true
    },
    refresh_token_hash: {
        type: String,
        required: true,
        select: false
    },
    user_agent: {
        type: String,
        default: "unknown"
    },
    ip_address: {
        type: String,
        default: "unknown"
    },
    is_revoked: {
        type: Boolean,
        default: false,
        index: true
    },
    revoked_at: {
        type: Date,
        default: null
    },
    last_used_at: {
        type: Date,
        default: Date.now
    },
    expires_at: {
        type: Date,
        required: true,
        index: { expires: 0 }
    }
}, {
    collection: "auth-sessions",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false
});

authSessionSchema.index({ user_id: 1, is_revoked: 1, expires_at: 1 });

module.exports = mongoose.model("AuthSession", authSessionSchema);
