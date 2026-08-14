const Topic = require("../../model/neet-models/topic");
const Question = require("../../model/neet-models/questions");
const TestSession = require("../../model/neet-models/testSession");
const { SUBJECT_ENUM } = require("../../constants/enum");
const mongoose = require("mongoose");

exports.getSubjects = async (req, res) => {
    try {
        const storedSubjects = await Topic.distinct("subject", { is_active: { $ne: false } });

        // Return only enum values, using the enum's canonical capitalization.
        const subjects = SUBJECT_ENUM.filter(subject =>
            storedSubjects.some(storedSubject =>
                storedSubject.toLowerCase() === subject.toLowerCase()
            )
        );

        return res.status(200).json({
            success: true,
            total: subjects.length,
            data: subjects
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

exports.getChapters = async (req, res) => {

    try {

        const { subjects } = req.body;
        if (!subjects || subjects.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please select subject."
            });
         }
         const chapters = await Topic.aggregate([
            {
                $match: {
                    is_active: { $ne: false },
                    subject: {
                        $in: subjects
                    }
                }
            },

            {
                $group: {
                    _id: "$chapter"
                }
            },

            {
                $project: {
                    _id: 0,
                    chapter: "$_id"
                }
            },

            {
                $sort: {
                    chapter: 1
                }
            }

        ]);

        return res.status(200).json({

            success: true,

            total: chapters.length,

            data: chapters

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

exports.getTopics = async (req, res) => {

    try {

        const {

            subjects,

            chapters

        } = req.body;

        const topics = await Topic.find({

            is_active: { $ne: false },

            subject: {

                $in: subjects

            },

            chapter: {

                $in: chapters

            }

        }).sort({

            name: 1

        });

        return res.status(200).json({

            success: true,

            total: topics.length,

            data: topics

        });

    }

    catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

exports.startQuickTest = async (req, res) => {
    try {
        const {
            subjects = [],
            chapters = [],
            questionCount = 180,
            duration = 180,
            title: customTitle,
            level: customLevel
        } = req.body;

        const topicQuery = { is_active: { $ne: false } };
        if (Array.isArray(subjects) && subjects.length > 0) {
            topicQuery.subject = { $in: subjects };
        }
        if (Array.isArray(chapters) && chapters.length > 0) {
            topicQuery.chapter = { $in: chapters };
        }

        const topics = await Topic.find(topicQuery).lean();
        const topicIds = topics.map(topic => topic.id);

        const targetTotal = Number(questionCount) || 180;
        let selectedQuestions = [];

        if (Array.isArray(subjects) && subjects.length > 0) {
            const perSubjectQuota = Math.max(1, Math.floor(targetTotal / subjects.length));
            for (const subjectName of subjects) {
                const subjectTopicIds = topics.filter(t => t.subject === subjectName).map(t => t.id);
                if (subjectTopicIds.length === 0) continue;

                const subjectQuestions = await Question.aggregate([
                    {
                        $match: {
                            is_active: { $ne: false },
                            topic_id: { $in: subjectTopicIds }
                        }
                    },
                    { $sample: { size: perSubjectQuota } }
                ]);
                selectedQuestions.push(...subjectQuestions);
            }
        }

        if (selectedQuestions.length < targetTotal) {
            const existingIds = new Set(selectedQuestions.map(q => q.id));
            const needed = targetTotal - selectedQuestions.length;
            const extraMatch = { is_active: { $ne: false } };
            if (topicIds.length > 0) {
                extraMatch.topic_id = { $in: topicIds };
            }
            if (existingIds.size > 0) {
                extraMatch.id = { $nin: Array.from(existingIds) };
            }

            const extraQuestions = await Question.aggregate([
                { $match: extraMatch },
                { $sample: { size: needed } }
            ]);
            selectedQuestions.push(...extraQuestions);
        }

        const totalQuestions = selectedQuestions.length;
        const totalMarks = totalQuestions * 4;

        const firstChapter = chapters && chapters.length > 0 ? chapters[0] : (subjects && subjects.length > 0 ? subjects[0] : "General Practice");
        const extraCount = chapters && chapters.length > 1 ? chapters.length - 1 : 0;
        const testCode = Math.floor(100 + Math.random() * 900);
        const title = customTitle || (extraCount > 0 ? `${firstChapter} & ${extraCount} more #${testCode}` : `${firstChapter} #${testCode}`);
        const subtitle = subjects && subjects.length > 1 ? `${subjects.join(" & ")} Practice` : (subjects && subjects[0] ? `${subjects[0]} Chapter Practice` : "Full Mock Practice");

        const validLevels = ["Beginner", "Intermediate", "Advanced"];
        let level = customLevel && validLevels.includes(customLevel) ? customLevel : "Intermediate";
        if (!customLevel) {
            if (chapters.length <= 2 || totalQuestions <= 30) level = "Beginner";
            else if (chapters.length >= 6 || totalQuestions >= 120) level = "Advanced";
        }

        const formattedQuestions = selectedQuestions.map(question => {
            const { _id, correct_answer, explanation, ...rest } = question;
            return rest;
        });

        const session = await TestSession.create({
            student_id: req.user.student_id,
            subjects: subjects || [],
            chapters: chapters || [],
            topic_ids: topicIds,
            duration: Number(duration) || 180,
            total_questions: totalQuestions,
            total_marks: totalMarks,
            question_ids: selectedQuestions.map(question => question.id),
            test_type: "Custom Test",
            title,
            subtitle,
            level,
            status: "Started",
            started_at: new Date()
        });

        return res.status(200).json({
            success: true,
            sessionId: session._id,
            duration: session.duration,
            totalQuestions,
            totalMarks,
            title,
            subtitle,
            level,
            data: formattedQuestions
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.startCustomTest = exports.startQuickTest;


exports.submitTest = async (req, res) => {

    try {

        const { sessionId, answers } = req.body;

        if (!sessionId || !Array.isArray(answers) || answers.length === 0) {

            return res.status(400).json({

                success: false,

                message: "sessionId and at least one answer are required."

            });

        }

        const session = await TestSession.findOne({

            _id: sessionId,

            student_id: req.user.student_id

        });

        if (!session) {

            return res.status(404).json({

                success: false,

                message: "Test session not found."

            });

        }

        if (session.status === "Completed") {

            return res.status(409).json({

                success: false,

                message: "This test session has already been submitted."

            });

        }

        const sessionQuestionIds = new Set(session.question_ids);
        const submittedQuestionIds = new Set();

        for (const item of answers) {
            const questionId = Number(item.question_id);
            const selectedOption = item.selected_option || "";

            if (!Number.isInteger(questionId) || !sessionQuestionIds.has(questionId)) {
                return res.status(400).json({
                    success: false,
                    message: `Question ${item.question_id} does not belong to this test session.`
                });
            }
            if (submittedQuestionIds.has(questionId)) {
                return res.status(400).json({
                    success: false,
                    message: `Question ${questionId} was submitted more than once.`
                });
            }
            if (!["", "A", "B", "C", "D"].includes(selectedOption)) {
                return res.status(400).json({
                    success: false,
                    message: `selected_option for question ${questionId} must be A, B, C, D, or empty.`
                });
            }
            submittedQuestionIds.add(questionId);
        }

        let score = 0;

        let correct = 0;

        let wrong = 0;

        let skipped = 0;

        const review = [];

        const submittedAnswers = [];

        for (const item of answers) {

            const question = await Question.findOne({

                id: item.question_id

            });

            if (!question) {

                return res.status(404).json({

                    success: false,

                    message: `Question with id ${item.question_id} was not found.`

                });

            }

            const selectedOption = item.selected_option || "";

            const isCorrect = selectedOption === question.correct_answer;

            const marksAwarded = !selectedOption ? 0 : (isCorrect ? 4 : -1);

            if (!selectedOption) {

                skipped++;

            } else if (isCorrect) {

                score += 4;

                correct++;

            } else {

                score -= 1;

                wrong++;

            }

            review.push({

                question_id: question.id,

                selected: selectedOption,

                correct_answer: question.correct_answer,

                isCorrect

            });

            submittedAnswers.push({

                question_id: question.id,

                selected_option: selectedOption,

                is_correct: isCorrect,

                marks_awarded: marksAwarded,

                time_spent: Math.max(Number(item.time_spent) || 0, 0)

            });

        }

        // Questions omitted from the payload are also treated as skipped.
        skipped = Math.max(session.total_questions - correct - wrong, skipped);

        const accuracy = Number(

            ((correct / session.total_questions) * 100).toFixed(2)

        );

        await TestSession.findByIdAndUpdate(sessionId, {

            answers: submittedAnswers,

            score,

            correct,

            wrong,

            skipped,

            accuracy,

            submitted_at: new Date(),

            status: "Completed"

        });

        return res.status(200).json({

            success: true,

            score,

            correct,

            wrong,

            skipped,

            accuracy,

            review

        });

    }

    catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

exports.getTestHistory = async (req, res) => {
    try {
        const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100);
        const filter = { student_id: req.user.student_id };

        if (req.query.status) {
            if (!["Started", "Completed", "Expired"].includes(req.query.status)) {
                return res.status(400).json({ success: false, message: "status must be Started, Completed, or Expired." });
            }
            filter.status = req.query.status;
        }
        if (req.query.test_type) {
            if (!["Quick Test", "Previous Year"].includes(req.query.test_type)) {
                return res.status(400).json({ success: false, message: "test_type must be Quick Test or Previous Year." });
            }
            filter.test_type = req.query.test_type;
        }

        const [sessions, total] = await Promise.all([
            TestSession.find(filter)
                .select("-answers -question_ids -topic_ids -__v")
                .sort({ started_at: -1, createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            TestSession.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data: sessions
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getTestSession = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.sessionId)) {
            return res.status(400).json({ success: false, message: "Invalid sessionId." });
        }
        const session = await TestSession.findOne({
            _id: req.params.sessionId,
            student_id: req.user.student_id
        }).lean();
        if (!session) return res.status(404).json({ success: false, message: "Test session not found." });

        const questions = await Question.find({ id: { $in: session.question_ids } })
            .select("-_id -correct_answer -explanation -createdAt -updatedAt -__v")
            .lean();
        const questionById = new Map(questions.map(question => [question.id, question]));
        const orderedQuestions = session.question_ids.map(id => questionById.get(id)).filter(Boolean);
        const { answers, question_ids, __v, ...sessionData } = session;

        return res.status(200).json({
            success: true,
            data: { ...sessionData, questions: orderedQuestions }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getTestResult = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.sessionId)) {
            return res.status(400).json({ success: false, message: "Invalid sessionId." });
        }
        const session = await TestSession.findOne({
            _id: req.params.sessionId,
            student_id: req.user.student_id
        }).lean();
        if (!session) return res.status(404).json({ success: false, message: "Test session not found." });
        if (session.status !== "Completed") {
            return res.status(409).json({ success: false, message: "Test result is available only after the session is completed." });
        }

        const questions = await Question.find({ id: { $in: session.question_ids } })
            .select("-_id id question option_a option_b option_c option_d correct_answer explanation difficulty question_type topic_id")
            .lean();
        const questionById = new Map(questions.map(question => [question.id, question]));
        const answerById = new Map(session.answers.map(answer => [answer.question_id, answer]));
        const review = session.question_ids.map(questionId => {
            const question = questionById.get(questionId);
            const answer = answerById.get(questionId);
            return {
                ...question,
                selected_option: answer?.selected_option || "",
                is_correct: answer?.is_correct || false,
                marks_awarded: answer?.marks_awarded || 0,
                time_spent: answer?.time_spent || 0,
                is_skipped: !answer?.selected_option
            };
        }).filter(item => item.id !== undefined);

        return res.status(200).json({
            success: true,
            data: {
                sessionId: session._id,
                test_type: session.test_type,
                previous_year_paper_id: session.previous_year_paper_id,
                status: session.status,
                score: session.score,
                correct: session.correct,
                wrong: session.wrong,
                skipped: session.skipped,
                accuracy: session.accuracy,
                total_questions: session.total_questions,
                duration: session.duration,
                started_at: session.started_at,
                submitted_at: session.submitted_at,
                total_time_spent: session.answers.reduce((sum, answer) => sum + (answer.time_spent || 0), 0),
                review
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
