const express = require("express");
const notificationController = require("../../controllers/neet-controller/notification.controller");
const { protect } = require("../../utilities/auth");

const notificationRouter = express.Router();

notificationRouter.use("/notifications", protect);

// Device token registration & deactivation for FCM push notifications
notificationRouter.post(
    "/notifications/device-token",
    notificationController.registerDeviceToken
);
notificationRouter.delete(
    "/notifications/device-token",
    notificationController.deactivateDeviceToken
);

// Admin & internal push notification dispatch
notificationRouter.post(
    "/notifications/send",
    notificationController.sendDirectNotification
);
notificationRouter.post(
    "/notifications/broadcast",
    notificationController.broadcastPushNotification
);

// In-app notifications
notificationRouter
    .route("/notifications")
    .post(notificationController.createNotification)
    .get(notificationController.listNotifications);

notificationRouter.get(
    "/notifications/unread-count",
    notificationController.getUnreadCount
);

notificationRouter.patch(
    "/notifications/read-all",
    notificationController.markAllNotificationsAsRead
);

notificationRouter.patch(
    "/notifications/:notificationId/read",
    notificationController.markNotificationAsRead
);

notificationRouter.delete(
    "/notifications/:notificationId",
    notificationController.dismissNotification
);

module.exports = notificationRouter;
