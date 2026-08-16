"use strict";

const testSessionRepository = require("../../repositories/ucat-repositories/testSession.repository");
const UcatQuestion = require("../../model/ucat-model/ucatQuestion");
const UcatTopic = require("../../model/ucat-model/ucatTopic");

const sanitizeSessionResponse = (session) => {
    if (!session) return null;
    const doc = session.toObject ? session.toObject() : { ...session };
    delete doc.question_ids;
    return doc;
};

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

// --- STEP 1: GET SUBJECTS ---
const getSubjects = async () => {
    const CANONICAL = [
        "VERBAL_REASONING",
        "DECISION_MAKING",
        "QUANTITATIVE_REASONING",
        "ABSTRACT_REASONING",
        "SITUATIONAL_JUDGEMENT"
    ];
    return {
        success: true,
        total: CANONICAL.length,
        data: CANONICAL
    };
};

// --- STEP 2: GET CHAPTERS ---
const getChapters = async (payload = {}) => {
    const { subjects = [] } = payload;
    if (!subjects || subjects.length === 0) {
        const error = new Error("Please select subject.");
        error.statusCode = 400;
        throw error;
    }

    const regexes = subjects.map(
        (s) => new RegExp("^" + String(s).trim().toLowerCase().replace(/_/g, "[ _]?") + "$", "i")
    );

    const chapters = await UcatTopic.aggregate([
        { $match: { subject: { $in: regexes } } },
        { $group: { _id: "$chapter" } },
        { $match: { _id: { $ne: null } } },
        { $project: { _id: 0, chapter: "$_id" } },
        { $sort: { chapter: 1 } }
    ]);

    return {
        success: true,
        total: chapters.length,
        data: chapters
    };
};

// --- STEP 3: GET TOPICS ---
const getTopics = async (payload = {}) => {
    const { subjects = [], chapters = [] } = payload;
    const query = {};

    if (subjects.length > 0) {
        query.subject = {
            $in: subjects.map(
                (s) => new RegExp("^" + String(s).trim().toLowerCase().replace(/_/g, "[ _]?") + "$", "i")
            )
        };
    }
    if (chapters.length > 0) {
        query.chapter = {
            $in: chapters.map((c) => new RegExp(String(c).trim(), "i"))
        };
    }

    const topics = await UcatTopic.find(query).sort({ name: 1 }).lean();

    return {
        success: true,
        total: topics.length,
        data: topics
    };
};

// --- GET TEST OPTIONS ---
const getTestOptions = async () => {
    return {
        test_timings: [
            { value: 15, label: "15 Minutes" },
            { value: 30, label: "30 Minutes" },
            { value: 45, label: "45 Minutes" },
            { value: 60, label: "60 Minutes" },
            { value: 120, label: "120 Minutes (Full Exam)" }
        ],
        question_count_options: [
            { value: 5, label: "5 Questions" },
            { value: 10, label: "10 Questions" },
            { value: 15, label: "15 Questions" },
            { value: 20, label: "20 Questions" },
            { value: 25, label: "25 Questions" },
            { value: 30, label: "30 Questions" },
            { value: 50, label: "50 Questions" },
            { value: 180, label: "180 Questions" },
            { value: 233, label: "233 Questions (Full Exam - 932 Marks)" }
        ],
        test_types: [
            { code: "QUICK_TEST", name: "Quick Test" },
            { code: "CUSTOM_PRACTICE", name: "Custom Practice Test" },
            { code: "FULL_EXAM", name: "Full Exam (233 Questions, 120 Mins, 932 Marks)" },
            { code: "PREVIOUS_YEAR", name: "Previous Year Paper" }
        ],
        sections: [
            { code: "VERBAL_REASONING", name: "Verbal Reasoning", db_subject: "verbal_reasoning" },
            { code: "DECISION_MAKING", name: "Decision Making", db_subject: "decision_making" },
            { code: "QUANTITATIVE_REASONING", name: "Quantitative Reasoning", db_subject: "quantitative_reasoning" },
            { code: "ABSTRACT_REASONING", name: "Abstract Reasoning", db_subject: "abstract_reasoning" },
            { code: "SITUATIONAL_JUDGEMENT", name: "Situational Judgement", db_subject: "situational_judgement" }
        ],
        exam_config: {
            full_exam: {
                total_questions: 233,
                duration_minutes: 120,
                max_marks: 932,
                marking_scheme: {
                    correct: 4,
                    wrong: -1,
                    unattempted: 0
                }
            }
        }
    };
};

