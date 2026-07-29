const mongoose = require("mongoose");

const passwordSetupTokenSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auth",
        required: true,
        unique: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    token_hash: {
        type: String,
        required: true,
        unique: true,
        select: false
    },
    expires_at: {
        type: Date,
        required: true,
        index: { expireAfterSeconds: 0 }
    },
    resend_available_at: {
        type: Date,
        required: true
    },
    used_at: {
        type: Date,
        default: null
    }
}, {
    collection: "password-setup-tokens",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false
});

module.exports = mongoose.model("PasswordSetupToken", passwordSetupTokenSchema);
