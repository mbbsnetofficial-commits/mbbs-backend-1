const express = require("express");
const notificationController = require("../../controllers/neet-controller/notification.controller");
const { protect } = require("../../utilities/auth");

const notificationRouter = express.Router();

notificationRouter.use("/notifications", protect);

// In-app notifications collection & list
notificationRouter
    .route("/notifications")
    .post(notificationController.createNotification)
    .get(notificationController.listNotifications);

// Device token registration & deactivation for FCM push notifications
notificationRouter
    .route("/notifications/device-token")
    .post(notificationController.registerDeviceToken)
    .delete(notificationController.deactivateDeviceToken);

// Direct & broadcast notification dispatch
notificationRouter.post(
    "/notifications/send",
    notificationController.sendDirectNotification
);
notificationRouter.post(
    "/notifications/broadcast",
    notificationController.broadcastPushNotification
);

// Unread count
notificationRouter.get(
    "/notifications/unread-count",
    notificationController.getUnreadCount
);

// Read state updates
notificationRouter.patch(
    "/notifications/read-all",
    notificationController.markAllNotificationsAsRead
);
notificationRouter.patch(
    "/notifications/:notificationId/read",
    notificationController.markNotificationAsRead
);

// Dismiss / delete
notificationRouter.delete(
    "/notifications/:notificationId",
    notificationController.dismissNotification
);

module.exports = notificationRouter;
