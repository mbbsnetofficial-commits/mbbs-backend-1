const Auth = require("../../model/neet-models/auth");
const StudentProfile = require("../../model/neet-models/studentProfile");
const Question = require("../../model/neet-models/questions");
const Topic = require("../../model/neet-models/topic");
const QuestionOfTheDay = require("../../model/neet-models/qod");
const QuestionFeedback = require("../../model/neet-models/questionFeedback");
const ReviewComment = require("../../model/neet-models/reviewComment");
const Notification = require("../../model/neet-models/notification");
const PlatformAdmin = require("../../model/neet-models/platformAdmin");
const TestSession = require("../../model/neet-models/testSession");
const PlatformTest = require("../../model/neet-models/platformTest");
const PreviousYearQuestion = require("../../model/neet-models/previousYearQuestion");
const { createNotificationService } = require("../../services/notification.service");
const { SUBJECT_ENUM, REVIEW_STATUS_ENUM, NOTIFICATION_TYPE_ENUM, NOTIFICATION_PRIORITY_ENUM } = require("../../constants/enum");

const pagination = query => {
    const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 20, 1), 100);
    return { page, limit, skip: (page - 1) * limit };
};

const paginatedResponse = (res, page, limit, total, data) => res.status(200).json({
    status: "success",
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    data
});

const nextNumericId = async Model => {
    const latest = await Model.findOne().sort({ id: -1 }).select("id").lean();
    return (latest?.id || 0) + 1;
};

exports.getDashboard = async (req, res) => {
    try {
        const [students, activeProfiles, questions, topics, qod, tests, pendingFeedback, pendingReviews, unreadNotifications] = await Promise.all([
            Auth.countDocuments(),
            StudentProfile.countDocuments({ is_active: true }),
            Question.countDocuments(),
            Topic.countDocuments(),
            QuestionOfTheDay.countDocuments(),
            TestSession.countDocuments(),
            QuestionFeedback.countDocuments({ status: "pending" }),
            ReviewComment.countDocuments({ status: "pending" }),
            Notification.countDocuments({ is_read: false, is_deleted: false })
        ]);

        return res.status(200).json({ status: "success", data: {
            students,
            active_student_profiles: activeProfiles,
            questions,
            topics,
            questions_of_the_day: qod,
            test_sessions: tests,
            pending_question_feedback: pendingFeedback,
            pending_review_comments: pendingReviews,
            unread_notifications: unreadNotifications
        } });
    } catch (error) {
        return res.status(500).json({ status: "fail", message: error.message });
    }
};

exports.listStudents = async (req, res) => {
    try {
        const { page, limit, skip } = pagination(req.query);
        const filter = {};
        if (req.query.search) {
            const search = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            filter.$or = [
                { student_id: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phoneNumber: { $regex: search, $options: "i" } }
            ];
        }
        const [users, total] = await Promise.all([
            Auth.find(filter).select("-password -confirmPassword").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            Auth.countDocuments(filter)
        ]);
        const profiles = await StudentProfile.find({ student_id: { $in: users.map(user => user.student_id) } }).lean();
        const profileByStudent = new Map(profiles.map(profile => [profile.student_id, profile]));
        const data = users.map(user => ({ ...user, profile: profileByStudent.get(user.student_id) || null }));
        return paginatedResponse(res, page, limit, total, data);
    } catch (error) {
        return res.status(500).json({ status: "fail", message: error.message });
    }
};

