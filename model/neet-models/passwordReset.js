const mongoose = require("mongoose");

const passwordResetSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auth",
        required: true,
        unique: true,
        index: true
    },
    phone_number: {
        type: String,
        required: true,
        trim: true
    },
    otp_hash: {
        type: String,
        required: true,
        select: false
    },
    otp_expires_at: {
        type: Date,
        required: true
    },
    attempts: {
        type: Number,
        default: 0,
        min: 0
    },
    resend_available_at: {
        type: Date,
        required: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    reset_token_hash: {
        type: String,
        default: null,
        select: false
    },
    reset_token_expires_at: {
        type: Date,
        default: null
    },
    used_at: {
        type: Date,
        default: null
    },
    twilio_message_sid: {
        type: String,
        default: null
    },
    twilio_message_status: {
        type: String,
        default: null
    },
    twilio_error_code: {
        type: Number,
        default: null
    },
    twilio_error_message: {
        type: String,
        default: null
    }
}, {
    collection: "reset-password",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false
});

module.exports = mongoose.model("PasswordReset", passwordResetSchema);