// --- 6 CANONICAL BUILT-IN TESTS SPECIFICATION ---
const UCAT_BUILTIN_TESTS_CONFIG = [
    {
        testId: "UCAT_FULL",
        test_id: "UCAT_FULL",
        testName: "UCAT Full Test",
        test_name: "UCAT Full Test",
        exam: "UCAT",
        source: "builtin",
        testType: "full_test",
        test_type: "Full Test",
        type: "Full Mock",
        level: "Advanced",
        totalQuestions: 233,
        total_questions: 233,
        durationMinutes: 120,
        duration_minutes: 120,
        maxMarks: 932,
        total_marks: 932,
        sections: [
            "verbal_reasoning",
            "decision_making",
            "quantitative_reasoning",
            "abstract_reasoning",
            "situational_judgement"
        ],
        isActive: true,
        is_active: true
    },
    {
        testId: "UCAT_VERBAL_REASONING",
        test_id: "UCAT_VERBAL_REASONING",
        testName: "Verbal Reasoning Test",
        test_name: "Verbal Reasoning Test",
        exam: "UCAT",
        source: "builtin",
        testType: "section_test",
        test_type: "Section Test",
        section: "verbal_reasoning",
        type: "Verbal Reasoning",
        level: "Intermediate",
        totalQuestions: 44,
        total_questions: 44,
        durationMinutes: 21,
        duration_minutes: 21,
        maxMarks: 176,
        total_marks: 176,
        sections: ["verbal_reasoning"],
        isActive: true,
        is_active: true
    },
    {
        testId: "UCAT_DECISION_MAKING",
        test_id: "UCAT_DECISION_MAKING",
        testName: "Decision Making Test",
        test_name: "Decision Making Test",
        exam: "UCAT",
        source: "builtin",
        testType: "section_test",
        test_type: "Section Test",
        section: "decision_making",
        type: "Decision Making",
        level: "Intermediate",
        totalQuestions: 29,
        total_questions: 29,
        durationMinutes: 31,
        duration_minutes: 31,
        maxMarks: 116,
        total_marks: 116,
        sections: ["decision_making"],
        isActive: true,
        is_active: true
    },
    {
        testId: "UCAT_QUANTITATIVE_REASONING",
        test_id: "UCAT_QUANTITATIVE_REASONING",
        testName: "Quantitative Reasoning Test",
        test_name: "Quantitative Reasoning Test",
        exam: "UCAT",
        source: "builtin",
        testType: "section_test",
        test_type: "Section Test",
        section: "quantitative_reasoning",
        type: "Quantitative Reasoning",
        level: "Intermediate",
        totalQuestions: 36,
        total_questions: 36,
        durationMinutes: 25,
        duration_minutes: 25,
        maxMarks: 144,
        total_marks: 144,
        sections: ["quantitative_reasoning"],
        isActive: true,
        is_active: true
    },
    {
        testId: "UCAT_ABSTRACT_REASONING",
        test_id: "UCAT_ABSTRACT_REASONING",
        testName: "Abstract Reasoning Test",
        test_name: "Abstract Reasoning Test",
        exam: "UCAT",
        source: "builtin",
        testType: "section_test",
        test_type: "Section Test",
        section: "abstract_reasoning",
        type: "Abstract Reasoning",
        level: "Intermediate",
        totalQuestions: 55,
        total_questions: 55,
        durationMinutes: 13,
        duration_minutes: 13,
        maxMarks: 220,
        total_marks: 220,
        sections: ["abstract_reasoning"],
        isActive: true,
        is_active: true
    },
    {
        testId: "UCAT_SITUATIONAL_JUDGEMENT",
        test_id: "UCAT_SITUATIONAL_JUDGEMENT",
        testName: "Situational Judgement Test",
        test_name: "Situational Judgement Test",
        exam: "UCAT",
        source: "builtin",
        testType: "section_test",
        test_type: "Section Test",
        section: "situational_judgement",
        type: "Situational Judgement",
        level: "Intermediate",
        totalQuestions: 69,
        total_questions: 69,
        durationMinutes: 26,
        duration_minutes: 26,
        maxMarks: 276,
        total_marks: 276,
        sections: ["situational_judgement"],
        isActive: true,
        is_active: true
    }
];

// --- GET BUILT-IN & PREVIOUS YEAR UCAT PAPERS ---
const getBuiltinTests = async () => {
    // 1. Built-in 6 canonical test definitions
    const builtins = UCAT_BUILTIN_TESTS_CONFIG.map(t => ({ ...t }));

    // 2. Discover available previous-year papers dynamically
    let previousYearPapers = [];
    try {
        const previousYearRepository = require("../../repositories/ucat-repositories/previousYear.repository");
        const papers = await previousYearRepository.listPapers();
        if (Array.isArray(papers) && papers.length > 0) {
            previousYearPapers = papers.map(p => {
                const yearVal = p.year || (p.name && p.name.match(/\d{4}/) ? parseInt(p.name.match(/\d{4}/)[0], 10) : 2021);
                const qCount = p.question_count || p.total_questions || 233;
                const durMin = p.duration || p.durationMinutes || 120;
                return {
                    id: p.id || p.paper_id || `UCAT_${yearVal}`,
                    testId: `UCAT_${yearVal}`,
                    test_id: `UCAT_${yearVal}`,
                    paperId: String(p.id || p.paper_id || p._id),
                    paper_id: String(p.id || p.paper_id || p._id),
                    testName: p.name || `UCAT ${yearVal}`,
                    test_name: p.name || `UCAT ${yearVal}`,
                    year: yearVal,
                    exam: "UCAT",
                    source: "previous_year",
                    testType: "official_paper",
                    test_type: "Official Paper",
                    type: "Official Paper",
                    level: "Advanced",
                    totalQuestions: qCount,
                    total_questions: qCount,
                    durationMinutes: durMin,
                    duration_minutes: durMin,
                    maxMarks: qCount * 4,
                    total_marks: qCount * 4,
                    isActive: p.is_active !== false,
                    is_active: p.is_active !== false
                };
            });
        }
    } catch (e) {
        previousYearPapers = [];
    }

    if (previousYearPapers.length === 0) {
        previousYearPapers = [
            {
                id: 2021,
                testId: "UCAT_2021",
                test_id: "UCAT_2021",
                testName: "UCAT 2021",
                test_name: "UCAT 2021",
                year: 2021,
                exam: "UCAT",
                source: "previous_year",
                testType: "official_paper",
                test_type: "Official Paper",
                type: "Official Paper",
                level: "Advanced",
                totalQuestions: 233,
                total_questions: 233,
                durationMinutes: 120,
                duration_minutes: 120,
                maxMarks: 932,
                total_marks: 932,
                isActive: true,
                is_active: true
            }
        ];
    }

    return [...builtins, ...previousYearPapers];
};