exports.updateStudent = async (req, res) => {
    try {
        const allowed = ["is_active", "is_verified", "email_verified", "is_institution_student", "subscription_plan", "subscription_expires_at", "target_exam_year"];
        const updates = Object.fromEntries(allowed.filter(key => req.body[key] !== undefined).map(key => [key, req.body[key]]));
        if (!Object.keys(updates).length) return res.status(400).json({ status: "fail", message: "No adjustable student fields were supplied." });

        const user = await Auth.findOne({ student_id: req.params.studentId });
        if (!user) return res.status(404).json({ status: "fail", message: "Student not found." });
        const profile = await StudentProfile.findOneAndUpdate(
            { student_id: user.student_id },
            { $set: updates, $setOnInsert: { student_id: user.student_id } },
            { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        );
        if (typeof updates.is_active === "boolean") {
            user.is_active = updates.is_active;
            user.token_version = (user.token_version || 0) + 1;
            await user.save();
        }
        return res.status(200).json({ status: "success", message: "Student settings updated successfully.", data: profile });
    } catch (error) {
        return res.status(500).json({ status: "fail", message: error.message });
    }
};

const listContent = Model => async (req, res) => {
    try {
        const { page, limit, skip } = pagination(req.query);
        const filter = req.query.search ? { $or: [
            { question: { $regex: req.query.search, $options: "i" } },
            { name: { $regex: req.query.search, $options: "i" } },
            { chapter: { $regex: req.query.search, $options: "i" } }
        ] } : {};
        const [data, total] = await Promise.all([
            Model.find(filter).sort({ id: -1 }).skip(skip).limit(limit).lean(),
            Model.countDocuments(filter)
        ]);
        return paginatedResponse(res, page, limit, total, data);
    } catch (error) {
        return res.status(500).json({ status: "fail", message: error.message });
    }
};

exports.listQuestions = listContent(Question);
exports.listTopics = listContent(Topic);
exports.listQod = listContent(QuestionOfTheDay);

exports.createQuestion = async (req, res) => {
    try {
        const question = await Question.create({ ...req.body, id: req.body.id || await nextNumericId(Question) });
        return res.status(201).json({ status: "success", data: question });
    } catch (error) { return res.status(error.code === 11000 ? 409 : 400).json({ status: "fail", message: error.message }); }
};

exports.updateQuestion = async (req, res) => {
    try {
        const { id, ...updates } = req.body;
        const question = await Question.findOneAndUpdate({ id: Number(req.params.id) }, updates, { new: true, runValidators: true });
        if (!question) return res.status(404).json({ status: "fail", message: "Question not found." });
        return res.status(200).json({ status: "success", data: question });
    } catch (error) { return res.status(400).json({ status: "fail", message: error.message }); }
};

exports.createTopic = async (req, res) => {
    try {
        if (!SUBJECT_ENUM.includes(req.body.subject)) return res.status(400).json({ status: "fail", message: `subject must be one of: ${SUBJECT_ENUM.join(", ")}.` });
        const topic = await Topic.create({ ...req.body, id: req.body.id || await nextNumericId(Topic) });
        return res.status(201).json({ status: "success", data: topic });
    } catch (error) { return res.status(error.code === 11000 ? 409 : 400).json({ status: "fail", message: error.message }); }
};

exports.updateTopic = async (req, res) => {
    try {
        const { id, ...updates } = req.body;
        const topic = await Topic.findOneAndUpdate({ id: Number(req.params.id) }, updates, { new: true, runValidators: true });
        if (!topic) return res.status(404).json({ status: "fail", message: "Topic not found." });
        return res.status(200).json({ status: "success", data: topic });
    } catch (error) { return res.status(400).json({ status: "fail", message: error.message }); }
};

exports.createQod = async (req, res) => {
    try {
        const qod = await QuestionOfTheDay.create({ ...req.body, id: req.body.id || await nextNumericId(QuestionOfTheDay) });
        return res.status(201).json({ status: "success", data: qod });
    } catch (error) { return res.status(error.code === 11000 ? 409 : 400).json({ status: "fail", message: error.message }); }
};

exports.updateQod = async (req, res) => {
    try {
        const { id, ...updates } = req.body;
        const qod = await QuestionOfTheDay.findOneAndUpdate({ id: Number(req.params.id) }, updates, { new: true, runValidators: true });
        if (!qod) return res.status(404).json({ status: "fail", message: "Question of the Day not found." });
        return res.status(200).json({ status: "success", data: qod });
    } catch (error) { return res.status(400).json({ status: "fail", message: error.message }); }
};

exports.listModeration = async (req, res) => {
    try {
        const Model = req.params.resource === "question-feedback" ? QuestionFeedback : req.params.resource === "review-comments" ? ReviewComment : null;
        if (!Model) return res.status(400).json({ status: "fail", message: "resource must be question-feedback or review-comments." });
        const { page, limit, skip } = pagination(req.query);
        const filter = req.query.status ? { status: req.query.status } : {};
        const [data, total] = await Promise.all([Model.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit).lean(), Model.countDocuments(filter)]);
        return paginatedResponse(res, page, limit, total, data);
    } catch (error) { return res.status(500).json({ status: "fail", message: error.message }); }
};

