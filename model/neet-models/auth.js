const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const authSchema = new mongoose.Schema(
    {
        student_id: {
            type: String,
            unique: true
        },

        fullName: {
            type: String,
            trim: true
        },

        firstName: {
            type: String,
            trim: true,
            default: ""
        },

        lastName: {
            type: String,
            trim: true,
            default: ""
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
            sparse: true,
            validate: {
                validator: function (value) {
                    return !value || validator.isEmail(value);
                },
                message: "Please enter a valid email"
            }
        },

        password: {
            type: String,
            trim: true,
            minlength: [8, "Password must be at least 8 characters long"],
            required: false
        },

        confirmPassword: {
            type: String,
            trim: true,
            required: false
        },

        phoneNumber: {
            type: String,
            required: [true, "Phone number is required"],
            index: true,
            validate: {
                validator: value => /^\+[1-9]\d{7,14}$/.test(value),
                message: "Phone number must use international format"
            }
        },

        firebase_uid: {
            type: String,
            unique: true,
            sparse: true,
            trim: true
        },

        auth_providers: {
            type: [{
                type: String,
                enum: ["whatsapp", "password", "google"]
            }],
            default: ["whatsapp"]
        },

        profile_picture: {
            type: String,
            trim: true
        },

        token_version: {
            type: Number,
            default: 0,
            min: 0
        },

        is_active: {
            type: Boolean,
            default: true,
            index: true
        }
    },
    {
        collection: "neet-auth",
        timestamps: true
    }
);

// Google accounts do not have to provide a phone number. A normal unique
// index also indexes a missing value as null, which allows only one phone-less
// account. Only real string phone numbers should participate in uniqueness.
authSchema.index(
    { phoneNumber: 1 },
    {
        unique: true,
        partialFilterExpression: { phoneNumber: { $type: "string" } },
        name: "phoneNumber_1"
    }
);

// Optional email field: only string emails participate in uniqueness,
// preventing duplicate null key errors when users sign up via phone only.
authSchema.index(
    { email: 1 },
    {
        unique: true,
        partialFilterExpression: { email: { $type: "string" } },
        name: "email_1"
    }
);


// ==========================================
// Generate Student ID & Hash Password
// ==========================================
authSchema.pre("validate", function () {
    if (this.isModified("phoneNumber") && this.phoneNumber) {
        const cleaned = this.phoneNumber.trim().replace(/[\s()-]/g, "");
        this.phoneNumber = /^\d{10}$/.test(cleaned) ? `+91${cleaned}` : cleaned;
    }
});

authSchema.pre("save", async function () {

    if (this.isNew && !this.student_id) {

        const random = Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();

        this.student_id = `STU${Date.now()}${random}`;
    }

    if (this.isModified("password") && !/^\$2[aby]\$/.test(this.password)) {
        this.password = await bcrypt.hash(this.password, 10);
    }

    this.confirmPassword = undefined;
});

// ==========================================
// Compare Password
// ==========================================

authSchema.methods.comparePassword = async function (
    enteredPassword,
    storedPassword
) {
    return await bcrypt.compare(
        enteredPassword,
        storedPassword
    );
};

module.exports = mongoose.model("Auth", authSchema);
