const mongoose = require("mongoose");
const Notification = require("../../model/neet-models/notification");
const Auth = require("../../model/neet-models/auth");
const {
    createNotificationService,
    registerDeviceTokenService,
    deactivateDeviceTokenService,
    sendNotificationToUser,
    sendNotificationToUsers,
    sendDirectPushToSingleToken,
    broadcastNotificationService,
    sendIncompleteTestNotificationService,
    sendUniversityInviteNotificationService,
    checkIncompleteTestSessionsAndNotifyService
} = require("../../services/notification.service");
const {
    NOTIFICATION_TYPE_ENUM,
    NOTIFICATION_PRIORITY_ENUM
} = require("../../constants/enum");

const getOwnerFilter = req => ({
    user_id: req.user.id,
    student_id: req.user.student_id,
    is_deleted: false
});

/**
 * Diagnostic test endpoint to test iOS/Android push notification directly with a token
 */
exports.testDeviceTokenPush = async (req, res) => {
    try {
        const token = req.body.token || req.body.deviceToken || req.body.fcmToken;
        const title = req.body.title || "MBBS.net iOS Test";
        const body = req.body.body || req.body.message || "Push notification is working perfectly on your device!";
        const data = req.body.data || {};

        if (!token || typeof token !== "string" || !token.trim()) {
            return res.status(400).json({
                status: "fail",
                success: false,
                message: "token is required and must be a non-empty string."
            });
        }

        const result = await sendDirectPushToSingleToken({
            token: token.trim(),
            title,
            body,
            data
        });

        return res.status(200).json({
            status: "success",
            success: true,
            message: "Push notification successfully delivered to FCM gateway.",
            data: result
        });
    } catch (error) {
        return res.status(500).json({
            status: "fail",
            success: false,
            message: error.message,
            code: error.code || null
        });
    }
};

exports.registerDeviceToken = async (req, res) => {
    try {
        const token = req.body.token || req.body.deviceToken || req.body.fcmToken;
        const deviceType = req.body.deviceType || req.body.device_type || "android";
        const deviceId = req.body.deviceId || req.body.device_id || null;
        const appVersion = req.body.appVersion || req.body.app_version || null;

        if (!token || typeof token !== "string" || !token.trim()) {
            return res.status(400).json({
                status: "fail",
                success: false,
                message: "token is required and must be a non-empty string."
            });
        }

        const deviceRecord = await registerDeviceTokenService({
            userId: req.user.id,
            studentId: req.user.student_id,
            token: token.trim(),
            deviceType,
            deviceId,
            appVersion
        });

        return res.status(200).json({
            status: "success",
            success: true,
            message: "FCM device token registered successfully.",
            data: {
                _id: deviceRecord._id,
                device_type: deviceRecord.device_type,
                device_id: deviceRecord.device_id,
                app_version: deviceRecord.app_version,
                is_active: deviceRecord.is_active,
                last_used_at: deviceRecord.last_used_at
            }
        });
    } catch (error) {
        return res.status(500).json({ status: "fail", success: false, message: error.message });
    }
};

exports.deactivateDeviceToken = async (req, res) => {
    try {
        const token = req.body.token || req.body.deviceToken || req.body.fcmToken || req.query.token;
        const deviceId = req.body.deviceId || req.body.device_id || req.query.deviceId;

        if (!token && !deviceId) {
            return res.status(400).json({
                status: "fail",
                success: false,
                message: "token or deviceId is required."
            });
        }

        await deactivateDeviceTokenService({
            userId: req.user.id,
            token,
            deviceId
        });

        return res.status(200).json({
            status: "success",
            success: true,
            message: "Device token deactivated successfully."
        });
    } catch (error) {
        return res.status(500).json({ status: "fail", success: false, message: error.message });
    }
};

