"use strict";

const Auth = require("../model/neet-models/auth");
const StudentProfile = require("../model/neet-models/studentProfile");
const TestSession = require("../model/neet-models/testSession");
const QodStreak = require("../model/neet-models/qodStreak");
const QodSubmission = require("../model/neet-models/qodsubmission");
const TestSubjectZoneInsight = require("../model/neet-models/testSubjectZoneInsight");
const Notification = require("../model/neet-models/notification");
const SavedUniversity = require("../model/neet-models/savedUniversity");
const CseRecommendationSession = require("../model/neet-models/cseRecommendationSession");
const blogEngagementService = require("./blogEngagement.service");

const getTodayDateKey = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

/**
 * Capitalizes string nicely for full name fallback
 */
const formatName = (firstName, lastName) => {
    const first = firstName ? firstName.charAt(0).toUpperCase() + firstName.slice(1) : "";
    const last = lastName ? lastName.charAt(0).toUpperCase() + lastName.slice(1) : "";
    return `${first} ${last}`.trim();
};

/**
 * Main dashboard summary aggregator for authenticated student
 */
exports.getStudentDashboardSummary = async (studentId, userId = null) => {
    // 1. Fetch Auth & Profile details & Dashboard extras
    const [
        authDoc,
        profileDoc,
        streakDoc,
        latestInsightDoc,
        unreadNotificationsCount,
        recentNotifications,
        recentTestSessions,
        savedUniversitiesCount,
        recentSavedUniversities,
        latestCseRecommendation
    ] = await Promise.all([
        Auth.findOne({ student_id: studentId }).lean(),
        StudentProfile.findOne({ student_id: studentId }).lean(),
        QodStreak.findOne({ student_id: studentId }).lean(),
        TestSubjectZoneInsight.findOne({ student_id: studentId }).sort({ created_at: -1, _id: -1 }).lean(),
        Notification.countDocuments({ student_id: studentId, is_read: false }),
        Notification.find({ student_id: studentId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select("title message notification_type priority action_url is_read createdAt")
            .lean(),
        TestSession.find({ student_id: studentId })
            .sort({ started_at: -1 })
            .limit(5)
            .select("subjects test_type total_questions duration score correct wrong skipped accuracy status started_at submitted_at")
            .lean(),
        SavedUniversity.countDocuments({ student_id: studentId }),
        SavedUniversity.find({ student_id: studentId })
            .sort({ saved_at: -1 })
            .limit(3)
            .lean(),
        CseRecommendationSession.findOne({ student_id: studentId })
            .sort({ created_at: -1 })
            .lean()
    ]);

    const resolvedUserId = userId || authDoc?._id;

    // Fetch saved blogs for dashboard preview
    let savedBlogsData = { blogs: [], total: 0 };
    if (resolvedUserId) {
        try {
            const result = await blogEngagementService.listSavedBlogs(resolvedUserId, { page: 1, limit: 3 });
            savedBlogsData = {
                blogs: result.blogs || [],
                total: result.pagination?.total || 0
            };
        } catch (_) {
            savedBlogsData = { blogs: [], total: 0 };
        }
    }

    const todayDateKey = getTodayDateKey();
    const answeredToday = await QodSubmission.exists({
        student_id: studentId,
        qod_date_key: todayDateKey
    });

    // 2. Aggregate test performance metrics across all completed sessions
    const testStatsAggregation = await TestSession.aggregate([
        { $match: { student_id: studentId } },
        {
            $group: {
                _id: null,
                total_tests_started: { $sum: 1 },
                total_tests_completed: {
                    $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] }
                },
                total_questions_attempted: {
                    $sum: {
                        $cond: [
                            { $eq: ["$status", "Completed"] },
                            { $add: ["$correct", "$wrong"] },
                            0
                        ]
                    }
                },
                total_correct: {
                    $sum: { $cond: [{ $eq: ["$status", "Completed"] }, "$correct", 0] }
                },
                total_wrong: {
                    $sum: { $cond: [{ $eq: ["$status", "Completed"] }, "$wrong", 0] }
                },
                total_skipped: {
                    $sum: { $cond: [{ $eq: ["$status", "Completed"] }, "$skipped", 0] }
                },
                total_score: {
                    $sum: { $cond: [{ $eq: ["$status", "Completed"] }, "$score", 0] }
                },
                total_duration_seconds: {
                    $sum: { $cond: [{ $eq: ["$status", "Completed"] }, "$duration", 0] }
                }
            }
        }
    ]);

    const aggStats = testStatsAggregation[0] || {
        total_tests_started: 0,
        total_tests_completed: 0,
        total_questions_attempted: 0,
        total_correct: 0,
        total_wrong: 0,
        total_skipped: 0,
        total_score: 0,
        total_duration_seconds: 0
    };

    const overallAttempted = aggStats.total_correct + aggStats.total_wrong;
    const overallAccuracy = overallAttempted > 0
        ? Number(((aggStats.total_correct / overallAttempted) * 100).toFixed(1))
        : 0;

    // 3. Subject performance breakdown from completed test sessions
    const subjectStatsAggregation = await TestSession.aggregate([
        { $match: { student_id: studentId, status: "Completed" } },
        { $unwind: "$subjects" },
        {
            $group: {
                _id: "$subjects",
                tests_taken: { $sum: 1 },
                correct: { $sum: "$correct" },
                wrong: { $sum: "$wrong" },
                skipped: { $sum: "$skipped" },
                score: { $sum: "$score" }
            }
        },
        { $sort: { tests_taken: -1 } }
    ]);

    const subjectBreakdown = subjectStatsAggregation.map(s => {
        const attempted = s.correct + s.wrong;
        return {
            subject: s._id,
            tests_taken: s.tests_taken,
            total_correct: s.correct,
            total_wrong: s.wrong,
            total_skipped: s.skipped,
            accuracy: attempted > 0 ? Number(((s.correct / attempted) * 100).toFixed(1)) : 0
        };
    });

    // 4. Construct user student profile data
    const fullName = profileDoc?.full_name
        || (authDoc ? formatName(authDoc.firstName, authDoc.lastName) : "Student");

    const profileData = {
        student_id: studentId,
        full_name: fullName,
        firstName: authDoc?.firstName || "",
        lastName: authDoc?.lastName || "",
        email: profileDoc?.email || authDoc?.email || "",
        phone_number: profileDoc?.phone_number || authDoc?.phoneNumber || "",
        profile_picture: authDoc?.profile_picture || profileDoc?.google_picture || null,
        school_name: profileDoc?.school_name || null,
        target_exam_year: profileDoc?.target_exam_year || null,
        batch: profileDoc?.batch || null,
        course: profileDoc?.course || null,
        subscription_plan: profileDoc?.subscription_plan || "Free Tier",
        subscription_expires_at: profileDoc?.subscription_expires_at || null,
        is_verified: Boolean(profileDoc?.is_verified),
        is_institution_student: Boolean(profileDoc?.is_institution_student),
        last_login: profileDoc?.last_login || authDoc?.updatedAt || null
    };

    // 5. Construct streak stats payload
    const qodStreakData = {
        current_streak: streakDoc?.current_streak || 0,
        longest_streak: streakDoc?.longest_streak || 0,
        total_days_answered: streakDoc?.total_days_answered || 0,
        correct_answer_count: streakDoc?.correct_answer_count || 0,
        last_answered_date: streakDoc?.last_answered_date || null,
        answered_today: Boolean(answeredToday)
    };

    // 6. Focus zones & AI Insights formatting
    const insightsData = latestInsightDoc ? {
        accuracy: latestInsightDoc.accuracy,
        checkpoints: latestInsightDoc.checkpoints || [],
        topics_analyzed: latestInsightDoc.topics_analyzed || [],
        focus_zone: latestInsightDoc.focus_zone || {},
        repeated_mistake: latestInsightDoc.repeated_mistake || {},
        g_phrase: latestInsightDoc.g_phrase || "Future Doctor, your dedication today builds tomorrow's white coat.",
        last_updated: latestInsightDoc.created_at
    } : null;

    return {
        profile: profileData,
        streak: qodStreakData,
        performance_summary: {
            total_tests_started: aggStats.total_tests_started,
            total_tests_completed: aggStats.total_tests_completed,
            total_questions_attempted: aggStats.total_questions_attempted,
            total_correct: aggStats.total_correct,
            total_wrong: aggStats.total_wrong,
            total_skipped: aggStats.total_skipped,
            total_score: aggStats.total_score,
            total_practice_time_minutes: Math.round(aggStats.total_duration_seconds / 60),
            overall_accuracy_percentage: overallAccuracy
        },
        subject_breakdown: subjectBreakdown,
        insights: insightsData,
        saved_blogs: savedBlogsData,
        university_finder: {
            saved_count: savedUniversitiesCount,
            recent_saved: recentSavedUniversities,
            latest_recommendation: latestCseRecommendation || null
        },
        recent_tests: recentTestSessions,
        notifications: {
            unread_count: unreadNotificationsCount,
            recent: recentNotifications
        }
    };
};

