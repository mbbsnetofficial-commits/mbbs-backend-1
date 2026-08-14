"use strict";

const studentDashboardService = require("../../services/studentDashboard.service");

/**
 * @desc Get aggregated dashboard summary for authenticated student
 * @route GET /api/v1/student/dashboard/summary
 * @access Private (Student Auth Token Required)
 */
exports.getDashboardSummary = async (req, res) => {
    try {
        const studentId = req.user?.student_id;
        const userId = req.user?.id;

        if (!studentId) {
            return res.status(400).json({
                status: "fail",
                message: "student_id is missing from authentication token."
            });
        }

        const summary = await studentDashboardService.getStudentDashboardSummary(studentId, userId);

        return res.status(200).json({
            status: "success",
            message: "Student dashboard summary fetched successfully.",
            data: summary
        });
    } catch (error) {
        return res.status(500).json({
            status: "fail",
            message: error.message || "Failed to fetch student dashboard summary."
        });
    }
};

/**
 * @desc Get top-level KPI stats cards for authenticated student
 * @route GET /api/v1/student/dashboard/stats
 * @access Private (Student Auth Token Required)
 */
exports.getDashboardStats = async (req, res) => {
    try {
        const studentId = req.user?.student_id;

        if (!studentId) {
            return res.status(400).json({
                status: "fail",
                message: "student_id is missing from authentication token."
            });
        }

        const stats = await studentDashboardService.getStudentDashboardStats(studentId);

        return res.status(200).json({
            status: "success",
            message: "Student dashboard KPI stats fetched successfully.",
            data: stats
        });
    } catch (error) {
        return res.status(500).json({
            status: "fail",
            message: error.message || "Failed to fetch student dashboard stats."
        });
    }
};

/**
 * @desc Get detailed performance analytics for authenticated student
 * @route GET /api/v1/student/dashboard/performance
 * @access Private (Student Auth Token Required)
 */
exports.getDashboardPerformance = async (req, res) => {
    try {
        const studentId = req.user?.student_id;

        if (!studentId) {
            return res.status(400).json({
                status: "fail",
                message: "student_id is missing from authentication token."
            });
        }

        const performance = await studentDashboardService.getStudentPerformanceMetrics(studentId);

        return res.status(200).json({
            status: "success",
            message: "Student performance analytics fetched successfully.",
            data: performance
        });
    } catch (error) {
        return res.status(500).json({
            status: "fail",
            message: error.message || "Failed to fetch student performance metrics."
        });
    }
};

/**
 * @desc Get paginated activity timeline for authenticated student
 * @route GET /api/v1/student/dashboard/recent-activity
 * @access Private (Student Auth Token Required)
 */
exports.getDashboardRecentActivity = async (req, res) => {
    try {
        const studentId = req.user?.student_id;

        if (!studentId) {
            return res.status(400).json({
                status: "fail",
                message: "student_id is missing from authentication token."
            });
        }

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;

        const result = await studentDashboardService.getStudentRecentActivity(studentId, page, limit);

        return res.status(200).json({
            status: "success",
            message: "Student activity history fetched successfully.",
            data: result.activities,
            pagination: result.pagination
        });
    } catch (error) {
        return res.status(500).json({
            status: "fail",
            message: error.message || "Failed to fetch student recent activity."
        });
    }
};

/**
 * @desc Get student's saved blogs for dashboard
 * @route GET /api/v1/student/dashboard/saved-blogs
 * @access Private (Student Auth Token Required)
 */
exports.getSavedBlogs = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(400).json({
                status: "fail",
                message: "user id is missing from authentication token."
            });
        }

        const result = await studentDashboardService.getStudentSavedBlogs(userId, req.query);

        return res.status(200).json({
            status: "success",
            message: "Saved blogs fetched successfully.",
            data: result.blogs,
            pagination: result.pagination
        });
    } catch (error) {
        return res.status(500).json({
            status: "fail",
            message: error.message || "Failed to fetch saved blogs."
        });
    }
};

/**
 * @desc Bookmark / Save target university for student dashboard
 * @route POST /api/v1/student/dashboard/university-finder/save-university
 * @access Private (Student Auth Token Required)
 */