// --- STEP 4: START TEST SESSION ---
const startTest = async (user, payload = {}) => {
    const {
        student_id,
        testId,
        test_id,
        paperId,
        paper_id,
        subjects = [],
        chapters = [],
        topic_ids = [],
        sections = [],
        topics = [],
        questionCount,
        limit = 20,
        duration = 15
    } = payload;

    const studentId = student_id || (user && (user.student_id || user.studentId || user.userId)) || "STU123456";
    const rawTestId = testId || test_id || paperId || paper_id || (payload.test_type === "FULL_EXAM" || payload.test_type === "Full Exam" ? "UCAT_FULL" : null);

    // Look up in built-in definitions
    const builtinConfig = UCAT_BUILTIN_TESTS_CONFIG.find(
        t => t.testId === rawTestId || t.test_id === rawTestId || (rawTestId === "UCAT_2021" && t.testId === "UCAT_FULL")
    );

    const isFullExam = rawTestId === "UCAT_FULL" || rawTestId === "UCAT_2021" || payload.test_type === "FULL_EXAM" || payload.test_type === "Full Exam" || Number(questionCount) === 233 || Number(duration) === 120;
    const testIdentifier = rawTestId || (isFullExam ? "UCAT_FULL" : "UCAT_PRACTICE");

    // Active session check for same test: resume if unfinished, otherwise create fresh attempt
    if (testIdentifier) {
        const UcatTestSession = require("../../model/ucat-model/ucatTestSession");
        const existingSession = await UcatTestSession.findOne({
            $and: [
                {
                    $or: [
                        { student_id: studentId },
                        { userId: studentId },
                        { student_id: "STU123456" }
                    ]
                },
                {
                    $or: [
                        { test_id: testIdentifier },
                        { testId: testIdentifier },
                        { previous_year_paper_id: testIdentifier }
                    ]
                },
                {
                    status: { $in: ["In Progress", "Started"] }
                }
            ]
        }).sort({ started_at: -1 }).lean();

        if (existingSession) {
            const resumed = await getSessionResult(existingSession.sessionId || existingSession._id);
            resumed.reused = true;
            return resumed;
        }
    }

    let targetSubjects = [];
    let targetLimit = 20;
    let testDuration = 15;
    let testTitle = payload.title || "UCAT Practice Test";
    let testLevel = payload.level || "Intermediate";

    if (builtinConfig) {
        targetSubjects = builtinConfig.sections || [builtinConfig.section];
        targetLimit = builtinConfig.totalQuestions;
        testDuration = builtinConfig.durationMinutes;
        testTitle = builtinConfig.testName;
        testLevel = builtinConfig.level || "Intermediate";
    } else if (isFullExam) {
        targetSubjects = [
            "verbal_reasoning",
            "decision_making",
            "quantitative_reasoning",
            "abstract_reasoning",
            "situational_judgement"
        ];
        targetLimit = 233;
        testDuration = 120;
        testTitle = payload.title || (rawTestId && rawTestId.includes("2021") ? "UCAT 2021" : "UCAT Full Test");
        testLevel = "Advanced";
    } else {
        targetSubjects = subjects.length > 0 ? subjects : (sections.length > 0 ? sections : ["verbal_reasoning"]);
        targetLimit = Number(questionCount) || Number(limit) || 20;
        testDuration = Number(duration) || 15;
    }

    const targetTopics = topics.length > 0 ? topics : chapters;
    let rawQuestions = [];

    // Load questions based on test type
    if (builtinConfig && builtinConfig.testType === "full_test" || isFullExam) {
        const ucatSections = [
            "verbal_reasoning",
            "decision_making",
            "quantitative_reasoning",
            "abstract_reasoning",
            "situational_judgement"
        ];
        const sectionDistribution = {
            verbal_reasoning: 44,
            decision_making: 29,
            quantitative_reasoning: 36,
            abstract_reasoning: 55,
            situational_judgement: 69
        };

        for (const sec of ucatSections) {
            const secRegex = new RegExp("^" + sec.replace(/_/g, "[ _]?") + "$", "i");
            const quota = sectionDistribution[sec] || 46;
            const secQuestions = await UcatQuestion.find({ subject: secRegex })
                .select("-correct_answer -explanation")
                .limit(quota)
                .lean();
            rawQuestions.push(...secQuestions);
        }

        if (rawQuestions.length < targetLimit) {
            const existingIds = new Set(rawQuestions.map(q => q.id || q._id));
            const needed = targetLimit - rawQuestions.length;
            const extra = await UcatQuestion.find({ id: { $nin: Array.from(existingIds) } })
                .select("-correct_answer -explanation")
                .limit(needed)
                .lean();
            rawQuestions.push(...extra);
        }
    } else if (builtinConfig && builtinConfig.testType === "section_test") {
        // Load ONLY questions belonging to that specific section
        const sec = builtinConfig.section;
        const secRegex = new RegExp("^" + sec.replace(/_/g, "[ _]?") + "$", "i");
        rawQuestions = await UcatQuestion.find({ subject: secRegex })
            .select("-correct_answer -explanation")
            .limit(targetLimit)
            .lean();

        if (rawQuestions.length === 0) {
            rawQuestions = await UcatQuestion.find({})
                .select("-correct_answer -explanation")
                .limit(targetLimit)
                .lean();
        }
    } else {
        let query = {};
        if (targetSubjects.length > 0) {
            query.subject = {
                $in: targetSubjects.map(s => new RegExp("^" + String(s).trim().toLowerCase().replace(/_/g, "[ _]?") + "$", "i"))
            };
        }
        if (topic_ids && topic_ids.length > 0) {
            query.topic_id = { $in: topic_ids.map(Number) };
        }

        rawQuestions = await UcatQuestion.find(query)
            .select("-correct_answer -explanation")
            .limit(targetLimit)
            .lean();

        if (rawQuestions.length === 0) {
            rawQuestions = await UcatQuestion.find({})
                .select("-correct_answer -explanation")
                .limit(targetLimit)
                .lean();
        }
    }

    const selectedQuestions = rawQuestions.slice(0, targetLimit);
    const questionIds = selectedQuestions.map((q) => q.id || q._id);

    const questionsFormatted = selectedQuestions.map((q) => ({
        question_id: q.id || q._id,
        question: q.question,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        subject: q.subject,
        topic_name: q.topic_name || q.chapter || ""
    }));

    const maxMarks = (questionsFormatted.length || targetLimit) * 4;
    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + testDuration * 60 * 1000);

    const sessionPayload = {
        sessionId: "UCAT_TEST_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
        student_id: studentId,
        test_id: testIdentifier,
        testId: testIdentifier,
        previous_year_paper_id: rawTestId && rawTestId.startsWith("UCAT_20") ? rawTestId : null,
        title: testTitle,
        subtitle: builtinConfig ? builtinConfig.type : (isFullExam ? "Official Full Paper" : "Practice Test"),
        test_type: builtinConfig ? builtinConfig.testType : (isFullExam ? "Official Paper" : "Quick Test"),
        subjects: targetSubjects,
        chapters: targetTopics,
        topic_ids: topic_ids.map(Number),
        total_questions: questionsFormatted.length,
        duration: testDuration,
        max_marks: maxMarks,
        total_marks: maxMarks,
        level: testLevel,
        score: 0,
        correct: 0,
        wrong: 0,
        skipped: questionsFormatted.length,
        accuracy: 0,
        status: "In Progress",
        started_at: startedAt,
        expires_at: expiresAt,
        question_ids: questionIds
    };

    const sessionDoc = await testSessionRepository.createSession(sessionPayload);
    const resultDoc = sanitizeSessionResponse(sessionDoc);
    resultDoc.questions = questionsFormatted;
    resultDoc.totalQuestions = questionsFormatted.length;
    resultDoc.totalMarks = maxMarks;
    resultDoc.max_marks = maxMarks;
    resultDoc.started_at = startedAt;
    resultDoc.expires_at = expiresAt;
    return resultDoc;
};