exports.createNotification = async (req, res) => {
    try {
        const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
        const message = typeof req.body.message === "string" ? req.body.message.trim() : "";
        const notificationType = req.body.notification_type || req.body.type || "system";
        const priority = req.body.priority || "normal";
        const actionUrl = typeof req.body.action_url === "string"
            ? req.body.action_url.trim() || null
            : null;

        if (!title || title.length > 150) {
            return res.status(400).json({
                status: "fail",
                message: "title is required and cannot exceed 150 characters."
            });
        }
        if (!message || message.length > 1000) {
            return res.status(400).json({
                status: "fail",
                message: "message is required and cannot exceed 1000 characters."
            });
        }
        const normalizedType = String(notificationType).toLowerCase();
        if (!NOTIFICATION_TYPE_ENUM.includes(normalizedType)) {
            return res.status(400).json({
                status: "fail",
                message: `notification_type must be one of: ${NOTIFICATION_TYPE_ENUM.join(", ")}.`
            });
        }
        if (!NOTIFICATION_PRIORITY_ENUM.includes(priority)) {
            return res.status(400).json({
                status: "fail",
                message: `priority must be one of: ${NOTIFICATION_PRIORITY_ENUM.join(", ")}.`
            });
        }

        const notification = await createNotificationService({
            userId: req.user.id,
            studentId: req.user.student_id,
            title,
            message,
            notificationType: normalizedType,
            priority,
            actionUrl,
            data: req.body.data ?? null
        });

        return res.status(201).json({
            status: "success",
            message: "Notification created successfully.",
            data: notification
        });
    } catch (error) {
        return res.status(500).json({ status: "fail", message: error.message });
    }
};

exports.sendDirectNotification = async (req, res) => {
    try {
        let targetUserId = req.body.userId || req.body.user_id;
        let targetUserIds = req.body.userIds || req.body.user_ids;
        const targetStudentId = req.body.studentId || req.body.student_id;
        const targetStudentIds = req.body.studentIds || req.body.student_ids;

        const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
        const body = typeof req.body.body === "string"
            ? req.body.body.trim()
            : typeof req.body.message === "string"
                ? req.body.message.trim()
                : "";
        const notificationType = req.body.type || req.body.notification_type || "GENERAL";
        const priority = req.body.priority || "high";
        const actionUrl = req.body.actionUrl || req.body.action_url || null;
        const data = req.body.data || {};

        if (!title) {
            return res.status(400).json({
                status: "fail",
                success: false,
                message: "title is required."
            });
        }
        if (!body) {
            return res.status(400).json({
                status: "fail",
                success: false,
                message: "body/message is required."
            });
        }

        if (!targetUserIds && Array.isArray(targetStudentIds) && targetStudentIds.length > 0) {
            const foundUsers = await Auth.find({ student_id: { $in: targetStudentIds } }).select("_id").lean();
            targetUserIds = foundUsers.map(u => u._id);
        }

        if (!targetUserId && !targetUserIds && targetStudentId) {
            const foundUser = await Auth.findOne({ student_id: targetStudentId }).select("_id").lean();
            if (foundUser) {
                targetUserId = foundUser._id;
            } else {
                return res.status(404).json({
                    status: "fail",
                    success: false,
                    message: "Student with specified student_id not found."
                });
            }
        }

        if (Array.isArray(targetUserIds) && targetUserIds.length > 0) {
            const result = await sendNotificationToUsers(targetUserIds, {
                title,
                body,
                data,
                notificationType,
                priority,
                actionUrl
            });
            return res.status(200).json({
                status: "success",
                success: true,
                message: "Notifications sent to user list.",
                data: result
            });
        }

        if (!targetUserId) {
            return res.status(400).json({
                status: "fail",
                success: false,
                message: "userId, userIds, student_id, or student_ids is required."
            });
        }

        if (!mongoose.isValidObjectId(targetUserId)) {
            return res.status(400).json({
                status: "fail",
                success: false,
                message: "Invalid userId format."
            });
        }

        const result = await sendNotificationToUser(targetUserId, {
            title,
            body,
            data,
            notificationType,
            priority,
            actionUrl
        });

        return res.status(200).json({
            status: "success",
            success: true,
            message: "Notification sent successfully.",
            data: result
        });
    } catch (error) {
        return res.status(500).json({ status: "fail", success: false, message: error.message });
    }
};

