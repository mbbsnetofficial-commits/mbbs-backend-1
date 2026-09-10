const mongoose = require("mongoose");
const Notification = require("../../model/neet-models/notification");
const DeviceToken = require("../../model/neet-models/deviceToken");
const { createNotificationService } = require("../../services/notification.service");
const {
    NOTIFICATION_TYPE_ENUM,
    NOTIFICATION_PRIORITY_ENUM
} = require("../../constants/enum");

const getOwnerFilter = req => ({
    user_id: req.user.id,
    student_id: req.user.student_id,
    is_deleted: false
});

exports.createNotification = async (req, res) => {
    try {
        const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
        const message = typeof req.body.message === "string" ? req.body.message.trim() : "";
        const notificationType = req.body.notification_type || "system";
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
        if (!NOTIFICATION_TYPE_ENUM.includes(notificationType)) {
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
            notificationType,
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
            { new: true, runValidators: true }
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
            { new: true }
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

exports.registerDeviceToken = async (req, res) => {
    try {
        const { token, device_type = "android", device_id, app_version } = req.body;
        if (!token || typeof token !== "string" || !token.trim()) {
            return res.status(400).json({
                status: "fail",
                message: "token is required."
            });
        }

        const cleanToken = token.trim();
        const validDeviceType = ["android", "ios", "web"].includes(String(device_type).toLowerCase())
            ? String(device_type).toLowerCase()
            : "android";

        await DeviceToken.findOneAndUpdate(
            { token: cleanToken },
            {
                user_id: req.user.id,
                student_id: req.user.student_id,
                token: cleanToken,
                device_type: validDeviceType,
                device_id: device_id || null,
                app_version: app_version || null,
                is_active: true
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return res.status(200).json({
            status: "success",
            message: "Device token registered successfully."
        });
    } catch (error) {
        return res.status(500).json({ status: "fail", message: error.message });
    }
};

exports.deactivateDeviceToken = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token || typeof token !== "string" || !token.trim()) {
            return res.status(400).json({
                status: "fail",
                message: "token is required."
            });
        }

        await DeviceToken.updateOne(
            { token: token.trim(), user_id: req.user.id },
            { $set: { is_active: false } }
        );

        return res.status(200).json({
            status: "success",
            message: "Device token deactivated successfully."
        });
    } catch (error) {
        return res.status(500).json({ status: "fail", message: error.message });
    }
};
