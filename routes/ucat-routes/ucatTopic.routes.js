"use strict";

const express = require("express");
const router = express.Router();

const topicController = require("../../controllers/ucat-controller/topics.controller");

// GET /api/v1/ucat/topics - Fetch all active UCAT topics
router.get("/", topicController.getAllTopics);

// GET /api/v1/ucat/topics/section/:section/names - Fetch topic names and IDs for a section
router.get("/section/:section/names", topicController.getTopicNamesBySection);

// GET /api/v1/ucat/topics/section/:section - Fetch full topic details for a section
router.get("/section/:section", topicController.getTopicsBySection);

// GET /api/v1/ucat/topics/:id - Fetch single UCAT topic by numeric ID
router.get("/:id", topicController.getTopicById);

module.exports = router;