exports.broadcastPushNotification = async (req, res) => {
    try {
        const {
            audience = "ALL_STUDENTS",
            studentIds = [],
            student_ids = [],
            batch,
            course,
            year,
            title,
            message,
            body,
            notification_type,
            type,
            priority = "high",
            action_url,
            actionUrl,
            data,
            sendPush = true
        } = req.body;

        const effectiveStudentIds = Array.isArray(studentIds) && studentIds.length > 0
            ? studentIds
            : Array.isArray(student_ids)
                ? student_ids
                : [];

        const textTitle = typeof title === "string" ? title.trim() : "";
        const textBody = typeof body === "string" ? body.trim() : typeof message === "string" ? message.trim() : "";

        if (!textTitle || !textBody) {
            return res.status(400).json({
                status: "fail",
                success: false,
                message: "title and body/message are required."
            });
        }

        const result = await broadcastNotificationService({
            audience,
            studentIds: effectiveStudentIds,
            batch,
            course,
            year,
            title: textTitle,
            body: textBody,
            notificationType: type || notification_type || "GENERAL",
            priority,
            actionUrl: actionUrl || action_url || null,
            data: data || {},
            sendPush: Boolean(sendPush)
        });

        return res.status(200).json({
            status: "success",
            success: true,
            message: "Broadcast notification processed successfully.",
            data: result
        });
    } catch (error) {
        return res.status(500).json({ status: "fail", success: false, message: error.message });
    }
};

/**
 * Automated Push Notification for Incomplete/Abandoned Test Session
 */
exports.sendIncompleteTestNotification = async (req, res) => {
    try {
        const sessionId = req.body.sessionId || req.body.session_id || req.params.sessionId;
        const studentId = req.body.studentId || req.body.student_id || req.user?.student_id;
        const userId = req.body.userId || req.body.user_id || req.user?.id;
        const testType = req.body.testType || req.body.test_type || "Test";

        const result = await sendIncompleteTestNotificationService({
            sessionId,
            userId,
            studentId,
            testType
        });

        return res.status(200).json({
            status: "success",
            success: true,
            message: "Incomplete test reminder notification sent successfully.",
            data: result
        });
    } catch (error) {
        return res.status(400).json({ status: "fail", success: false, message: error.message });
    }
};

/**
 * Automated Push Notification for University Invites
 */
exports.sendUniversityInviteNotification = async (req, res) => {
    try {
        const universityName = req.body.university_name || req.body.universityName || req.body.name;
        const studentId = req.body.student_id || req.body.studentId || req.user?.student_id;
        const userId = req.body.user_id || req.body.userId || req.user?.id;
        const email = req.body.email;
        const phoneNumber = req.body.phoneNumber || req.body.phone_number;
        const programName = req.body.program_name || req.body.programName || req.body.course;
        const inviteId = req.body.invite_id || req.body.inviteId || req.body.id;
        const actionUrl = req.body.action_url || req.body.actionUrl;
        const customMessage = req.body.message || req.body.custom_message;
        const expiryDate = req.body.expiry_date || req.body.expiryDate;
        const data = req.body.data || {};

        if (!universityName || !String(universityName).trim()) {
            return res.status(400).json({
                status: "fail",
                success: false,
                message: "university_name is required."
            });
        }

        const result = await sendUniversityInviteNotificationService({
            userId,
            studentId,
            email,
            phoneNumber,
            universityName,
            programName,
            inviteId,
            actionUrl,
            customMessage,
            expiryDate,
            data
        });

        return res.status(200).json({
            status: "success",
            success: true,
            message: `University invite push notification for ${universityName} sent successfully.`,
            data: result
        });
    } catch (error) {
        return res.status(400).json({ status: "fail", success: false, message: error.message });
    }
};

