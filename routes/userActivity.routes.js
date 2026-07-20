const express = require("express");
const userActivityController = require("../controllers/userActivity.controller");
const { protect } = require("../utilities/auth");

const userActivityRouter = express.Router();

userActivityRouter.use(protect);

userActivityRouter.post(
    "/user-activity",
    userActivityController.recordUserActivity
);

userActivityRouter.get(
    "/user-activity/:userId",
    userActivityController.getUserActivity
);

module.exports = userActivityRouter;
