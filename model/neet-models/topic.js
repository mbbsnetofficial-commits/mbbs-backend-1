const mongoose = require("mongoose");

const {
    SUBJECT_ENUM
} = require("../../constants/enum");

const topicSchema = new mongoose.Schema(
{
    id: {
        type: Number,
        required: true,
        unique: true
    },

    name: {
        type: String,
        required: true,
        trim: true
    },

    subject: {
        type: String,
        required: true,
        enum: SUBJECT_ENUM,
        index: true
    },

    chapter: {
        type: String,
        required: true,
        trim: true,
        index: true
    },

    icon: {
        type: String,
        default: "📚"
    },

    is_active: {
        type: Boolean,
        default: true,
        index: true
    },

    deactivated_at: {
        type: Date,
        default: null
    }
},
{
    collection: "neet-topics",
    timestamps: true
});

// Speeds up chapter/topic filtering and topic-name sorting.
topicSchema.index({ subject: 1, chapter: 1, name: 1 });

module.exports = mongoose.model("Topic", topicSchema);
