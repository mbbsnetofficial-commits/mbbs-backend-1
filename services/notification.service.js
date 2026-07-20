const Notification = require("../model/notification");

exports.createNotificationService = async ({
    userId,
    studentId,
    title,
    message,
    notificationType = "system",
    priority = "normal",
    actionUrl = null,
    data = null
}) => Notification.create({
    user_id: userId,
    student_id: studentId,
    title,
    message,
    notification_type: notificationType,
    priority,
    action_url: actionUrl,
    data
});