/**
 * Background / Cron Trigger to scan and send reminders for incomplete test sessions
 */
exports.checkIncompleteTestSessions = async (req, res) => {
    try {
        const inactivityMinutes = Number(req.body.inactivity_minutes || req.query.inactivity_minutes) || 5;
        const scanResult = await checkIncompleteTestSessionsAndNotifyService({ inactivityMinutes });

        return res.status(200).json({
            status: "success",
            success: true,
            message: "Incomplete test sessions scan completed.",
            data: scanResult
        });
    } catch (error) {
        return res.status(500).json({ status: "fail", success: false, message: error.message });
    }
};

exports.listNotifications = async (req, res) => {
    try {
        const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100);
        const filter = getOwnerFilter(req);

        if (req.query.is_read !== undefined) {
            if (!["true", "false"].includes(req.query.is_read)) {
                return res.status(400).json({
                    status: "fail",
                    message: "is_read must be true or false."
                });
            }
            filter.is_read = req.query.is_read === "true";
        }
        if (req.query.notification_type) {
            if (!NOTIFICATION_TYPE_ENUM.includes(req.query.notification_type)) {
                return res.status(400).json({
                    status: "fail",
                    message: `notification_type must be one of: ${NOTIFICATION_TYPE_ENUM.join(", ")}.`
                });
            }
            filter.notification_type = req.query.notification_type;
        }

        const [notifications, total] = await Promise.all([
            Notification.find(filter)
                .sort({ created_at: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Notification.countDocuments(filter)
        ]);

        return res.status(200).json({
            status: "success",
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data: notifications
        });
    } catch (error) {
        return res.status(500).json({ status: "fail", message: error.message });
    }
};

exports.getUnreadCount = async (req, res) => {
    try {
        const unreadCount = await Notification.countDocuments({
            ...getOwnerFilter(req),
            is_read: false
        });

        return res.status(200).json({
            status: "success",
            data: { unread_count: unreadCount }
        });
    } catch (error) {
        return res.status(500).json({ status: "fail", message: error.message });
    }
};

exports.markNotificationAsRead = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.notificationId)) {
            return res.status(400).json({ status: "fail", message: "Invalid notificationId." });
        }

        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.notificationId, ...getOwnerFilter(req) },
            { $set: { is_read: true, read_at: new Date() } },
            { returnDocument: "after", runValidators: true }
        );

        if (!notification) {
            return res.status(404).json({ status: "fail", message: "Notification not found." });
        }

        return res.status(200).json({
            status: "success",
            message: "Notification marked as read.",
            data: notification
        });
    } catch (error) {
        return res.status(500).json({ status: "fail", message: error.message });
    }
};

exports.markAllNotificationsAsRead = async (req, res) => {
    try {
        const result = await Notification.updateMany(
            { ...getOwnerFilter(req), is_read: false },
            { $set: { is_read: true, read_at: new Date() } }
        );

        return res.status(200).json({
            status: "success",
            message: "All notifications marked as read.",
            data: { updated_count: result.modifiedCount }
        });
    } catch (error) {
        return res.status(500).json({ status: "fail", message: error.message });
    }
};

exports.dismissNotification = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.notificationId)) {
            return res.status(400).json({ status: "fail", message: "Invalid notificationId." });
        }

        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.notificationId, ...getOwnerFilter(req) },
            { $set: { is_deleted: true, deleted_at: new Date() } },
            { returnDocument: "after" }
        );

        if (!notification) {
            return res.status(404).json({ status: "fail", message: "Notification not found." });
        }

        return res.status(200).json({
            status: "success",
            message: "Notification dismissed successfully."
        });
    } catch (error) {
        return res.status(500).json({ status: "fail", message: error.message });
    }
};
