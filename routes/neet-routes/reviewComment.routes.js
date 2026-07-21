const express = require("express");
const reviewCommentController = require("../../controllers/neet-controller/reviewComment.controller");
const { protect } = require("../../utilities/auth");

const reviewCommentRouter = express.Router();

reviewCommentRouter.use(protect);

reviewCommentRouter
    .route("/review-comments")
    .post(reviewCommentController.createReviewComment)
    .get(reviewCommentController.listMyReviewComments);

module.exports = reviewCommentRouter;
