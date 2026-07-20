const express = require("express");
const studentActivityController = require("../controllers/studentActivity.controller");
const { protect } = require("../utilities/auth");

const studentActivityRouter = express.Router();

studentActivityRouter.use(protect);

studentActivityRouter.post(
    "/student-activity",
    studentActivityController.recordStudentActivity
);

studentActivityRouter.get(
    "/student-activity/me",
    studentActivityController.getMyStudentActivity
);

module.exports = studentActivityRouter;
