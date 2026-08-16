const Topic = require("../../model/neet-models/topic");
const Question = require("../../model/neet-models/questions");
const TestSession = require("../../model/neet-models/testSession");
const PlatformTest = require("../../model/neet-models/platformTest");
const PreviousYearQuestion = require("../../model/neet-models/previousYearQuestion");
const learningReportService = require("../../services/learningReport.service");
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
            builtin_test_id,
            test_id,
            test_code,
            platform_test_id,
            previous_year_paper_id,
            paperId,
            subjects = [],
            chapters = [],
            questionCount = 180,
            duration = 180,
            title: customTitle,
            level: customLevel
        } = req.body;

        const studentId = req.user?.student_id || req.headers["x-user-id"] || req.headers["x-student-id"] || req.body?.student_id || "STU123456";

        // Check if this is a Previous Year Paper request
        const pyId = previous_year_paper_id || paperId;
        if (pyId) {
            const paper = await PreviousYearQuestion.findOne({ id: Number(pyId), is_active: true }).lean();
            if (paper) {
                const existingSession = await TestSession.findOne({
                    student_id: studentId,
                    previous_year_paper_id: paper.id,
                    status: "Started"
                }).lean();

                if (existingSession) {
                    const questions = await Question.find({ id: { $in: existingSession.question_ids } })
                        .select("-_id -correct_answer -explanation -createdAt -updatedAt -__v")
                        .lean();
                    const questionById = new Map(questions.map(q => [q.id, q]));
                    const orderedQuestions = existingSession.question_ids.map(id => questionById.get(id)).filter(Boolean);

                    return res.status(200).json({
                        success: true,
                        reused: true,
                        sessionId: existingSession._id,
                        duration: existingSession.duration,
                        totalQuestions: existingSession.total_questions,
                        totalMarks: existingSession.total_marks || (existingSession.total_questions * 4),
                        title: existingSession.title,
                        subtitle: existingSession.subtitle,
                        level: existingSession.level,
                        data: orderedQuestions
                    });
                }

                const questionIds = Array.isArray(paper.question_ids) ? [...new Set(paper.question_ids)] : [];
                const questions = await Question.find({ id: { $in: questionIds }, is_active: { $ne: false } })
                    .select("-_id -correct_answer -explanation -createdAt -updatedAt -__v")
                    .lean();
                const questionById = new Map(questions.map(q => [q.id, q]));
                const orderedQuestions = questionIds.map(id => questionById.get(id)).filter(Boolean);

                const session = await TestSession.create({
                    student_id: studentId,
                    previous_year_paper_id: paper.id,
                    source: "previous_year",
                    test_type: "Previous Year",
                    title: paper.name,
                    subtitle: "Previous Year Paper",
                    level: "Advanced",
                    subjects: [],
                    chapters: [],
                    topic_ids: [],
                    question_ids: questionIds,
                    total_questions: orderedQuestions.length || paper.question_count || 180,
                    total_marks: (orderedQuestions.length || paper.question_count || 180) * 4,
                    duration: Number(duration) || 180,
                    status: "Started",
                    started_at: new Date()
                });

                return res.status(200).json({
                    success: true,
                    sessionId: session._id,
                    duration: session.duration,
                    totalQuestions: session.total_questions,
                    totalMarks: session.total_marks,
                    title: session.title,
                    subtitle: session.subtitle,
                    level: session.level,
                    data: orderedQuestions
                });
            }
        }

        // Check if this is a Built-in Test request
        const builtinId = builtin_test_id || test_id || platform_test_id;
        let builtinTest = null;
        if (builtinId || test_code) {
            await learningReportService.ensureBuiltinTestsSeeded();
            const filter = { is_active: true };
            if (builtinId) {
                const numId = Number(builtinId);
                filter.$or = [
                    ...(Number.isInteger(numId) ? [{ id: numId }] : []),
                    ...(mongoose.isValidObjectId(builtinId) ? [{ _id: builtinId }] : [])
                ];
            } else if (test_code) {
                filter.test_code = String(test_code).trim();
            }
            builtinTest = await PlatformTest.findOne(filter).lean();
        }

        if (builtinTest) {
            // Check for existing active session for this student and this built-in test
            const existingSession = await TestSession.findOne({
                student_id: studentId,
                platform_test_id: builtinTest.id,
                status: "Started"
            }).lean();

            if (existingSession) {
                // Reuse existing active session without regenerating questions
                const questions = await Question.find({ id: { $in: existingSession.question_ids } })
                    .select("-_id -correct_answer -explanation -createdAt -updatedAt -__v")
                    .lean();
                const questionById = new Map(questions.map(q => [q.id, q]));
                const orderedQuestions = existingSession.question_ids.map(id => questionById.get(id)).filter(Boolean);

                return res.status(200).json({
                    success: true,
                    reused: true,
                    sessionId: existingSession._id,
                    duration: existingSession.duration,
                    totalQuestions: existingSession.total_questions,
                    totalMarks: existingSession.total_marks || (existingSession.total_questions * 4),
                    title: existingSession.title,
                    subtitle: existingSession.subtitle,
                    level: existingSession.level,
                    data: orderedQuestions
                });
            }

            // Generate 180 questions for the Built-in Test
            const targetTotal = builtinTest.total_questions || 180;
            let selectedQuestions = [];

            if (builtinTest.subject && builtinTest.subject !== "All") {
                // Single subject test: select 180 questions from this subject
                const topics = await Topic.find({ subject: builtinTest.subject, is_active: { $ne: false } }).lean();
                const topicIds = topics.map(t => t.id);

                selectedQuestions = await Question.aggregate([
                    { $match: { is_active: { $ne: false }, topic_id: { $in: topicIds } } },
                    { $sample: { size: targetTotal } }
                ]);
            } else {
                // Full NEET Test: 45 Physics, 45 Chemistry, 45 Botany, 45 Zoology (total 180)
                const neetSubjects = ["Physics", "Chemistry", "Botany", "Zoology"];
                for (const subj of neetSubjects) {
                    const topics = await Topic.find({ subject: subj, is_active: { $ne: false } }).lean();
                    const topicIds = topics.map(t => t.id);
                    if (topicIds.length > 0) {
                        const subjQuestions = await Question.aggregate([
                            { $match: { is_active: { $ne: false }, topic_id: { $in: topicIds } } },
                            { $sample: { size: 45 } }
                        ]);
                        selectedQuestions.push(...subjQuestions);
                    }
                }
            }

            // Fallback sample to ensure exact question count
            if (selectedQuestions.length < targetTotal) {
                const existingIds = new Set(selectedQuestions.map(q => q.id));
                const needed = targetTotal - selectedQuestions.length;
                const extraMatch = { is_active: { $ne: false } };
                if (existingIds.size > 0) extraMatch.id = { $nin: Array.from(existingIds) };

                const extraQuestions = await Question.aggregate([
                    { $match: extraMatch },
                    { $sample: { size: needed } }
                ]);
                selectedQuestions.push(...extraQuestions);
            }

            const formattedQuestions = selectedQuestions.map(q => {
                const { _id, correct_answer, explanation, ...rest } = q;
                return rest;
            });

            const session = await TestSession.create({
                student_id: studentId,
                platform_test_id: builtinTest.id,
                source: "builtin",
                subjects: builtinTest.subject && builtinTest.subject !== "All" ? [builtinTest.subject] : ["Physics", "Chemistry", "Botany", "Zoology"],
                chapters: [],
                topic_ids: [],
                question_ids: selectedQuestions.map(q => q.id),
                duration: builtinTest.time_limit || 180,
                total_questions: selectedQuestions.length,
                total_marks: builtinTest.total_marks || (selectedQuestions.length * 4),
                test_type: "Built-in Test",
                title: builtinTest.test_name,
                subtitle: builtinTest.description || "Full Mock Practice",
                level: "Intermediate",
                status: "Started",
                started_at: new Date()
            });

            return res.status(200).json({
                success: true,
                sessionId: session._id,
                duration: session.duration,
                totalQuestions: session.total_questions,
                totalMarks: session.total_marks,
                title: session.title,
                subtitle: session.subtitle,
                level: session.level,
                data: formattedQuestions
            });
        }

        // Custom / Quick Test generation flow
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
        const testCodeVal = Math.floor(100 + Math.random() * 900);
        const title = customTitle || (extraCount > 0 ? `${firstChapter} & ${extraCount} more #${testCodeVal}` : `${firstChapter} #${testCodeVal}`);
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
            student_id: studentId,
            subjects: subjects || [],
            chapters: chapters || [],
            topic_ids: topicIds,
            duration: Number(duration) || 180,
            total_questions: totalQuestions,
            total_marks: totalMarks,
            question_ids: selectedQuestions.map(question => question.id),
            test_type: "Custom Test",
            source: "custom",
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


