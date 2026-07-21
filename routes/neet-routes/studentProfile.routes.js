const express = require("express");
const studentProfileController = require("../../controllers/neet-controller/studentProfile.controller");
const { protect } = require("../../utilities/auth");

const studentProfileRouter = express.Router();

studentProfileRouter.use(protect);

studentProfileRouter.post(
    "/student-profile",
    studentProfileController.createOrUpdateStudentProfile
);

studentProfileRouter.get(
    "/student-profile/me",
    studentProfileController.getMyStudentProfile
);

module.exports = studentProfileRouter;