// --- STEP 5: SUBMIT TEST SESSION ---
const submitTest = async (sessionId, answers = []) => {
    const session = await testSessionRepository.getSessionById(sessionId);
    if (!session) {
        const error = new Error("Test session not found.");
        error.statusCode = 404;
        throw error;
    }

    if (session.status === "Completed") {
        const error = new Error("This test session has already been submitted.");
        error.statusCode = 409;
        throw error;
    }

    // 1. Reconcile answers: start with session.answers from API #6 autosave
    const answerMap = new Map();
    if (Array.isArray(session.answers)) {
        for (const ans of session.answers) {
            const qId = Number(ans.question_id || ans.questionId);
            if (qId) {
                answerMap.set(qId, {
                    question_id: qId,
                    selected_option: (ans.selected_option || "").trim().toUpperCase(),
                    time_spent: Math.max(0, Number(ans.time_spent) || 0)
                });
            }
        }
    }

    // 2. Overlay any answers sent in submit payload
    if (Array.isArray(answers)) {
        for (const ans of answers) {
            const qId = Number(ans.question_id || ans.questionId);
            if (qId) {
                answerMap.set(qId, {
                    question_id: qId,
                    selected_option: (ans.selected_option || ans.selected || "").trim().toUpperCase(),
                    time_spent: Math.max(0, Number(ans.time_spent || ans.timeSpent) || 0)
                });
            }
        }
    }

    const questionIds = Array.isArray(session.question_ids) && session.question_ids.length > 0
        ? session.question_ids.map(Number)
        : Array.from(answerMap.keys());

    const questionDocs = await UcatQuestion.find({
        id: { $in: questionIds }
    }).lean();

    const questionMap = new Map();
    questionDocs.forEach((q) => questionMap.set(Number(q.id), q));

    let correctCount = 0;
    let wrongCount = 0;
    let totalScore = 0;
    const reviewItems = [];
    const processedAnswers = [];

    for (const qId of questionIds) {
        const numId = Number(qId);
        const question = questionMap.get(numId);
        const userAns = answerMap.get(numId) || {};
        const selected = (userAns.selected_option || "").trim().toUpperCase();
        const timeSpent = Math.max(Number(userAns.time_spent) || 0, 0);

        if (!question) continue;

        const correctAnswer = (question.correct_answer || "").trim().toUpperCase();
        const isCorrect = selected === correctAnswer;
        const isSkipped = !selected;
        let marksAwarded = 0;

        if (isSkipped) {
            marksAwarded = 0;
        } else if (isCorrect) {
            correctCount++;
            marksAwarded = 4;
            totalScore += 4;
        } else {
            wrongCount++;
            marksAwarded = -1;
            totalScore -= 1;
        }

        reviewItems.push({
            question_id: numId,
            question: question.question,
            selected: selected || null,
            selected_option: selected || null,
            correct_answer: question.correct_answer,
            isCorrect,
            is_correct: isCorrect,
            marks_awarded: marksAwarded,
            time_spent: timeSpent,
            explanation: question.explanation || ""
        });

        processedAnswers.push({
            question_id: numId,
            selected_option: selected || null,
            is_correct: isCorrect,
            marks_awarded: marksAwarded,
            time_spent: timeSpent,
            is_skipped: isSkipped
        });
    }

    const totalQuestions = session.total_questions || questionIds.length || 233;
    const maxMarks = session.max_marks || session.total_marks || (totalQuestions * 4);
    const skippedCount = Math.max(totalQuestions - correctCount - wrongCount, 0);
    const attemptedCount = correctCount + wrongCount;
    const accuracyPct = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;

    let timeSpentSeconds = processedAnswers.reduce((acc, a) => acc + (a.time_spent || 0), 0);
    if (!timeSpentSeconds && session.started_at) {
        timeSpentSeconds = Math.max(0, Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000));
    }

    const updatePayload = {
        answers: processedAnswers,
        score: totalScore,
        max_marks: maxMarks,
        total_marks: maxMarks,
        correct: correctCount,
        wrong: wrongCount,
        skipped: skippedCount,
        accuracy: accuracyPct,
        progress: 100,
        time_spent_seconds: timeSpentSeconds,
        status: "Completed",
        submitted_at: new Date()
    };

    await testSessionRepository.updateSession(sessionId, updatePayload);

    return {
        success: true,
        message: "UCAT test submitted successfully.",
        data: {
            sessionId: session.sessionId || session._id,
            status: "Completed",
            score: {
                earned: totalScore,
                total: maxMarks,
                totalMarks: maxMarks
            },
            totalScore,
            totalMarks: maxMarks,
            total_marks: maxMarks,
            totalQuestions,
            total_questions: totalQuestions,
            correct: correctCount,
            wrong: wrongCount,
            skipped: skippedCount,
            accuracy: accuracyPct,
            progress: 100,
            timeSpentSeconds,
            review: reviewItems
        },
        score: totalScore,
        totalMarks: maxMarks,
        total_marks: maxMarks,
        totalQuestions,
        total_questions: totalQuestions,
        correct: correctCount,
        wrong: wrongCount,
        skipped: skippedCount,
        accuracy: accuracyPct,
        progress: 100,
        timeSpentSeconds,
        review: reviewItems
    };
};

