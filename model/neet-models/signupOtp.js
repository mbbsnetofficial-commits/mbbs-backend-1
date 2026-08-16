const mongoose = require("mongoose");

const signupOtpSchema = new mongoose.Schema({
    full_name: { type: String, trim: true, default: "" },
    first_name: { type: String, trim: true, default: "" },
    last_name: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, lowercase: true, default: "" },
    phone_number: { type: String, required: true, unique: true, index: true },
    password_hash: { type: String, select: false, default: null },
    otp_hash: { type: String, required: true, select: false },
    otp_expires_at: { type: Date, required: true },
    resend_available_at: { type: Date, required: true },
    attempts: { type: Number, default: 0, min: 0 },
    verified: { type: Boolean, default: false },
    used_at: { type: Date, default: null },
    purpose: { type: String, enum: ["signup", "login", "reset"], default: "signup" },
    twilio_message_sid: { type: String, default: null },
    twilio_message_status: { type: String, default: null },
    twilio_error_code: { type: Number, default: null },
    twilio_error_message: { type: String, default: null }
}, {
    collection: "signup-otp",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false
});

module.exports = mongoose.model("SignupOtp", signupOtpSchema);
