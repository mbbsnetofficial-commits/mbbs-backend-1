const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
{
    id: {
        type: Number,
        required: true,
        unique: true
    },

    question: {
        type: String,
        required: true
    },

    option_a: String,
    option_b: String,
    option_c: String,
    option_d: String,

    correct_answer: {
        type: String,
        required: true
    },

    explanation: String,

    difficulty: {
        type: String,
        default: "Medium"
    },

    question_type: String,

    topic_id: {
        type: Number,
        required: true,
        index: true
    }
},
{
    collection: "questions",
    timestamps: true
});

module.exports = mongoose.model("Question", questionSchema);