// --- STEP 6: ANSWER AUTOSAVE (API #6) ---
const updateSessionAnswer = async (sessionId, payload = {}) => {
    const { question_id, selected_option, time_spent } = payload;

    if (!sessionId) {
        const error = new Error("A valid sessionId is required.");
        error.statusCode = 400;
        throw error;
    }

    const session = await testSessionRepository.getSessionById(sessionId);
    if (!session) {
        const error = new Error("Test session not found.");
        error.statusCode = 404;
        throw error;
    }

    if (session.status === "Completed") {
        const error = new Error("Cannot modify answers for an already completed test session.");
        error.statusCode = 409;
        throw error;
    }

    const qId = Number(question_id);
    if (!Number.isInteger(qId)) {
        const error = new Error("question_id must be a number.");
        error.statusCode = 400;
        throw error;
    }

    const opt = selected_option !== undefined && selected_option !== null ? String(selected_option).trim().toUpperCase() : "";
    const timeSpentSeconds = Math.max(Number(time_spent) || 0, 0);

    let answers = Array.isArray(session.answers) ? [...session.answers] : [];
    const existingIndex = answers.findIndex(a => Number(a.question_id) === qId);

    if (opt === "" || opt === null) {
        // Clear answer
        if (existingIndex !== -1) {
            answers.splice(existingIndex, 1);
        }
    } else {
        if (existingIndex !== -1) {
            answers[existingIndex].selected_option = opt;
            answers[existingIndex].time_spent = (answers[existingIndex].time_spent || 0) + timeSpentSeconds;
        } else {
            answers.push({
                question_id: qId,
                selected_option: opt,
                time_spent: timeSpentSeconds
            });
        }
    }

    const totalQuestions = session.total_questions || 233;
    const progress = Math.min(Math.round((answers.length / totalQuestions) * 100), 99);

    const updateData = {
        answers,
        progress,
        lastModifiedAt: new Date()
    };

    await testSessionRepository.updateSession(sessionId, updateData);

    return {
        success: true,
        message: opt === "" ? "Answer cleared successfully." : "Answer saved successfully.",
        data: {
            sessionId: session.sessionId || session._id,
            question_id: qId,
            selected_option: opt,
            progress,
            total_answered: answers.length,
            total_questions: totalQuestions
        }
    };
};

