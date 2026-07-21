const express = require("express");
const notificationController = require("../../controllers/neet-controller/notification.controller");
const { protect } = require("../../utilities/auth");

const notificationRouter = express.Router();

notificationRouter.use(protect);

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