exports.saveUniversity = async (req, res) => {
    try {
        const studentId = req.user?.student_id;
        const userId = req.user?.id;

        if (!studentId) {
            return res.status(400).json({
                status: "fail",
                message: "student_id is missing from authentication token."
            });
        }

        const { university_id, university_name } = req.body;
        if (!university_id || !university_name) {
            return res.status(400).json({
                status: "fail",
                message: "university_id and university_name are required."
            });
        }

        const savedUni = await studentDashboardService.saveUniversity(userId, studentId, req.body);

        return res.status(201).json({
            status: "success",
            message: "University saved to student dashboard successfully.",
            data: savedUni
        });
    } catch (error) {
        return res.status(500).json({
            status: "fail",
            message: error.message || "Failed to save university."
        });
    }
};

/**
 * @desc Remove saved university from student dashboard
 * @route DELETE /api/v1/student/dashboard/university-finder/save-university/:universityId
 * @access Private (Student Auth Token Required)
 */
exports.unsaveUniversity = async (req, res) => {
    try {
        const studentId = req.user?.student_id;
        const { universityId } = req.params;

        if (!studentId) {
            return res.status(400).json({
                status: "fail",
                message: "student_id is missing from authentication token."
            });
        }

        await studentDashboardService.unsaveUniversity(studentId, universityId);

        return res.status(200).json({
            status: "success",
            message: "University removed from saved list successfully."
        });
    } catch (error) {
        return res.status(500).json({
            status: "fail",
            message: error.message || "Failed to unsave university."
        });
    }
};

/**
 * @desc List saved target universities for student dashboard
 * @route GET /api/v1/student/dashboard/university-finder/saved-universities
 * @access Private (Student Auth Token Required)
 */
exports.getSavedUniversities = async (req, res) => {
    try {
        const studentId = req.user?.student_id;

        if (!studentId) {
            return res.status(400).json({
                status: "fail",
                message: "student_id is missing from authentication token."
            });
        }

        const universities = await studentDashboardService.getSavedUniversities(studentId);

        return res.status(200).json({
            status: "success",
            message: "Saved target universities fetched successfully.",
            data: universities
        });
    } catch (error) {
        return res.status(500).json({
            status: "fail",
            message: error.message || "Failed to fetch saved universities."
        });
    }
};

/**
 * @desc Save CSE University Finder quiz recommendation results
 * @route POST /api/v1/student/dashboard/university-finder/recommendations
 * @access Private (Student Auth Token Required)
 */
exports.saveRecommendation = async (req, res) => {
    try {
        const studentId = req.user?.student_id;

        if (!studentId) {
            return res.status(400).json({
                status: "fail",
                message: "student_id is missing from authentication token."
            });
        }

        const recommendation = await studentDashboardService.saveCseRecommendation(studentId, req.body);

        return res.status(201).json({
            status: "success",
            message: "University Finder recommendation session saved successfully.",
            data: recommendation
        });
    } catch (error) {
        return res.status(500).json({
            status: "fail",
            message: error.message || "Failed to save recommendation session."
        });
    }
};

/**
 * @desc List saved University Finder recommendation sessions
 * @route GET /api/v1/student/dashboard/university-finder/recommendations
 * @access Private (Student Auth Token Required)
 */
exports.getRecommendations = async (req, res) => {
    try {
        const studentId = req.user?.student_id;

        if (!studentId) {
            return res.status(400).json({
                status: "fail",
                message: "student_id is missing from authentication token."
            });
        }

        const recommendations = await studentDashboardService.getCseRecommendations(studentId);

        return res.status(200).json({
            status: "success",
            message: "University Finder recommendation sessions fetched successfully.",
            data: recommendations
        });
    } catch (error) {
        return res.status(500).json({
            status: "fail",
            message: error.message || "Failed to fetch recommendation sessions."
        });
    }
};

/**
 * @desc Get custom test history formatted for student dashboard table (Image 3)
 * @route GET /api/v1/student/dashboard/custom-tests
 * @access Private (Student Auth Token Required)
 */
exports.getCustomTests = async (req, res) => {
    try {
        const studentId = req.user?.student_id;

        if (!studentId) {
            return res.status(400).json({
                status: "fail",
                message: "student_id is missing from authentication token."
            });
        }

        const options = {
            page: req.query.page,
            limit: req.query.limit,
            status: req.query.status,
            sortBy: req.query.sortBy,
            sortOrder: req.query.sortOrder
        };

        const result = await studentDashboardService.getCustomTestTableHistory(studentId, options);

        return res.status(200).json({
            status: "success",
            message: "Student custom test history fetched successfully.",
            data: result.tests,
            pagination: result.pagination
        });
    } catch (error) {
        return res.status(500).json({
            status: "fail",
            message: error.message || "Failed to fetch student custom test history."
        });
    }
};

