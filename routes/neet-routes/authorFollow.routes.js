const express = require("express");
const { protect } = require("../../utilities/auth");
const { validate } = require("../../middleware/blog-middleware/aurthor.middleware");
const authorFollowController = require("../../controllers/neet-controller/authorFollow.controller");
const {
    listAuthorsSchema,
    authorIdSchema
} = require("../../validation/authorFollow.validation");

const authorFollowRouter = express.Router();

authorFollowRouter.use(protect);

authorFollowRouter.get(
    "/authors",
    validate(listAuthorsSchema, "query"),
    authorFollowController.listAuthors
);
authorFollowRouter.get(
    "/authors/following",
    validate(listAuthorsSchema, "query"),
    authorFollowController.listFollowing
);
authorFollowRouter.get(
    "/authors/:authorId",
    validate(authorIdSchema, "params"),
    authorFollowController.getAuthor
);
authorFollowRouter.post(
    "/authors/:authorId/follow",
    validate(authorIdSchema, "params"),
    authorFollowController.followAuthor
);
authorFollowRouter.delete(
    "/authors/:authorId/follow",
    validate(authorIdSchema, "params"),
    authorFollowController.unfollowAuthor
);

module.exports = authorFollowRouter;
