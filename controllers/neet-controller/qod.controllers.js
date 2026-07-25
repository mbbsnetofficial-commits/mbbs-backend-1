const QuestionOfTheDay = require("../../model/neet-models/qod");
const QuestionSubmission = require("../../model/neet-models/qodsubmission");
const qodStreakService = require("../../services/qodStreak.service");

// ==========================================
// GET QUESTION OF THE DAY
// ==========================================

exports.getQuestionOfTheDay = async (req, res) => {
    try {

        // Get Student ID from JWT
        const studentId = req.user.student_id;

        // Find the question using the configured application timezone.
        const question = await qodStreakService.findTodaysQuestion();

        if (!question) {
            return res.status(404).json({
                status: "fail",
                message: "No Question of the Day found."
            });
        }

        // Check Whether Student Already Answered
        const alreadyAnswered = await QuestionSubmission.findOne({
            student_id: studentId,
            question_id: question.id
        });

        return res.status(200).json({
            status: "success",
            data: {
                id: question.id,
                question_date: question.question_date,
                question: question.question,
                option_a: question.option_a,
                option_b: question.option_b,
                option_c: question.option_c,
                option_d: question.option_d,
                difficulty: question.difficulty,
                question_type: question.question_type,
                topic_id: question.topic_id,
                alreadyAnswered: !!alreadyAnswered
            }
        });

    } catch (error) {

        return res.status(500).json({
            status: "fail",
            message: error.message
        });

    }
};


// ==========================================
// SUBMIT QUESTION OF THE DAY
// ==========================================

exports.submitQuestionOfTheDay = async (req, res) => {

    try {

        // Student ID from JWT
        const studentId = req.user.student_id;

        const { question_id, selected_option } = req.body;

        // Validate Request
        if (!question_id || !selected_option) {

            return res.status(400).json({
                status: "fail",
                message: "question_id and selected_option are required."
            });

        }

        // Validate Option
        if (!["A", "B", "C", "D"].includes(selected_option)) {

            return res.status(400).json({
                status: "fail",
                message: "selected_option must be A, B, C or D."
            });

        }

        // A streak-eligible submission must be for the question scheduled today.
        const question = await qodStreakService.findTodaysQuestion();

        if (!question || Number(question.id) !== Number(question_id)) {

            return res.status(404).json({
                status: "fail",
                message: "Today's Question of the Day was not found for the supplied question_id."
            });

        }

        // Check Duplicate Submission
        const existingSubmission = await QuestionSubmission.findOne({
            student_id: studentId,
            question_id: question_id
        });

        if (existingSubmission) {

            return res.status(409).json({
                status: "fail",
                message: "You have already answered today's question."
            });

        }

        // Check Correct Answer
        const isCorrect =
            selected_option === question.correct_answer;

        // Save Submission
        await QuestionSubmission.create({

            student_id: studentId,

            question_id: question.id,

            selected_option,

            is_correct: isCorrect,

            qod_date_key: qodStreakService.dateKey(question.question_date)

        });

        const streak = await qodStreakService.getStudentStreak(studentId);

        return res.status(201).json({

            status: "success",

            message: "Answer submitted successfully.",

            data: {

                question_id: question.id,

                selected_option,

                correct_answer: question.correct_answer,

                is_correct: isCorrect,

                explanation: question.explanation,

                streak

            }

        });

    } catch (error) {

        if (error.code === 11000) {
            return res.status(409).json({
                status: "fail",
                message: "You have already answered today's question."
            });
        }

        return res.status(500).json({

            status: "fail",

            message: error.message

        });

    }

};