// --- GET SESSION RESULT ---
const getSessionResult = async (sessionId) => {
    const session = await testSessionRepository.getSessionById(sessionId);
    if (!session) {
        const error = new Error("Test session not found.");
        error.statusCode = 404;
        throw error;
    }

    const questionIds = (session.question_ids || []).map(Number);
    const questions = await UcatQuestion.find({ id: { $in: questionIds } }).lean();
    const questionMap = new Map();
    questions.forEach((q) => questionMap.set(Number(q.id), q));

    const userAnsMap = new Map();
    (session.answers || []).forEach((a) => userAnsMap.set(Number(a.question_id), a));

    const populatedQuestions = questionIds.map((qId) => {
        const q = questionMap.get(qId) || {};
        const userAns = userAnsMap.get(qId) || {};
        return {
            question_id: qId,
            question: q.question || "",
            option_a: q.option_a || "",
            option_b: q.option_b || "",
            option_c: q.option_c || "",
            option_d: q.option_d || "",
            correct_answer: q.correct_answer || "",
            explanation: q.explanation || "",
            subject: q.subject || "",
            topic_name: q.topic_name || q.chapter || "",
            selected_option: userAns.selected_option || null,
            is_correct: Boolean(userAns.is_correct),
            marks_awarded: userAns.marks_awarded || 0,
            time_spent: userAns.time_spent || 0,
            is_skipped: userAns.is_skipped !== undefined ? userAns.is_skipped : !userAns.selected_option
        };
    });

    const result = sanitizeSessionResponse(session);
    result.questions = populatedQuestions;
    result.max_marks = session.max_marks || session.total_marks || ((session.total_questions || populatedQuestions.length) * 4);
    result.total_marks = result.max_marks;
    result.totalQuestions = session.total_questions || populatedQuestions.length;
    return result;
};

// Helper to format UCAT subject types for Dashboard UI
const formatUcatType = (subjects = []) => {
    if (!subjects || subjects.length === 0) return "Practise Test";
    const raw = String(subjects[0]).trim().toUpperCase();
    if (raw.includes("VERBAL")) return "Verbal Reasoning";
    if (raw.includes("DECISION")) return "Decision Making";
    if (raw.includes("QUANTITATIVE")) return "Quantitative Reasoning";
    if (raw.includes("ABSTRACT")) return "Abstract Reasoning";
    if (raw.includes("SITUATIONAL")) return "Situational Judgement";
    return subjects[0];
};

