const express = require("express");
const { protect, optionalProtect } = require("../../utilities/auth");
const { validate } = require("../../middleware/blog-middleware/aurthor.middleware");
const authorFollowController = require("../../controllers/neet-controller/authorFollow.controller");
const {
    listAuthorsSchema,
    authorIdSchema
} = require("../../validation/authorFollow.validation");

const authorFollowRouter = express.Router();

authorFollowRouter.get(
    "/authors",
    optionalProtect,
    validate(listAuthorsSchema, "query"),
    authorFollowController.listAuthors
);
authorFollowRouter.get(
    "/authors/following",
    protect,
    validate(listAuthorsSchema, "query"),
    authorFollowController.listFollowing
);
authorFollowRouter.get(
    "/authors/:authorId",
    optionalProtect,
    validate(authorIdSchema, "params"),
    authorFollowController.getAuthor
);
authorFollowRouter.post(
    "/authors/:authorId/follow",
    protect,
    validate(authorIdSchema, "params"),
    authorFollowController.followAuthor
);
authorFollowRouter.delete(
    "/authors/:authorId/follow",
    protect,
    validate(authorIdSchema, "params"),
    authorFollowController.unfollowAuthor
);

module.exports = authorFollowRouter;
