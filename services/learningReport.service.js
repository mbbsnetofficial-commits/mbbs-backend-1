"use strict";

const mongoose = require("mongoose");
const PlatformTest = require("../model/neet-models/platformTest");
const PreviousYearQuestion = require("../model/neet-models/previousYearQuestion");
const TestSession = require("../model/neet-models/testSession");

const BUILTIN_TEST_DEFINITIONS = [
    {
        id: 1001,
        test_code: "NEET_BUILTIN_PHY_01",
        test_name: "Physics Full Test",
        test_type: "Built-in Full Test",
        subject: "Physics",
        time_limit: 180,
        total_questions: 180,
        total_marks: 720,
        is_active: true,
        is_builtin: true,
        exam_type: "neet",
        description: "180-Question Physics Full Test for NEET"
    },
    {
        id: 1002,
        test_code: "NEET_BUILTIN_CHEM_01",
        test_name: "Chemistry Full Test",
        test_type: "Built-in Full Test",
        subject: "Chemistry",
        time_limit: 180,
        total_questions: 180,
        total_marks: 720,
        is_active: true,
        is_builtin: true,
        exam_type: "neet",
        description: "180-Question Chemistry Full Test for NEET"
    },
    {
        id: 1003,
        test_code: "NEET_BUILTIN_BOT_01",
        test_name: "Botany Full Test",
        test_type: "Built-in Full Test",
        subject: "Botany",
        time_limit: 180,
        total_questions: 180,
        total_marks: 720,
        is_active: true,
        is_builtin: true,
        exam_type: "neet",
        description: "180-Question Botany Full Test for NEET"
    },
    {
        id: 1004,
        test_code: "NEET_BUILTIN_ZOO_01",
        test_name: "Zoology Full Test",
        test_type: "Built-in Full Test",
        subject: "Zoology",
        time_limit: 180,
        total_questions: 180,
        total_marks: 720,
        is_active: true,
        is_builtin: true,
        exam_type: "neet",
        description: "180-Question Zoology Full Test for NEET"
    },
    {
        id: 1005,
        test_code: "NEET_BUILTIN_FULL_01",
        test_name: "NEET Full Test",
        test_type: "Built-in Full Test",
        subject: "All",
        time_limit: 180,
        total_questions: 180,
        total_marks: 720,
        is_active: true,
        is_builtin: true,
        exam_type: "neet",
        description: "180-Question Complete NEET Full Mock Test"
    }
];

const LEARNING_REPORT_TYPE_FILTERS = [
    { id: "previous_year_test", name: "Previous Year Test", value: "Previous Year Test" },
    { id: "practise_test", name: "Practise Test", value: "Practise Test" },
    { id: "custom", name: "Custom", value: "Custom" },
    { id: "physics", name: "Physics", value: "Physics" },
    { id: "chemistry", name: "Chemistry", value: "Chemistry" },
    { id: "botany", name: "Botany", value: "Botany" },
    { id: "zoology", name: "Zoology", value: "Zoology" }
];

/**
 * Ensures the 5 Built-in NEET tests exist in the database (platform-tests collection).
 */
const ensureBuiltinTestsSeeded = async () => {
    if (mongoose.connection.readyState !== 1) return;
    for (const testDef of BUILTIN_TEST_DEFINITIONS) {
        await PlatformTest.findOneAndUpdate(
            { test_code: testDef.test_code },
            { $set: testDef },
            { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
        );
    }
};

/**
 * Returns all active Built-in Tests & Previous Year Question Papers.
 */
const getBuiltinTests = async () => {
    await ensureBuiltinTestsSeeded();
    let tests = [];
    let previousYearPapers = [];

    if (mongoose.connection.readyState === 1) {
        const [builtinList, pyList] = await Promise.all([
            PlatformTest.find({
                $or: [{ is_builtin: true }, { test_code: { $in: BUILTIN_TEST_DEFINITIONS.map(d => d.test_code) } }],
                is_active: true
            }).sort({ id: 1 }).lean(),

            PreviousYearQuestion.find({ is_active: true }).sort({ id: -1 }).lean()
        ]);
        tests = builtinList;
        previousYearPapers = pyList;
    }

    if (!tests || tests.length === 0) {
        tests = BUILTIN_TEST_DEFINITIONS;
    }

    const formattedBuiltin = tests.map(t => ({
        id: t.id,
        test_id: t.id,
        builtin_test_id: t.id,
        test_code: t.test_code,
        test_name: t.test_name,
        test_type: t.test_type,
        source: "builtin",
        subject: t.subject || "All",
        total_questions: t.total_questions || 180,
        total_marks: t.total_marks || 720,
        duration_minutes: t.time_limit || 180,
        marking_scheme: {
            correct: 4,
            wrong: -1,
            skipped: 0
        },
        description: t.description || ""
    }));

    const formattedPreviousYear = (previousYearPapers || []).map(p => ({
        id: p.id,
        test_id: p.id,
        previous_year_paper_id: p.id,
        test_code: `NEET_PY_${p.id}`,
        test_name: p.name,
        test_type: "Previous Year Test",
        source: "previous_year",
        subject: "All",
        total_questions: p.question_count || (Array.isArray(p.question_ids) ? p.question_ids.length : 180),
        total_marks: (p.question_count || (Array.isArray(p.question_ids) ? p.question_ids.length : 180)) * 4,
        duration_minutes: 180,
        marking_scheme: {
            correct: 4,
            wrong: -1,
            skipped: 0
        },
        description: `NEET Previous Year Paper: ${p.name}`
    }));

    return [...formattedBuiltin, ...formattedPreviousYear];
};

/**
 * Formats a duration in seconds to "Xh Ym" string.
 */
const formatDuration = (totalSeconds = 0) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
};

