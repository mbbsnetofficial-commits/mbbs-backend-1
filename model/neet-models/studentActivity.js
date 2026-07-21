const mongoose = require("mongoose");

const studentActivitySchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    student_id: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    last_seen: {
        type: Date,
        required: true,
        default: Date.now
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
    collection: "neet-app-students-activity",
    versionKey: false
});

studentActivitySchema.index({ last_seen: -1 });

module.exports = mongoose.model("StudentActivity", studentActivitySchema);
