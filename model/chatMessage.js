const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema({
    chat_session_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ChatSession",
        required: true,
        index: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auth",
        required: true,
        index: true
    },
    role: {
        type: String,
        enum: ["user", "assistant"],
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 12000
    },
    model: {
        type: String,
        default: null
    }
}, {
    collection: "chat-messages",
    timestamps: true
});

chatMessageSchema.index({ chat_session_id: 1, createdAt: 1 });
chatMessageSchema.index({ user_id: 1, createdAt: -1 });

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