/**
 * Compact KPI cards for top dashboard view
 */
exports.getStudentDashboardStats = async (studentId) => {
    const todayDateKey = getTodayDateKey();

    const [streakDoc, answeredToday, testAgg, savedUniCount] = await Promise.all([
        QodStreak.findOne({ student_id: studentId }).lean(),
        QodSubmission.exists({ student_id: studentId, qod_date_key: todayDateKey }),
        TestSession.aggregate([
            { $match: { student_id: studentId, status: "Completed" } },
            {
                $group: {
                    _id: null,
                    total_completed: { $sum: 1 },
                    correct: { $sum: "$correct" },
                    wrong: { $sum: "$wrong" },
                    total_duration: { $sum: "$duration" }
                }
            }
        ]),
        SavedUniversity.countDocuments({ student_id: studentId })
    ]);

    const stats = testAgg[0] || { total_completed: 0, correct: 0, wrong: 0, total_duration: 0 };
    const totalAttempted = stats.correct + stats.wrong;
    const accuracy = totalAttempted > 0
        ? Number(((stats.correct / totalAttempted) * 100).toFixed(1))
        : 0;

    return {
        current_streak: streakDoc?.current_streak || 0,
        longest_streak: streakDoc?.longest_streak || 0,
        answered_today: Boolean(answeredToday),
        tests_completed: stats.total_completed,
        total_questions_solved: totalAttempted,
        overall_accuracy: accuracy,
        practice_time_minutes: Math.round(stats.total_duration / 60),
        saved_universities_count: savedUniCount
    };
};