exports.submitTest = async (req, res) => {

    try {

        const { sessionId, answers } = req.body;

        if (!sessionId || !Array.isArray(answers) || answers.length === 0) {

            return res.status(400).json({

                success: false,

                message: "sessionId and at least one answer are required."

            });

        }

        const studentId = req.user?.student_id || req.headers["x-user-id"] || req.headers["x-student-id"] || "STU123456";
        const session = await TestSession.findById(sessionId);

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

        let timeSpentSeconds = 0;
        for (const ans of submittedAnswers) {
            timeSpentSeconds += ans.time_spent || 0;
        }
        if (!timeSpentSeconds && session.started_at) {
            timeSpentSeconds = Math.max(0, Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000));
        }

        await TestSession.findByIdAndUpdate(sessionId, {
            answers: submittedAnswers,
            score,
            correct,
            wrong,
            skipped,
            accuracy,
            time_spent_seconds: timeSpentSeconds,
            submitted_at: new Date(),
            status: "Completed"
        });

        return res.status(200).json({
            success: true,
            score,
            total_marks: session.total_marks || (session.total_questions * 4),
            totalQuestions: session.total_questions,
            correct,
            wrong,
            skipped,
            accuracy,
            timeSpentSeconds,
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
        const studentId = req.user?.student_id || req.headers["x-user-id"] || req.headers["x-student-id"] || req.query.student_id || "STU123456";
        const filter = { $or: [{ student_id: studentId }, { student_id: "STU123456" }, { student_id: null }] };

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
        const session = await TestSession.findById(req.params.sessionId).lean();
        if (!session) return res.status(404).json({ success: false, message: "Test session not found." });

        const questions = await Question.find({ id: { $in: session.question_ids || [] } })
            .select("-_id -correct_answer -explanation -createdAt -updatedAt -__v")
            .lean();
        const questionById = new Map(questions.map(question => [question.id, question]));
        const orderedQuestions = (session.question_ids || []).map(id => questionById.get(id)).filter(Boolean);

        const answeredCount = Array.isArray(session.answers) ? session.answers.length : 0;
        const totalQuestions = session.total_questions || orderedQuestions.length || 180;
        const progress = session.status === "Completed" ? 100 : Math.min(Math.round((answeredCount / totalQuestions) * 100), 99);

        let timeSpentSeconds = session.time_spent_seconds || 0;
        if (!timeSpentSeconds && Array.isArray(session.answers)) {
            timeSpentSeconds = session.answers.reduce((acc, a) => acc + (a.time_spent || 0), 0);
        }
        if (!timeSpentSeconds && session.started_at) {
            timeSpentSeconds = Math.max(0, Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000));
        }

        const totalDurationSeconds = (session.duration || 180) * 60;
        const remainingTimeSeconds = Math.max(0, totalDurationSeconds - timeSpentSeconds);

        const { answers, question_ids, __v, ...sessionData } = session;

        return res.status(200).json({
            success: true,
            data: {
                ...sessionData,
                answers: answers || [],
                progress,
                time_spent_seconds: timeSpentSeconds,
                remaining_time_seconds: remainingTimeSeconds,
                questions: orderedQuestions
            }
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
        const session = await TestSession.findById(req.params.sessionId).lean();
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

/**
 * PATCH /api/v1/test/sessions/:sessionId
 * Autosaves, updates, or clears a single question answer for an active test session.
 */
exports.updateSessionAnswer = async (req, res) => {
    try {
        const { sessionId } = req.params;
        if (!mongoose.isValidObjectId(sessionId)) {
            return res.status(400).json({ success: false, message: "Invalid sessionId." });
        }

        const { question_id, selected_option, time_spent } = req.body;

        if (question_id === undefined || question_id === null || isNaN(Number(question_id))) {
            return res.status(400).json({ success: false, message: "A valid question_id is required." });
        }

        const qId = Number(question_id);

        let normalizedOption = "";
        if (selected_option !== undefined && selected_option !== null) {
            normalizedOption = String(selected_option).trim().toUpperCase();
        }

        if (!["A", "B", "C", "D", ""].includes(normalizedOption)) {
            return res.status(400).json({
                success: false,
                message: "selected_option must be A, B, C, D, or empty string/null to clear."
            });
        }

        const timeSpent = Math.max(0, Number(time_spent) || 0);

        const session = await TestSession.findById(sessionId);
        if (!session) {
            return res.status(404).json({ success: false, message: "Test session not found." });
        }

        // Verify session ownership if authenticated
        const authStudentId = req.user?.student_id;
        if (authStudentId && session.student_id && session.student_id !== authStudentId && session.student_id !== "STU123456") {
            return res.status(403).json({ success: false, message: "Unauthorized access to this test session." });
        }

        if (session.status === "Completed" || session.status === "Expired") {
            return res.status(409).json({
                success: false,
                message: "Cannot modify answers for a completed or expired test session."
            });
        }

        const sessionQuestionIds = session.question_ids || [];
        if (!sessionQuestionIds.includes(qId)) {
            return res.status(400).json({
                success: false,
                message: `Question ${qId} does not belong to this test session.`
            });
        }

        if (!Array.isArray(session.answers)) {
            session.answers = [];
        }

        const existingAnswerIndex = session.answers.findIndex(a => a.question_id === qId);

        if (existingAnswerIndex >= 0) {
            session.answers[existingAnswerIndex].selected_option = normalizedOption;
            session.answers[existingAnswerIndex].time_spent = timeSpent;
        } else {
            session.answers.push({
                question_id: qId,
                selected_option: normalizedOption,
                time_spent: timeSpent,
                is_correct: false,
                marks_awarded: 0
            });
        }

        // Recalculate session level metrics
        const answeredCount = session.answers.filter(a => a.selected_option && a.selected_option !== "").length;
        const totalQuestions = session.total_questions || sessionQuestionIds.length || 180;
        const progress = Math.min(Math.round((answeredCount / totalQuestions) * 100), 99);
        const totalTimeSpentSeconds = session.answers.reduce((sum, a) => sum + (a.time_spent || 0), 0);

        session.time_spent_seconds = totalTimeSpentSeconds;

        await session.save();

        return res.status(200).json({
            success: true,
            message: "Answer saved successfully",
            data: {
                sessionId: session._id,
                question_id: qId,
                selected_option: normalizedOption,
                time_spent: timeSpent,
                progress,
                answered_count: answeredCount,
                time_spent_seconds: totalTimeSpentSeconds
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
