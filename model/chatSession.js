const mongoose = require("mongoose");

const chatSessionSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auth",
        required: true,
        index: true
    },
    test_session_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TestSession",
        required: true,
        index: true
    },
    title: {
        type: String,
        trim: true,
        maxlength: 120,
        default: "Test Review Chat"
    },
    wrong_question_ids: [{
        type: Number
    }],
    is_active: {
        type: Boolean,
        default: true,
        index: true
    },
    last_message_at: {
        type: Date,
        default: Date.now
    }
}, {
    collection: "chat-sessions",
    timestamps: true
});

chatSessionSchema.index({ user_id: 1, is_active: 1, last_message_at: -1 });
chatSessionSchema.index({ user_id: 1, test_session_id: 1 });

module.exports = mongoose.model("ChatSession", chatSessionSchema);
