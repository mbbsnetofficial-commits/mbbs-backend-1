const express = require("express");
const platformAdminController = require("../../controllers/neet-controller/platformAdmin.controller");
const adminControlController = require("../../controllers/neet-controller/adminControl.controller");
const { protectAdmin } = require("../../utilities/adminAuth");
const { loginLimiter } = require("../../middleware/rateLimit.middleware");

const platformAdminRouter = express.Router();

platformAdminRouter.post("/login", loginLimiter, platformAdminController.loginPlatformAdmin);

platformAdminRouter.use(protectAdmin);

platformAdminRouter.get("/dashboard", adminControlController.getDashboard);
platformAdminRouter.get("/students", adminControlController.listStudents);
platformAdminRouter.patch("/students/:studentId", adminControlController.updateStudent);

platformAdminRouter.route("/questions")
    .get(adminControlController.listQuestions)
    .post(adminControlController.createQuestion);
platformAdminRouter.patch("/questions/:id", adminControlController.updateQuestion);
platformAdminRouter.patch("/questions/:id/status", adminControlController.updateQuestionStatus);

platformAdminRouter.route("/topics")
    .get(adminControlController.listTopics)
    .post(adminControlController.createTopic);
platformAdminRouter.patch("/topics/:id", adminControlController.updateTopic);
platformAdminRouter.patch("/topics/:id/status", adminControlController.updateTopicStatus);

platformAdminRouter.route("/qod")
    .get(adminControlController.listQod)
    .post(adminControlController.createQod);
platformAdminRouter.patch("/qod/:id", adminControlController.updateQod);
platformAdminRouter.patch("/qod/:id/status", adminControlController.updateQodStatus);

platformAdminRouter.get("/moderation/:resource", adminControlController.listModeration);
platformAdminRouter.patch("/moderation/:resource/:itemId", adminControlController.updateModeration);
platformAdminRouter.post("/notifications", adminControlController.sendNotification);
platformAdminRouter.post("/notifications/broadcast", adminControlController.broadcastNotification);
platformAdminRouter.get("/admins", adminControlController.listAdmins);
platformAdminRouter.post("/admins", adminControlController.createAdmin);
platformAdminRouter.patch("/admins/:adminId", adminControlController.updateAdmin);
platformAdminRouter.post("/admins/:adminId/reset-password", adminControlController.resetAdminPassword);
platformAdminRouter.patch("/admins/:adminId/status", adminControlController.updateAdminStatus);

platformAdminRouter.route("/platform-tests")
    .get(adminControlController.listPlatformTests)
    .post(adminControlController.createPlatformTest);
platformAdminRouter.patch("/platform-tests/:testId", adminControlController.updatePlatformTest);
platformAdminRouter.patch("/platform-tests/:testId/status", adminControlController.updatePlatformTestStatus);

platformAdminRouter.get("/test-sessions", adminControlController.listTestSessions);
platformAdminRouter.get("/test-sessions/:sessionId", adminControlController.getTestSession);

platformAdminRouter.route("/previous-year-tests")
    .get(adminControlController.listAdminPreviousYearTests)
    .post(adminControlController.createPreviousYearTest);
platformAdminRouter.patch("/previous-year-tests/:paperId", adminControlController.updatePreviousYearTest);
platformAdminRouter.patch("/previous-year-tests/:paperId/status", adminControlController.updatePreviousYearTestStatus);

module.exports = platformAdminRouter;
