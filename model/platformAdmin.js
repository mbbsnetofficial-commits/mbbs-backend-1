const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const platformAdminSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 60
    },
    password_hash: {
        type: String,
        required: true,
        select: false
    },
    is_active: {
        type: Boolean,
        default: true,
        index: true
    },
    last_login_at: {
        type: Date,
        default: null
    },
    token_version: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    collection: "platform-admins",
    timestamps: { createdAt: "created_at", updatedAt: false },
    versionKey: false
});

platformAdminSchema.pre("save", async function () {
    if (this.isModified("password_hash") && !/^\$2[aby]\$/.test(this.password_hash)) {
        this.password_hash = await bcrypt.hash(this.password_hash, 12);
    }
});

platformAdminSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password_hash);
};

module.exports = mongoose.model("PlatformAdmin", platformAdminSchema);