exports.updateModeration = async (req, res) => {
    try {
        const Model = req.params.resource === "question-feedback" ? QuestionFeedback : req.params.resource === "review-comments" ? ReviewComment : null;
        if (!Model) return res.status(400).json({ status: "fail", message: "Invalid moderation resource." });
        if (!REVIEW_STATUS_ENUM.includes(req.body.status)) return res.status(400).json({ status: "fail", message: `status must be one of: ${REVIEW_STATUS_ENUM.join(", ")}.` });
        const item = await Model.findByIdAndUpdate(req.params.itemId, { status: req.body.status }, { new: true, runValidators: true });
        if (!item) return res.status(404).json({ status: "fail", message: "Moderation item not found." });
        return res.status(200).json({ status: "success", data: item });
    } catch (error) { return res.status(400).json({ status: "fail", message: error.message }); }
};

exports.sendNotification = async (req, res) => {
    try {
        const user = await Auth.findOne({ student_id: req.body.student_id }).lean();
        if (!user) return res.status(404).json({ status: "fail", message: "Student not found." });
        if (!NOTIFICATION_TYPE_ENUM.includes(req.body.notification_type || "system") || !NOTIFICATION_PRIORITY_ENUM.includes(req.body.priority || "normal")) return res.status(400).json({ status: "fail", message: "Invalid notification type or priority." });
        const notification = await createNotificationService({
            userId: user._id,
            studentId: user.student_id,
            title: req.body.title,
            message: req.body.message,
            notificationType: req.body.notification_type || "system",
            priority: req.body.priority || "normal",
            actionUrl: req.body.action_url || null,
            data: req.body.data || null
        });
        return res.status(201).json({ status: "success", data: notification });
    } catch (error) { return res.status(400).json({ status: "fail", message: error.message }); }
};

exports.listAdmins = async (req, res) => {
    try {
        const admins = await PlatformAdmin.find().sort({ id: 1 }).lean();
        return res.status(200).json({ status: "success", total: admins.length, data: admins });
    } catch (error) { return res.status(500).json({ status: "fail", message: error.message }); }
};

exports.updateAdminStatus = async (req, res) => {
    try {
        if (typeof req.body.is_active !== "boolean") return res.status(400).json({ status: "fail", message: "is_active must be boolean." });
        const target = await PlatformAdmin.findOne({ id: Number(req.params.adminId) });
        if (!target) return res.status(404).json({ status: "fail", message: "Admin not found." });
        if (target.id === req.admin.admin_id && req.body.is_active === false) return res.status(400).json({ status: "fail", message: "You cannot deactivate your own admin account." });
        target.is_active = req.body.is_active;
        target.token_version = (target.token_version || 0) + 1;
        await target.save();
        return res.status(200).json({ status: "success", data: { id: target.id, username: target.username, is_active: target.is_active } });
    } catch (error) { return res.status(500).json({ status: "fail", message: error.message }); }
};