// --- GET USER HISTORY (Formatted for Dashboard UI Table) ---
// --- GET USER HISTORY & LEARNING REPORT (Unified Built-in, Previous-Year, and Custom Attempts) ---
const getUserHistory = async (userId, query = {}) => {
    const studentId = userId || "STU123456";
    const UcatTestSession = require("../../model/ucat-model/ucatTestSession");

    // 1. Fetch all student sessions
    let userSessions = [];
    try {
        userSessions = await UcatTestSession.find({
            $or: [
                { student_id: studentId },
                { userId: studentId },
                { student_id: "STU123456" },
                { userId: 1 }
            ]
        }).sort({ createdAt: -1 }).lean();
    } catch (e) {
        userSessions = [];
    }

    // 2. Fetch all catalog tests (6 Built-in + All Previous-Year papers)
    const catalogTests = await getBuiltinTests();

    const unifiedList = [];
    const matchedSessionIds = new Set();

    // 3. Map catalog tests
    for (const test of catalogTests) {
        const testId = test.testId || test.test_id;
        // Find matching sessions for this test
        const matchingSessions = userSessions.filter(s => {
            return s.test_id === testId || s.testId === testId || s.previous_year_paper_id === testId ||
                (testId === "UCAT_FULL" && (s.test_type === "Full Exam" || s.test_type === "Official Paper" || s.test_id === "UCAT_2021"));
        });

        if (matchingSessions.length === 0) {
            // Unattempted Test -> not_started
            unifiedList.push({
                id: testId,
                testId: testId,
                test_id: testId,
                testName: test.testName,
                test_name: test.testName,
                date_modified: "N/A",
                course_name: {
                    title: test.testName,
                    subtitle: test.type || (test.source === "previous_year" ? "Official Full Paper" : "UCAT Section Practice")
                },
                type: test.type || formatUcatType(test.sections || [test.section]),
                level: test.level || "Intermediate",
                source: test.source || "builtin",
                status: "not_started",
                progress: 0,
                time_spent: "0m",
                time_spent_seconds: 0,
                timeSpentSeconds: 0,
                score: null,
                activeSessionId: null,
                duration_minutes: test.durationMinutes || 120,
                total_questions: test.totalQuestions || 233,
                total_marks: test.maxMarks || 932
            });
        } else {
            // Map each attempt session
            for (let i = 0; i < matchingSessions.length; i++) {
                const session = matchingSessions[i];
                matchedSessionIds.add(String(session.sessionId || session._id));

                const dateModified = session.submitted_at || session.started_at || session.createdAt;
                const formattedDate = dateModified ? new Date(dateModified).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                }) : "N/A";

                const isCompleted = session.status === "Completed";
                const answeredCount = Array.isArray(session.answers) ? session.answers.length : 0;
                const totalQuestions = session.total_questions || test.totalQuestions || 233;
                const progressPercent = isCompleted ? 100 : Math.min(Math.round((answeredCount / totalQuestions) * 100), 99);

                let totalSeconds = session.time_spent_seconds || 0;
                if (!totalSeconds && Array.isArray(session.answers)) {
                    totalSeconds = session.answers.reduce((acc, ans) => acc + (ans.time_spent || 0), 0);
                }
                if (!totalSeconds && session.submitted_at && session.started_at) {
                    totalSeconds = Math.max(0, Math.floor((new Date(session.submitted_at) - new Date(session.started_at)) / 1000));
                }

                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const formattedTimeSpent = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

                const totalMarks = session.max_marks || session.total_marks || test.maxMarks || (totalQuestions * 4);
                const scoreVal = isCompleted ? session.score : Math.max(0, session.score || 0);

                const attemptSuffix = matchingSessions.length > 1 ? ` (Attempt ${matchingSessions.length - i})` : "";
                const title = (session.title || test.testName) + attemptSuffix;

                unifiedList.push({
                    id: session.sessionId || session._id,
                    sessionId: session.sessionId || session._id,
                    testId: testId,
                    test_id: testId,
                    testName: title,
                    test_name: title,
                    date_modified: formattedDate,
                    course_name: {
                        title,
                        subtitle: test.type || "UCAT Practice"
                    },
                    type: test.type || formatUcatType(session.subjects),
                    level: test.level || session.level || "Intermediate",
                    source: test.source || "builtin",
                    status: isCompleted ? "completed" : "in_progress",
                    progress: progressPercent,
                    time_spent: formattedTimeSpent,
                    time_spent_seconds: totalSeconds,
                    timeSpentSeconds: totalSeconds,
                    score: isCompleted ? {
                        earned: scoreVal,
                        total_marks: totalMarks,
                        formatted: `${scoreVal} / ${totalMarks}`
                    } : null,
                    activeSessionId: isCompleted ? null : (session.sessionId || session._id),
                    duration_minutes: session.duration || test.durationMinutes || 120,
                    total_questions: totalQuestions,
                    total_marks: totalMarks
                });
            }
        }
    }

    // 4. Include unmatched custom sessions
    for (const session of userSessions) {
        const sId = String(session.sessionId || session._id);
        if (!matchedSessionIds.has(sId)) {
            const dateModified = session.submitted_at || session.started_at || session.createdAt;
            const formattedDate = dateModified ? new Date(dateModified).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }) : "N/A";

            const isCompleted = session.status === "Completed";
            const answeredCount = Array.isArray(session.answers) ? session.answers.length : 0;
            const totalQuestions = session.total_questions || 20;
            const progressPercent = isCompleted ? 100 : Math.min(Math.round((answeredCount / totalQuestions) * 100), 99);

            let totalSeconds = session.time_spent_seconds || 0;
            if (!totalSeconds && Array.isArray(session.answers)) {
                totalSeconds = session.answers.reduce((acc, ans) => acc + (ans.time_spent || 0), 0);
            }
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const formattedTimeSpent = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

            const totalMarks = session.max_marks || session.total_marks || (totalQuestions * 4);
            const scoreVal = isCompleted ? session.score : Math.max(0, session.score || 0);

            unifiedList.push({
                id: sId,
                sessionId: sId,
                testId: session.test_id || sId,
                test_id: session.test_id || sId,
                testName: session.title || "UCAT Practice Test",
                test_name: session.title || "UCAT Practice Test",
                date_modified: formattedDate,
                course_name: {
                    title: session.title || "UCAT Practice Test",
                    subtitle: "Custom Practice"
                },
                type: formatUcatType(session.subjects),
                level: session.level || "Intermediate",
                source: "custom",
                status: isCompleted ? "completed" : "in_progress",
                progress: progressPercent,
                time_spent: formattedTimeSpent,
                time_spent_seconds: totalSeconds,
                timeSpentSeconds: totalSeconds,
                score: isCompleted ? {
                    earned: scoreVal,
                    total_marks: totalMarks,
                    formatted: `${scoreVal} / ${totalMarks}`
                } : null,
                activeSessionId: isCompleted ? null : sId,
                duration_minutes: session.duration || 15,
                total_questions: totalQuestions,
                total_marks: totalMarks
            });
        }
    }

    return {
        status: "success",
        message: "UCAT test history fetched successfully.",
        data: unifiedList,
        pagination: {
            page: 1,
            limit: unifiedList.length,
            total: unifiedList.length,
            totalPages: 1
        }
    };
};