/**
 * In-depth analytical performance breakdown for performance tab
 */
exports.getStudentPerformanceMetrics = async (studentId) => {
    const [subjectAgg, typeAgg, recentSessions] = await Promise.all([
        TestSession.aggregate([
            { $match: { student_id: studentId, status: "Completed" } },
            { $unwind: "$subjects" },
            {
                $group: {
                    _id: "$subjects",
                    tests_taken: { $sum: 1 },
                    total_questions: { $sum: "$total_questions" },
                    correct: { $sum: "$correct" },
                    wrong: { $sum: "$wrong" },
                    skipped: { $sum: "$skipped" },
                    score: { $sum: "$score" },
                    total_time: { $sum: "$duration" }
                }
            }
        ]),

        TestSession.aggregate([
            { $match: { student_id: studentId, status: "Completed" } },
            {
                $group: {
                    _id: "$test_type",
                    count: { $sum: 1 },
                    correct: { $sum: "$correct" },
                    wrong: { $sum: "$wrong" },
                    skipped: { $sum: "$skipped" },
                    score: { $sum: "$score" }
                }
            }
        ]),

        TestSession.find({ student_id: studentId, status: "Completed" })
            .sort({ submitted_at: -1 })
            .limit(10)
            .select("test_type subjects score accuracy correct wrong skipped submitted_at duration")
            .lean()
    ]);

    const subjectPerformance = subjectAgg.map(item => {
        const attempted = item.correct + item.wrong;
        return {
            subject: item._id,
            tests_taken: item.tests_taken,
            total_questions: item.total_questions,
            correct: item.correct,
            wrong: item.wrong,
            skipped: item.skipped,
            score: item.score,
            accuracy: attempted > 0 ? Number(((item.correct / attempted) * 100).toFixed(1)) : 0,
            avg_time_per_test_minutes: Math.round((item.total_time / (item.tests_taken || 1)) / 60)
        };
    });

    const testTypeBreakdown = typeAgg.map(item => {
        const attempted = item.correct + item.wrong;
        return {
            test_type: item._id,
            tests_completed: item.count,
            correct: item.correct,
            wrong: item.wrong,
            skipped: item.skipped,
            score: item.score,
            accuracy: attempted > 0 ? Number(((item.correct / attempted) * 100).toFixed(1)) : 0
        };
    });

    return {
        subject_performance: subjectPerformance,
        test_type_performance: testTypeBreakdown,
        recent_test_trend: recentSessions
    };
};