/**
 * Generates the unified NEET Learning Report for a student.
 */
const getNeetLearningReport = async (studentId, options = {}) => {
    await ensureBuiltinTestsSeeded();

    const page = Math.max(parseInt(options.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(options.limit, 10) || 10, 1), 100);
    const statusFilter = options.status ? String(options.status).trim().toLowerCase() : "all";
    const sourceFilter = options.source ? String(options.source).trim().toLowerCase() : "all";
    const typeFilter = options.type ? String(options.type).trim() : null;
    const sortBy = options.sortBy || "date";
    const sortOrder = options.sortOrder === "asc" ? 1 : -1;

    // 1. Fetch Built-in Tests
    let builtinTests = [];
    if (sourceFilter === "all" || sourceFilter === "builtin") {
        if (mongoose.connection.readyState === 1) {
            builtinTests = await PlatformTest.find({
                $or: [{ is_builtin: true }, { test_code: { $in: BUILTIN_TEST_DEFINITIONS.map(d => d.test_code) } }],
                is_active: true
            }).sort({ id: 1 }).lean();
        }
        if (!builtinTests || builtinTests.length === 0) {
            builtinTests = BUILTIN_TEST_DEFINITIONS;
        }
    }

    // 2. Fetch Previous Year Tests
    let previousYearPapers = [];
    if ((sourceFilter === "all" || sourceFilter === "previous_year") && mongoose.connection.readyState === 1) {
        previousYearPapers = await PreviousYearQuestion.find({ is_active: true })
            .sort({ id: -1 })
            .lean();
    }

    // 3. Fetch Custom Tests saved by this student
    let customTests = [];
    if ((sourceFilter === "all" || sourceFilter === "custom") && studentId && mongoose.connection.readyState === 1) {
        customTests = await PlatformTest.find({
            student_id: studentId,
            is_builtin: false,
            is_active: true
        }).sort({ created_at: -1, id: -1 }).lean();
    }

    // 4. Fetch all test sessions for this student
    const studentSessions = (studentId && mongoose.connection.readyState === 1)
        ? await TestSession.find({ student_id: studentId }).sort({ started_at: -1, createdAt: -1 }).lean()
        : [];

    // Group student sessions by platform_test_id / test_code and previous_year_paper_id
    const builtinSessionMap = new Map();
    const previousYearSessionMap = new Map();

    for (const session of studentSessions) {
        if (session.platform_test_id && !builtinSessionMap.has(session.platform_test_id)) {
            builtinSessionMap.set(session.platform_test_id, session);
        }
        if (session.previous_year_paper_id && !previousYearSessionMap.has(session.previous_year_paper_id)) {
            previousYearSessionMap.set(session.previous_year_paper_id, session);
        }
    }

    const unifiedList = [];

    // Map Built-in Tests
    for (const test of builtinTests) {
        const session = builtinSessionMap.get(test.id);
        const totalQuestions = test.total_questions || 180;
        const totalMarks = test.total_marks || (totalQuestions * 4);

        let status = "not_started";
        let progress = 0;
        let timeSpentSeconds = 0;
        let score = null;
        let activeSessionId = null;
        let lastModifiedAt = null;

        if (session) {
            const answeredCount = Array.isArray(session.answers) ? session.answers.length : 0;
            timeSpentSeconds = session.time_spent_seconds || 0;
            if (!timeSpentSeconds && Array.isArray(session.answers)) {
                timeSpentSeconds = session.answers.reduce((acc, a) => acc + (a.time_spent || 0), 0);
            }
            if (!timeSpentSeconds && session.submitted_at && session.started_at) {
                timeSpentSeconds = Math.max(0, Math.floor((new Date(session.submitted_at) - new Date(session.started_at)) / 1000));
            }

            if (session.status === "Completed") {
                status = "completed";
                progress = 100;
                score = session.score;
                lastModifiedAt = session.submitted_at || session.updatedAt || session.started_at;
            } else if (session.status === "Started") {
                status = "in_progress";
                progress = Math.min(Math.round((answeredCount / totalQuestions) * 100), 99);
                score = Math.max(0, session.score || 0);
                activeSessionId = session._id;
                lastModifiedAt = session.updatedAt || session.started_at;
            }
        }

        const formattedDate = lastModifiedAt
            ? new Date(lastModifiedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
            : "Not Attempted";

        unifiedList.push({
            id: test.id,
            test_id: test.id,
            test_code: test.test_code,
            test_name: test.test_name,
            course_name: {
                title: test.test_name,
                subtitle: test.subject && test.subject !== "All" ? `${test.subject} Practice` : "Full Mock Practice"
            },
            source: "builtin",
            type: test.subject && test.subject !== "All" ? test.subject : "NEET Full Test",
            level: "Intermediate",
            duration_minutes: test.time_limit || 180,
            total_questions: totalQuestions,
            total_marks: totalMarks,
            totalMarks: totalMarks,
            status,
            progress,
            time_spent: formatDuration(timeSpentSeconds),
            timeSpentSeconds,
            score: score !== null ? {
                earned: score,
                total_marks: totalMarks,
                formatted: `${score} / ${totalMarks}`
            } : null,
            activeSessionId,
            lastModifiedAt,
            date_modified: formattedDate
        });
    }

    // Map Previous Year Tests
    for (const paper of previousYearPapers) {
        const session = previousYearSessionMap.get(paper.id);
        const totalQuestions = paper.question_count || (Array.isArray(paper.question_ids) ? paper.question_ids.length : 180);
        const totalMarks = totalQuestions * 4;

        let status = "not_started";
        let progress = 0;
        let timeSpentSeconds = 0;
        let score = null;
        let activeSessionId = null;
        let lastModifiedAt = null;

        if (session) {
            const answeredCount = Array.isArray(session.answers) ? session.answers.length : 0;
            timeSpentSeconds = session.time_spent_seconds || 0;
            if (!timeSpentSeconds && Array.isArray(session.answers)) {
                timeSpentSeconds = session.answers.reduce((acc, a) => acc + (a.time_spent || 0), 0);
            }
            if (!timeSpentSeconds && session.submitted_at && session.started_at) {
                timeSpentSeconds = Math.max(0, Math.floor((new Date(session.submitted_at) - new Date(session.started_at)) / 1000));
            }

            if (session.status === "Completed") {
                status = "completed";
                progress = 100;
                score = session.score;
                lastModifiedAt = session.submitted_at || session.updatedAt || session.started_at;
            } else if (session.status === "Started") {
                status = "in_progress";
                progress = Math.min(Math.round((answeredCount / totalQuestions) * 100), 99);
                score = Math.max(0, session.score || 0);
                activeSessionId = session._id;
                lastModifiedAt = session.updatedAt || session.started_at;
            }
        }

        const formattedDate = lastModifiedAt
            ? new Date(lastModifiedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
            : "Not Attempted";

        unifiedList.push({
            id: paper.id,
            test_id: paper.id,
            test_code: `NEET_PY_${paper.id}`,
            test_name: paper.name,
            course_name: {
                title: paper.name,
                subtitle: "Previous Year Paper"
            },
            source: "previous_year",
            type: "Previous Year Test",
            level: "Advanced",
            duration_minutes: 180,
            total_questions: totalQuestions,
            total_marks: totalMarks,
            totalMarks: totalMarks,
            status,
            progress,
            time_spent: formatDuration(timeSpentSeconds),
            timeSpentSeconds,
            score: score !== null ? {
                earned: score,
                total_marks: totalMarks,
                formatted: `${score} / ${totalMarks}`
            } : null,
            activeSessionId,
            lastModifiedAt,
            date_modified: formattedDate
        });
    }

    // Map Custom Tests
    for (const test of customTests) {
        const session = builtinSessionMap.get(test.id);
        const totalQuestions = test.total_questions || 40;
        const totalMarks = test.total_marks || (totalQuestions * 4);

        let status = "not_started";
        let progress = 0;
        let timeSpentSeconds = 0;
        let score = null;
        let activeSessionId = null;
        let lastModifiedAt = test.created_at || test.updated_at || null;

        if (session) {
            const answeredCount = Array.isArray(session.answers) ? session.answers.length : 0;
            timeSpentSeconds = session.time_spent_seconds || 0;
            if (!timeSpentSeconds && Array.isArray(session.answers)) {
                timeSpentSeconds = session.answers.reduce((acc, a) => acc + (a.time_spent || 0), 0);
            }
            if (!timeSpentSeconds && session.submitted_at && session.started_at) {
                timeSpentSeconds = Math.max(0, Math.floor((new Date(session.submitted_at) - new Date(session.started_at)) / 1000));
            }

            if (session.status === "Completed") {
                status = "completed";
                progress = 100;
                score = session.score;
                lastModifiedAt = session.submitted_at || session.updatedAt || session.started_at;
            } else if (session.status === "Started") {
                status = "in_progress";
                progress = Math.min(Math.round((answeredCount / totalQuestions) * 100), 99);
                score = Math.max(0, session.score || 0);
                activeSessionId = session._id;
                lastModifiedAt = session.updatedAt || session.started_at;
            }
        }

        const formattedDate = lastModifiedAt
            ? new Date(lastModifiedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
            : "Not Attempted";

        const subtitle = Array.isArray(test.subjects) && test.subjects.length > 1
            ? `${test.subjects.join(" & ")} Custom Test`
            : (Array.isArray(test.subjects) && test.subjects[0] ? `${test.subjects[0]} Custom Test` : "Custom Practice Test");

        unifiedList.push({
            id: test.id,
            test_id: test.id,
            custom_test_id: test.id,
            platform_test_id: test.id,
            test_code: test.test_code,
            test_name: test.test_name,
            course_name: {
                title: test.test_name,
                subtitle
            },
            source: "custom",
            type: "Custom",
            level: test.level || "Intermediate",
            duration_minutes: test.time_limit || 180,
            total_questions: totalQuestions,
            total_marks: totalMarks,
            totalMarks: totalMarks,
            status,
            progress,
            time_spent: formatDuration(timeSpentSeconds),
            timeSpentSeconds,
            score: score !== null ? {
                earned: score,
                total_marks: totalMarks,
                formatted: `${score} / ${totalMarks}`
            } : null,
            activeSessionId,
            lastModifiedAt,
            date_modified: formattedDate
        });
    }

    // Filter by Status
    let filteredList = unifiedList;
    if (statusFilter !== "all") {
        const normalizedFilter = statusFilter.replace(/[-\s]/g, "_");
        filteredList = filteredList.filter(item => {
            const itemStatus = item.status.replace(/[-\s]/g, "_");
            return itemStatus === normalizedFilter;
        });
    }

    // Filter by Type
    if (typeFilter && typeFilter !== "all") {
        const types = typeFilter.split(",").map(t => t.trim().toLowerCase());
        filteredList = filteredList.filter(item => {
            const itemType = (item.type || "").toLowerCase();
            return types.some(t => {
                if (t === itemType) return true;
                if ((t === "practise test" || t === "practice test") && (itemType.includes("full test") || itemType.includes("neet"))) return true;
                return false;
            });
        });
    }

    // Sort list
    filteredList.sort((a, b) => {
        if (sortBy === "score") {
            const scoreA = a.score ? a.score.earned : -1;
            const scoreB = b.score ? b.score.earned : -1;
            return (scoreA - scoreB) * sortOrder;
        }
        if (sortBy === "progress") {
            return (a.progress - b.progress) * sortOrder;
        }
        if (sortBy === "title") {
            return a.test_name.localeCompare(b.test_name) * sortOrder;
        }
        // default "date"
        const dateA = a.lastModifiedAt ? new Date(a.lastModifiedAt).getTime() : 0;
        const dateB = b.lastModifiedAt ? new Date(b.lastModifiedAt).getTime() : 0;
        return (dateA - dateB) * sortOrder;
    });

    // Pagination
    const total = filteredList.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginatedItems = filteredList.slice((page - 1) * limit, page * limit);

    return {
        status: "success",
        message: "NEET learning report fetched successfully.",
        filters: {
            types: LEARNING_REPORT_TYPE_FILTERS,
            type_options: LEARNING_REPORT_TYPE_FILTERS.map(f => f.name)
        },
        data: paginatedItems,
        pagination: {
            page,
            limit,
            total,
            totalPages
        }
    };
};

/**
 * Calculates student's real NEET Performance Summary metrics.
 */
const getNeetSummary = async (studentId) => {
    if (!studentId || mongoose.connection.readyState !== 1) {
        return {
            status: "success",
            message: "NEET dashboard summary fetched successfully.",
            data: {
                student_id: studentId || "STU123456",
                total_time_spent_seconds: 0,
                total_time_spent: "0m",
                average_score: "0 / 720",
                average_score_number: 0,
                completed_tests: 0,
                current_streak: 0,
                streak_formatted: "0 Days",
                build_test_cta: "Build your own test"
            }
        };
    }

    const completedSessions = await TestSession.find({
        student_id: studentId,
        status: "Completed"
    }).sort({ submitted_at: -1 }).lean();

    const allStudentSessions = await TestSession.find({
        student_id: studentId
    }).lean();

    // 1. Total Time Spent across all tests
    let totalSeconds = 0;
    for (const session of allStudentSessions) {
        let sec = session.time_spent_seconds || 0;
        if (!sec && Array.isArray(session.answers)) {
            sec = session.answers.reduce((sum, a) => sum + (a.time_spent || 0), 0);
        }
        if (!sec && session.submitted_at && session.started_at) {
            sec = Math.max(0, Math.floor((new Date(session.submitted_at) - new Date(session.started_at)) / 1000));
        }
        totalSeconds += sec;
    }

    // 2. Average Score across completed tests
    let averageScoreNumber = 0;
    if (completedSessions.length > 0) {
        const totalScore = completedSessions.reduce((sum, s) => sum + (s.score || 0), 0);
        averageScoreNumber = Math.round(totalScore / completedSessions.length);
    }

    // 3. Completed Tests count
    const completedCount = completedSessions.length;

    // 4. Real Streak Calculation based on consecutive days of completed tests
    const activeDates = new Set();
    for (const s of completedSessions) {
        const d = s.submitted_at || s.started_at || s.createdAt;
        if (d) {
            const key = new Date(d).toISOString().split("T")[0];
            activeDates.add(key);
        }
    }

    const sortedDates = Array.from(activeDates).sort().reverse();
    let currentStreak = 0;
    if (sortedDates.length > 0) {
        const today = new Date().toISOString().split("T")[0];
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = yesterdayDate.toISOString().split("T")[0];

        if (sortedDates[0] === today || sortedDates[0] === yesterday) {
            currentStreak = 1;
            let checkDate = new Date(sortedDates[0]);
            for (let i = 1; i < sortedDates.length; i++) {
                checkDate.setDate(checkDate.getDate() - 1);
                const expected = checkDate.toISOString().split("T")[0];
                if (sortedDates[i] === expected) {
                    currentStreak++;
                } else {
                    break;
                }
            }
        }
    }

    return {
        status: "success",
        message: "NEET dashboard summary fetched successfully.",
        data: {
            student_id: studentId,
            total_time_spent_seconds: totalSeconds,
            total_time_spent: formatDuration(totalSeconds),
            average_score: `${averageScoreNumber} / 720`,
            average_score_number: averageScoreNumber,
            completed_tests: completedCount,
            current_streak: currentStreak,
            streak_formatted: currentStreak === 1 ? "1 Day" : `${currentStreak} Days`,
            build_test_cta: "Build your own test"
        }
    };
};

module.exports = {
    BUILTIN_TEST_DEFINITIONS,
    LEARNING_REPORT_TYPE_FILTERS,
    ensureBuiltinTestsSeeded,
    getBuiltinTests,
    getNeetLearningReport,
    getNeetSummary,
    getLearningReportFilters: () => ({
        types: LEARNING_REPORT_TYPE_FILTERS,
        type_options: LEARNING_REPORT_TYPE_FILTERS.map(f => f.name),
        statuses: [
            { id: "all", name: "All", value: "all" },
            { id: "completed", name: "Completed", value: "completed" },
            { id: "in_progress", name: "In Progress", value: "in_progress" },
            { id: "not_started", name: "Not Started", value: "not_started" }
        ]
    })
};
