const mongoose = require("mongoose");

const studentProfileSchema = new mongoose.Schema({
    student_id: { type: String, required: true, unique: true, trim: true, index: true },
    phone_number: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    full_name: { type: String, trim: true, maxlength: 120 },
    date_of_birth: { type: Date },
    school_name: { type: String, trim: true, maxlength: 200 },
    target_exam_year: { type: Number },
    batch: { type: String, trim: true, maxlength: 100, index: true },
    course: { type: String, trim: true, maxlength: 100, index: true },
    subscription_plan: { type: String, trim: true },
    subscription_expires_at: { type: Date },
    is_active: { type: Boolean, default: true },
    is_verified: { type: Boolean, default: false },
    email_verified: { type: Boolean, default: false },
    is_institution_student: { type: Boolean, default: false },
    is_first_login: { type: Boolean, default: true },
    last_login: { type: Date, default: Date.now },
    auth_provider: {
        type: String,
        enum: ["mobile", "local", "google"],
        default: "local"
    },
    google_email: { type: String, trim: true, lowercase: true },
    google_picture: { type: String, trim: true },
    google_sub: { type: String, trim: true },
    password_hash: { type: String, select: false },
    generated_password: { type: String, select: false }
}, {
    collection: "student-profile",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false
});

studentProfileSchema.index({ phone_number: 1 }, { sparse: true });
studentProfileSchema.index({ email: 1 }, { sparse: true });

module.exports = mongoose.model("StudentProfile", studentProfileSchema);
