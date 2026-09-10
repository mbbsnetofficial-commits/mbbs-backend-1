const express = require("express");
const notificationController = require("../../controllers/neet-controller/notification.controller");
const { protect } = require("../../utilities/auth");

const notificationRouter = express.Router();

notificationRouter.use("/notifications", protect);

notificationRouter
    .route("/notifications")
    .post(notificationController.createNotification)
    .get(notificationController.listNotifications);

notificationRouter
    .route("/notifications/device-token")
    .post(notificationController.registerDeviceToken)
    .delete(notificationController.deactivateDeviceToken);

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
