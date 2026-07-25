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

        qod_date_key: {
            type: String,
            match: /^\d{4}-\d{2}-\d{2}$/,
            default: null,
            index: true
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

questionSubmissionSchema.index(
    { student_id: 1, question_id: 1 },
    { unique: true }
);
questionSubmissionSchema.index(
    { student_id: 1, qod_date_key: 1 },
    {
        unique: true,
        partialFilterExpression: { qod_date_key: { $type: "string" } }
    }
);

module.exports = mongoose.model(
    "QuestionSubmission",
    questionSubmissionSchema
);
