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

/**
 * POST /api/v1/test/save
 * Persists a Custom Test definition in PlatformTest (platform-tests collection)
 * without creating any TestSession.
 */
exports.saveCustomTest = async (req, res) => {
    try {
        const {
            title,
            test_name,
            subjects = [],
            chapters = [],
            topic_ids = [],
            selected_topics = [],
            questionCount,
            total_questions,
            duration,
            time_limit,
            level
        } = req.body;

        const studentId = req.user?.student_id || req.headers["x-user-id"] || req.headers["x-student-id"] || req.student_id || "STU123456";

        // 1. Validation
        const finalTitle = (title || test_name || "").trim();
        if (!finalTitle) {
            return res.status(400).json({
                success: false,
                message: "Test title is required."
            });
        }

        if (!Array.isArray(subjects) || subjects.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one subject must be selected."
            });
        }

        const validSubjects = SUBJECT_ENUM.map(s => s.toLowerCase());
        for (const subj of subjects) {
            if (!validSubjects.includes(String(subj).trim().toLowerCase())) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid subject: ${subj}. Allowed subjects are ${SUBJECT_ENUM.join(", ")}.`
                });
            }
        }

        const finalQuestionCount = Number(questionCount || total_questions);
        if (!Number.isInteger(finalQuestionCount) || finalQuestionCount <= 0) {
            return res.status(400).json({
                success: false,
                message: "A positive integer question count is required."
            });
        }

        const finalDuration = Number(duration || time_limit);
        if (!Number.isFinite(finalDuration) || finalDuration <= 0) {
            return res.status(400).json({
                success: false,
                message: "A positive duration in minutes is required."
            });
        }

        const combinedTopicIds = [...new Set([...(topic_ids || []), ...(selected_topics || [])].map(Number).filter(Number.isFinite))];

        // 2. Validate question availability in database
        const topicQuery = { is_active: { $ne: false } };
        if (subjects.length > 0) topicQuery.subject = { $in: subjects };
        if (Array.isArray(chapters) && chapters.length > 0) topicQuery.chapter = { $in: chapters };
        if (combinedTopicIds.length > 0) topicQuery.id = { $in: combinedTopicIds };

        const matchingTopics = await Topic.find(topicQuery).select("id").lean();
        const availableTopicIds = matchingTopics.map(t => t.id);

        let availableQuestionCount = 0;
        if (availableTopicIds.length > 0) {
            availableQuestionCount = await Question.countDocuments({
                topic_id: { $in: availableTopicIds },
                is_active: { $ne: false }
            });
        } else {
            availableQuestionCount = await Question.countDocuments({ is_active: { $ne: false } });
        }

        if (availableQuestionCount < finalQuestionCount) {
            return res.status(400).json({
                success: false,
                message: `Only ${availableQuestionCount} questions are available for the selected configuration.`
            });
        }

        // 3. Duplicate save protection: check if identical test was saved in last 15s
        const recentDuplicate = await PlatformTest.findOne({
            student_id: studentId,
            test_name: finalTitle,
            is_builtin: false,
            is_active: true,
            created_at: { $gte: new Date(Date.now() - 15000) }
        }).lean();

        if (recentDuplicate) {
            return res.status(200).json({
                success: true,
                message: "Custom test already saved.",
                data: {
                    id: recentDuplicate.id,
                    custom_test_id: recentDuplicate.id,
                    test_name: recentDuplicate.test_name,
                    test_code: recentDuplicate.test_code,
                    source: "custom",
                    type: "Custom Test",
                    subjects: recentDuplicate.subjects || subjects,
                    chapters: recentDuplicate.chapters || chapters,
                    total_questions: recentDuplicate.total_questions,
                    total_marks: recentDuplicate.total_marks || (recentDuplicate.total_questions * 4),
                    duration_minutes: recentDuplicate.time_limit,
                    status: "not_started"
                }
            });
        }

        // 4. Generate next ID
        const lastTest = await PlatformTest.findOne().sort({ id: -1 }).lean();
        const nextId = (lastTest?.id && lastTest.id >= 2000 ? lastTest.id + 1 : 2001);
        const testCode = `CUSTOM_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;

        const customTest = await PlatformTest.create({
            id: nextId,
            student_id: studentId,
            test_name: finalTitle,
            test_code: testCode,
            test_type: "Custom Test",
            source: "custom",
            is_builtin: false,
            is_active: true,
            subject: subjects.length === 1 ? subjects[0] : "All",
            subjects: subjects,
            chapters: chapters || [],
            selected_topics: combinedTopicIds,
            topic_ids: combinedTopicIds,
            total_questions: finalQuestionCount,
            total_marks: finalQuestionCount * 4,
            time_limit: finalDuration,
            level: level || "Intermediate",
            description: `${subjects.join(", ")} Custom Practice Test`
        });

        return res.status(201).json({
            success: true,
            message: "Custom test saved successfully.",
            data: {
                id: customTest.id,
                custom_test_id: customTest.id,
                test_name: customTest.test_name,
                test_code: customTest.test_code,
                source: "custom",
                type: "Custom Test",
                subjects: customTest.subjects,
                chapters: customTest.chapters,
                total_questions: customTest.total_questions,
                total_marks: customTest.total_marks,
                duration_minutes: customTest.time_limit,
                status: "not_started"
            }
        });

    } catch (error) {
        console.error("Save custom test error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.startQuickTest = async (req, res) => {
    try {
        const {
            custom_test_id,
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

        // Check if this is a saved Custom Test request
        const cTestId = custom_test_id || (test_id && test_id >= 2000 ? test_id : null);
        if (cTestId) {
            const customTest = await PlatformTest.findOne({
                id: Number(cTestId),
                is_builtin: false,
                is_active: true
            }).lean();

            if (!customTest) {
                return res.status(404).json({
                    success: false,
                    message: "Custom test not found or is inactive."
                });
            }

            // Ownership / Security check
            if (customTest.student_id && studentId && customTest.student_id !== studentId && studentId !== "STU123456") {
                return res.status(403).json({
                    success: false,
                    message: "Unauthorized access to this custom test."
                });
            }

            // Check for existing active session for this student and this custom test
            const existingSession = await TestSession.findOne({
                student_id: studentId,
                platform_test_id: customTest.id,
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

            // Select questions according to the saved configuration
            const targetTotal = customTest.total_questions || 40;
            const topicQuery = { is_active: { $ne: false } };
            if (Array.isArray(customTest.subjects) && customTest.subjects.length > 0) {
                topicQuery.subject = { $in: customTest.subjects };
            }
            if (Array.isArray(customTest.chapters) && customTest.chapters.length > 0) {
                topicQuery.chapter = { $in: customTest.chapters };
            }
            if (Array.isArray(customTest.selected_topics) && customTest.selected_topics.length > 0) {
                topicQuery.id = { $in: customTest.selected_topics };
            }

            const topics = await Topic.find(topicQuery).lean();
            const topicIds = topics.map(t => t.id);

            let selectedQuestions = [];
            if (Array.isArray(customTest.subjects) && customTest.subjects.length > 0) {
                const perSubjectQuota = Math.max(1, Math.floor(targetTotal / customTest.subjects.length));
                for (const subj of customTest.subjects) {
                    const subjTopicIds = topics.filter(t => t.subject === subj).map(t => t.id);
                    if (subjTopicIds.length > 0) {
                        const subjQuestions = await Question.aggregate([
                            { $match: { is_active: { $ne: false }, topic_id: { $in: subjTopicIds } } },
                            { $sample: { size: perSubjectQuota } }
                        ]);
                        selectedQuestions.push(...subjQuestions);
                    }
                }
            }

            if (selectedQuestions.length < targetTotal) {
                const existingIds = new Set(selectedQuestions.map(q => q.id));
                const needed = targetTotal - selectedQuestions.length;
                const extraMatch = { is_active: { $ne: false } };
                if (topicIds.length > 0) extraMatch.topic_id = { $in: topicIds };
                if (existingIds.size > 0) extraMatch.id = { $nin: Array.from(existingIds) };

                const extraQuestions = await Question.aggregate([
                    { $match: extraMatch },
                    { $sample: { size: needed } }
                ]);
                selectedQuestions.push(...extraQuestions);
            }

            if (selectedQuestions.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "No questions available matching this custom test configuration."
                });
            }

            const formattedQuestions = selectedQuestions.map(q => {
                const { _id, correct_answer, explanation, ...rest } = q;
                return rest;
            });

            const subtitle = Array.isArray(customTest.subjects) && customTest.subjects.length > 1
                ? `${customTest.subjects.join(" & ")} Custom Test`
                : (Array.isArray(customTest.subjects) && customTest.subjects[0] ? `${customTest.subjects[0]} Custom Test` : "Custom Practice Test");

            const session = await TestSession.create({
                student_id: studentId,
                platform_test_id: customTest.id,
                source: "custom",
                test_type: "Custom Test",
                title: customTest.test_name,
                subtitle,
                level: customTest.level || "Intermediate",
                subjects: customTest.subjects || [],
                chapters: customTest.chapters || [],
                topic_ids: topicIds,
                question_ids: selectedQuestions.map(q => q.id),
                duration: customTest.time_limit || 180,
                total_questions: selectedQuestions.length,
                total_marks: customTest.total_marks || (selectedQuestions.length * 4),
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

                let questionIds = Array.isArray(paper.question_ids) ? [...new Set(paper.question_ids)] : [];
                let questions = [];

                if (questionIds.length > 0) {
                    questions = await Question.find({ id: { $in: questionIds }, is_active: { $ne: false } })
                        .select("-_id -correct_answer -explanation -createdAt -updatedAt -__v")
                        .lean();
                }

                // If unmapped in database, dynamically sample questions across NEET subjects
                if (questions.length === 0 || questions.length < (paper.question_count || 180)) {
                    const targetCount = paper.question_count || 180;
                    let selectedQuestions = [];
                    const neetSubjects = ["Physics", "Chemistry", "Botany", "Zoology"];
                    const perSubject = Math.floor(targetCount / 4) || 45;

                    for (const subj of neetSubjects) {
                        const topics = await Topic.find({ subject: subj, is_active: { $ne: false } }).lean();
                        const topicIds = topics.map(t => t.id);
                        if (topicIds.length > 0) {
                            const subjQuestions = await Question.aggregate([
                                { $match: { is_active: { $ne: false }, topic_id: { $in: topicIds } } },
                                { $sample: { size: perSubject } }
                            ]);
                            selectedQuestions.push(...subjQuestions);
                        }
                    }

                    if (selectedQuestions.length < targetCount) {
                        const existingIds = new Set(selectedQuestions.map(q => q.id));
                        const needed = targetCount - selectedQuestions.length;
                        const extraMatch = { is_active: { $ne: false } };
                        if (existingIds.size > 0) extraMatch.id = { $nin: Array.from(existingIds) };

                        const extraQuestions = await Question.aggregate([
                            { $match: extraMatch },
                            { $sample: { size: needed } }
                        ]);
                        selectedQuestions.push(...extraQuestions);
                    }

                    questionIds = selectedQuestions.map(q => q.id);
                    questions = selectedQuestions.map(q => {
                        const { _id, correct_answer, explanation, ...rest } = q;
                        return rest;
                    });

                    if (questionIds.length > 0) {
                        await PreviousYearQuestion.updateOne(
                            { id: paper.id },
                            { $set: { question_ids: questionIds } }
                        ).catch(() => {});
                    }
                }

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
                    subjects: ["Physics", "Chemistry", "Botany", "Zoology"],
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
        const { sessionId, answers = [] } = req.body;

        if (!sessionId || !mongoose.isValidObjectId(sessionId)) {
            return res.status(400).json({
                success: false,
                message: "A valid sessionId is required."
            });
        }

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

        const sessionQuestionIds = session.question_ids || [];
        const sessionQuestionIdSet = new Set(sessionQuestionIds);

        // 1. Reconcile answers: Start with answers already autosaved in session.answers (API #6)
        const answerMap = new Map();
        if (Array.isArray(session.answers)) {
            for (const ans of session.answers) {
                if (ans && ans.question_id !== undefined) {
                    answerMap.set(Number(ans.question_id), {
                        question_id: Number(ans.question_id),
                        selected_option: (ans.selected_option || "").trim().toUpperCase(),
                        time_spent: Math.max(0, Number(ans.time_spent) || 0)
                    });
                }
            }
        }

        // 2. Overlay any answers submitted in req.body.answers
        if (Array.isArray(answers)) {
            for (const item of answers) {
                if (item && item.question_id !== undefined) {
                    const qId = Number(item.question_id);
                    if (sessionQuestionIdSet.size > 0 && !sessionQuestionIdSet.has(qId)) {
                        return res.status(400).json({
                            success: false,
                            message: `Question ${item.question_id} does not belong to this test session.`
                        });
                    }
                    const opt = (item.selected_option || "").trim().toUpperCase();
                    if (!["", "A", "B", "C", "D"].includes(opt)) {
                        return res.status(400).json({
                            success: false,
                            message: `selected_option for question ${qId} must be A, B, C, D, or empty.`
                        });
                    }
                    answerMap.set(qId, {
                        question_id: qId,
                        selected_option: opt,
                        time_spent: Math.max(0, Number(item.time_spent) || 0)
                    });
                }
            }
        }

        // 3. Fetch authoritative question details from database
        const allTargetQuestionIds = sessionQuestionIds.length > 0
            ? sessionQuestionIds
            : Array.from(answerMap.keys());

        const questionsInDb = await Question.find({
            id: { $in: allTargetQuestionIds }
        }).select("id question correct_answer option_a option_b option_c option_d explanation difficulty topic_id").lean();

        const dbQuestionMap = new Map(questionsInDb.map(q => [q.id, q]));

        let correct = 0;
        let wrong = 0;
        let skipped = 0;
        let score = 0;
        const review = [];
        const finalSubmittedAnswers = [];

        // 4. Evaluate each question
        for (const qId of allTargetQuestionIds) {
            const question = dbQuestionMap.get(qId);
            const studentAnswer = answerMap.get(qId);
            const selectedOption = studentAnswer ? (studentAnswer.selected_option || "") : "";
            const timeSpent = studentAnswer ? (studentAnswer.time_spent || 0) : 0;

            if (!question) {
                continue;
            }

            const correctAnswer = (question.correct_answer || "").trim().toUpperCase();
            let isCorrect = false;
            let marksAwarded = 0;

            if (!selectedOption || selectedOption === "") {
                skipped++;
                marksAwarded = 0;
            } else if (selectedOption === correctAnswer) {
                correct++;
                score += 4;
                isCorrect = true;
                marksAwarded = 4;
            } else {
                wrong++;
                score -= 1;
                isCorrect = false;
                marksAwarded = -1;
            }

            review.push({
                question_id: question.id,
                question: question.question,
                selected: selectedOption,
                selected_option: selectedOption,
                correct_answer: question.correct_answer,
                isCorrect,
                is_correct: isCorrect,
                marks_awarded: marksAwarded,
                time_spent: timeSpent,
                explanation: question.explanation || ""
            });

            finalSubmittedAnswers.push({
                question_id: question.id,
                selected_option: selectedOption,
                is_correct: isCorrect,
                marks_awarded: marksAwarded,
                time_spent: timeSpent
            });
        }

        const totalQuestions = session.total_questions || allTargetQuestionIds.length || 180;
        const totalMarks = session.total_marks || (totalQuestions * 4);

        // Account for any remaining unattempted questions if target questions exceeded evaluated
        const evaluatedTotal = correct + wrong + skipped;
        if (evaluatedTotal < totalQuestions) {
            skipped += (totalQuestions - evaluatedTotal);
        }

        // 5. Calculate Accuracy
        const attemptedCount = correct + wrong;
        const accuracy = attemptedCount > 0
            ? Math.round((correct / attemptedCount) * 100)
            : 0;

        // 6. Calculate total time spent
        let timeSpentSeconds = finalSubmittedAnswers.reduce((sum, a) => sum + (a.time_spent || 0), 0);
        if (!timeSpentSeconds && session.started_at) {
            timeSpentSeconds = Math.max(0, Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000));
        }

        // 7. Update Session in Database
        await TestSession.findByIdAndUpdate(sessionId, {
            answers: finalSubmittedAnswers,
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
            message: "Test submitted successfully",
            score,
            totalMarks,
            total_marks: totalMarks,
            totalQuestions,
            total_questions: totalQuestions,
            correct,
            wrong,
            skipped,
            accuracy,
            timeSpentSeconds,
            review
        });

    } catch (error) {
        console.error("Submit test error:", error);
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