exports.createAdmin = async (req, res) => {
    try {
        const username = typeof req.body.username === "string" ? req.body.username.trim() : "";
        const password = typeof req.body.password === "string" ? req.body.password : "";
        if (username.length < 3 || password.length < 8) {
            return res.status(400).json({ status: "fail", message: "username must contain at least 3 characters and password at least 8 characters." });
        }
        const admin = await PlatformAdmin.create({
            id: req.body.id || await nextNumericId(PlatformAdmin),
            username,
            password_hash: password,
            is_active: req.body.is_active !== false
        });
        return res.status(201).json({ status: "success", data: { id: admin.id, username: admin.username, is_active: admin.is_active, created_at: admin.created_at } });
    } catch (error) {
        return res.status(error.code === 11000 ? 409 : 400).json({ status: "fail", message: error.code === 11000 ? "Admin ID or username already exists." : error.message });
    }
};

exports.updateAdmin = async (req, res) => {
    try {
        const admin = await PlatformAdmin.findOne({ id: Number(req.params.adminId) });
        if (!admin) return res.status(404).json({ status: "fail", message: "Admin not found." });
        if (req.body.username !== undefined) {
            const username = String(req.body.username).trim();
            if (username.length < 3) return res.status(400).json({ status: "fail", message: "username must contain at least 3 characters." });
            admin.username = username;
        }
        if (req.body.is_active !== undefined) {
            if (typeof req.body.is_active !== "boolean") return res.status(400).json({ status: "fail", message: "is_active must be boolean." });
            if (admin.id === req.admin.admin_id && req.body.is_active === false) return res.status(400).json({ status: "fail", message: "You cannot deactivate your own admin account." });
            admin.is_active = req.body.is_active;
            admin.token_version = (admin.token_version || 0) + 1;
        }
        await admin.save();
        return res.status(200).json({ status: "success", data: { id: admin.id, username: admin.username, is_active: admin.is_active } });
    } catch (error) {
        return res.status(error.code === 11000 ? 409 : 400).json({ status: "fail", message: error.code === 11000 ? "Username already exists." : error.message });
    }
};

exports.resetAdminPassword = async (req, res) => {
    try {
        const { password, confirmPassword } = req.body;
        if (typeof password !== "string" || password.length < 8) return res.status(400).json({ status: "fail", message: "password must contain at least 8 characters." });
        if (password !== confirmPassword) return res.status(400).json({ status: "fail", message: "Passwords do not match." });
        const admin = await PlatformAdmin.findOne({ id: Number(req.params.adminId) }).select("+password_hash");
        if (!admin) return res.status(404).json({ status: "fail", message: "Admin not found." });
        admin.password_hash = password;
        admin.token_version = (admin.token_version || 0) + 1;
        await admin.save();
        return res.status(200).json({ status: "success", message: "Admin password reset successfully. Existing admin tokens are now invalid." });
    } catch (error) { return res.status(500).json({ status: "fail", message: error.message }); }
};

exports.listPlatformTests = async (req, res) => {
    try {
        const { page, limit, skip } = pagination(req.query);
        const filter = {};
        if (req.query.is_active !== undefined) filter.is_active = req.query.is_active === "true";
        if (req.query.exam_type) filter.exam_type = req.query.exam_type;
        const [data, total] = await Promise.all([PlatformTest.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit).lean(), PlatformTest.countDocuments(filter)]);
        return paginatedResponse(res, page, limit, total, data);
    } catch (error) { return res.status(500).json({ status: "fail", message: error.message }); }
};

exports.createPlatformTest = async (req, res) => {
    try {
        const test = await PlatformTest.create({ ...req.body, id: req.body.id || await nextNumericId(PlatformTest) });
        return res.status(201).json({ status: "success", data: test });
    } catch (error) { return res.status(error.code === 11000 ? 409 : 400).json({ status: "fail", message: error.message }); }
};

exports.updatePlatformTest = async (req, res) => {
    try {
        const { id, ...updates } = req.body;
        const test = await PlatformTest.findOneAndUpdate({ id: Number(req.params.testId) }, updates, { returnDocument: "after", runValidators: true });
        if (!test) return res.status(404).json({ status: "fail", message: "Platform test not found." });
        return res.status(200).json({ status: "success", data: test });
    } catch (error) { return res.status(400).json({ status: "fail", message: error.message }); }
};

