const mongoose = require("mongoose");

const questionSubmissionSchema = new mongoose.Schema(
    {
        student_id: {
            type: String,
            required: [true, "Student ID is required"],
            trim: true
        },

        question_id: {
            type: Number,
            required: [true, "Question ID is required"]
        },

        selected_option: {
            type: String,
            required: [true, "Selected option is required"],
            enum: ["A", "B", "C", "D"]
        },

        is_correct: {
            type: Boolean,
            required: true
        },

        submitted_at: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true,
        collection: "question-submissions"
    }
);

module.exports = mongoose.model(
    "QuestionSubmission",
    questionSubmissionSchema
);