// --- GET UCAT KPI / SUMMARY ---
const getUcatSummary = async (studentId) => {
    const sid = studentId || "STU123456";
    const UcatTestSession = require("../../model/ucat-model/ucatTestSession");
    const streakRepository = require("../../repositories/ucat-repositories/streak.repository");

    let completedSessions = [];
    try {
        completedSessions = await UcatTestSession.find({
            $or: [{ student_id: sid }, { userId: sid }, { student_id: null }, { userId: 1 }],
            status: "Completed"
        }).sort({ submitted_at: -1, createdAt: -1 }).lean();
    } catch (e) {
        completedSessions = [];
    }

    let totalTimeSeconds = 0;
    let totalScore = 0;
    const completedCount = completedSessions.length;

    for (const session of completedSessions) {
        let sessionTime = session.time_spent_seconds || 0;
        if (!sessionTime && Array.isArray(session.answers)) {
            sessionTime = session.answers.reduce((acc, a) => acc + (a.time_spent || 0), 0);
        }
        if (!sessionTime && session.submitted_at && session.started_at) {
            sessionTime = Math.max(0, Math.floor((new Date(session.submitted_at) - new Date(session.started_at)) / 1000));
        }
        totalTimeSeconds += sessionTime;
        totalScore += (session.score || 0);
    }

    const hours = Math.floor(totalTimeSeconds / 3600);
    const minutes = Math.floor((totalTimeSeconds % 3600) / 60);
    const timeSpentFormatted = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    const avgScore = completedCount > 0 ? Math.round(totalScore / completedCount) : 0;

    let currentStreak = 0;
    try {
        const streakData = await streakRepository.getStreakByUserId(sid);
        currentStreak = streakData ? streakData.currentStreak || 0 : (completedCount > 0 ? 1 : 0);
    } catch (e) {
        currentStreak = completedCount > 0 ? 1 : 0;
    }

    return {
        status: "success",
        message: "UCAT student summary fetched successfully.",
        data: {
            totalPracticeTime: timeSpentFormatted,
            total_practice_time: timeSpentFormatted,
            totalTimeSpent: timeSpentFormatted,
            totalTimeSpentSeconds: totalTimeSeconds,
            time_spent: timeSpentFormatted,
            time_spent_seconds: totalTimeSeconds,
            averageScore: {
                earned: avgScore,
                total_marks: 932,
                formatted: `${avgScore} / 932`
            },
            avg_score: `${avgScore} / 932`,
            completedTests: completedCount,
            completed_tests: completedCount,
            currentStreak,
            current_streak: currentStreak,
            streak_formatted: `${currentStreak} Days Streak`
        }
    };
};

// --- GET UCAT LEARNING REPORT FILTERS ---
const getLearningReportFilters = () => {
    return {
        types: [
            { id: "all", name: "All", value: "all" },
            { id: "full_mock", name: "Full Mock", value: "full_mock" },
            { id: "verbal_reasoning", name: "Verbal Reasoning", value: "verbal_reasoning" },
            { id: "decision_making", name: "Decision Making", value: "decision_making" },
            { id: "quantitative_reasoning", name: "Quantitative Reasoning", value: "quantitative_reasoning" },
            { id: "abstract_reasoning", name: "Abstract Reasoning", value: "abstract_reasoning" },
            { id: "situational_judgement", name: "Situational Judgement", value: "situational_judgement" },
            { id: "official_paper", name: "Official Paper", value: "official_paper" }
        ],
        type_options: [
            "All",
            "Full Mock",
            "Verbal Reasoning",
            "Decision Making",
            "Quantitative Reasoning",
            "Abstract Reasoning",
            "Situational Judgement",
            "Official Paper"
        ],
        statuses: [
            { id: "all", name: "All", value: "all" },
            { id: "completed", name: "Completed", value: "completed" },
            { id: "in_progress", name: "In Progress", value: "in_progress" },
            { id: "not_started", name: "Not Started", value: "not_started" }
        ]
    };
};

module.exports = {
    getSubjects,
    getChapters,
    getTopics,
    getTestOptions,
    getBuiltinTests,
    startTest,
    updateSessionAnswer,
    submitTest,
    getSessionResult,
    getUserHistory,
    getUcatSummary,
    getLearningReportFilters
};