/**
 * Paginated student recent activities
 */
exports.getStudentRecentActivity = async (studentId, page = 1, limit = 10) => {
    const skip = (Math.max(1, page) - 1) * Math.max(1, limit);

    const [testSessions, totalTestSessions] = await Promise.all([
        TestSession.find({ student_id: studentId })
            .sort({ started_at: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        TestSession.countDocuments({ student_id: studentId })
    ]);

    const activities = testSessions.map(session => ({
        id: session._id,
        type: "TEST_SESSION",
        title: `${session.test_type} (${session.subjects.join(", ")})`,
        status: session.status,
        score: session.score,
        accuracy: session.accuracy,
        total_questions: session.total_questions,
        timestamp: session.submitted_at || session.started_at
    }));

    return {
        activities,
        pagination: {
            total: totalTestSessions,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(totalTestSessions / limit) || 1
        }
    };
};

/**
 * List saved blogs for dashboard view
 */
exports.getStudentSavedBlogs = async (userId, query) => {
    return blogEngagementService.listSavedBlogs(userId, query);
};

/**
 * Save target university for student dashboard
 */
exports.saveUniversity = async (userId, studentId, universityData) => {
    const filter = { student_id: studentId, university_id: String(universityData.university_id) };
    const update = {
        $set: {
            user_id: userId,
            student_id: studentId,
            university_id: String(universityData.university_id),
            university_name: universityData.university_name,
            slug: universityData.slug || null,
            country: universityData.country || null,
            logo_url: universityData.logo_url || null,
            tuition_fee_approx: universityData.tuition_fee_approx || null,
            saved_at: new Date()
        }
    };
    const options = { new: true, upsert: true, runValidators: true };
    return SavedUniversity.findOneAndUpdate(filter, update, options);
};

/**
 * Unsave / remove target university
 */
exports.unsaveUniversity = async (studentId, universityId) => {
    return SavedUniversity.findOneAndDelete({
        student_id: studentId,
        university_id: String(universityId)
    });
};

/**
 * List saved target universities for student
 */
exports.getSavedUniversities = async (studentId) => {
    return SavedUniversity.find({ student_id: studentId })
        .sort({ saved_at: -1 })
        .lean();
};

/**
 * Save CSE University Finder recommendation search session
 */
exports.saveCseRecommendation = async (studentId, data) => {
    const sessionId = data.session_id || `CSE-REC-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    return CseRecommendationSession.create({
        student_id: studentId,
        session_id: sessionId,
        country_id: data.country_id || null,
        country_name: data.country_name || null,
        budget_range: data.budget_range || null,
        pcb_score: data.pcb_score || null,
        neet_score: data.neet_score || null,
        matched_universities: data.matched_universities || [],
        created_at: new Date()
    });
};

/**
 * Get student's saved CSE recommendations
 */
exports.getCseRecommendations = async (studentId) => {
    return CseRecommendationSession.find({ student_id: studentId })
        .sort({ created_at: -1 })
        .lean();
};