exports.listTestSessions = async (req, res) => {
    try {
        const { page, limit, skip } = pagination(req.query);
        const filter = {};
        if (req.query.student_id) filter.student_id = req.query.student_id;
        if (req.query.status) filter.status = req.query.status;
        if (req.query.test_type) filter.test_type = req.query.test_type;
        const [data, total] = await Promise.all([TestSession.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(), TestSession.countDocuments(filter)]);
        return paginatedResponse(res, page, limit, total, data);
    } catch (error) { return res.status(500).json({ status: "fail", message: error.message }); }
};

exports.getTestSession = async (req, res) => {
    try {
        const session = await TestSession.findById(req.params.sessionId).lean();
        if (!session) return res.status(404).json({ status: "fail", message: "Test session not found." });
        return res.status(200).json({ status: "success", data: session });
    } catch (error) { return res.status(400).json({ status: "fail", message: "Invalid sessionId." }); }
};

const validatePreviousYearMapping = async body => {
    const questionIds = Array.isArray(body.question_ids) ? [...new Set(body.question_ids.map(Number))] : [];
    if (questionIds.some(id => !Number.isInteger(id))) throw new Error("question_ids must contain only numeric IDs.");
    if (questionIds.length) {
        const found = await Question.countDocuments({ id: { $in: questionIds } });
        if (found !== questionIds.length) throw new Error("One or more question_ids do not exist in questions.");
    }
    return questionIds;
};

exports.listAdminPreviousYearTests = async (req, res) => {
    try {
        const { page, limit, skip } = pagination(req.query);
        const filter = req.query.is_active === undefined ? {} : { is_active: req.query.is_active === "true" };
        const [data, total] = await Promise.all([PreviousYearQuestion.find(filter).sort({ name: -1 }).skip(skip).limit(limit).lean(), PreviousYearQuestion.countDocuments(filter)]);
        return paginatedResponse(res, page, limit, total, data);
    } catch (error) { return res.status(500).json({ status: "fail", message: error.message }); }
};

exports.createPreviousYearTest = async (req, res) => {
    try {
        const questionIds = await validatePreviousYearMapping(req.body);
        const questionCount = Number(req.body.question_count);
        if (!Number.isInteger(questionCount) || questionCount < 1) return res.status(400).json({ status: "fail", message: "question_count must be a positive integer." });
        if (questionIds.length && questionIds.length !== questionCount) return res.status(400).json({ status: "fail", message: "question_ids length must equal question_count when a mapping is supplied." });
        const paper = await PreviousYearQuestion.create({
            ...req.body,
            id: req.body.id || await nextNumericId(PreviousYearQuestion),
            question_count: questionCount,
            question_ids: questionIds,
            uploaded_at: req.body.uploaded_at || new Date()
        });
        return res.status(201).json({ status: "success", data: paper });
    } catch (error) { return res.status(error.code === 11000 ? 409 : 400).json({ status: "fail", message: error.message }); }
};

exports.updatePreviousYearTest = async (req, res) => {
    try {
        const { id, ...updates } = req.body;
        if (updates.question_ids !== undefined) updates.question_ids = await validatePreviousYearMapping(updates);
        const existing = await PreviousYearQuestion.findOne({ id: Number(req.params.paperId) }).lean();
        if (!existing) return res.status(404).json({ status: "fail", message: "Previous-year paper not found." });
        const expected = updates.question_count === undefined ? existing.question_count : Number(updates.question_count);
        const mapping = updates.question_ids === undefined ? existing.question_ids || [] : updates.question_ids;
        if (mapping.length && mapping.length !== expected) return res.status(400).json({ status: "fail", message: "question_ids length must equal question_count." });
        const paper = await PreviousYearQuestion.findOneAndUpdate({ id: Number(req.params.paperId) }, updates, { returnDocument: "after", runValidators: true });
        return res.status(200).json({ status: "success", data: paper });
    } catch (error) { return res.status(400).json({ status: "fail", message: error.message }); }
};
