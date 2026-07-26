const mongoose = require("mongoose");

const questionOfTheDaySchema = new mongoose.Schema(
    {
        id: {
            type: Number,
            required: [true, "Question ID is required"],
            unique: true
        },

question_date: {
    type: Date,
    default: null
},

        question: {
            type: String,
            required: [true, "Question is required"],
            trim: true
        },

        option_a: {
            type: String,
            required: [true, "Option A is required"],
            trim: true
        },

        option_b: {
            type: String,
            required: [true, "Option B is required"],
            trim: true
        },

        option_c: {
            type: String,
            required: [true, "Option C is required"],
            trim: true
        },

        option_d: {
            type: String,
            required: [true, "Option D is required"],
            trim: true
        },

        correct_answer: {
            type: String,
            required: [true, "Correct answer is required"],
            enum: ["A", "B", "C", "D"]
        },

        explanation: {
            type: String,
            required: [true, "Explanation is required"],
            trim: true
        },

        difficulty: {
            type: String,
            enum: ["Easy", "Medium", "Hard"],
            required: true
        },

        question_type: {
            type: String,
            required: true,
            trim: true
        },

        topic_id: {
            type: Number,
            required: true
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
        timestamps: true,
        collection: "questions-of-the-day"
    }
);

module.exports = mongoose.model(
    "QuestionOfTheDay",
    questionOfTheDaySchema
);
