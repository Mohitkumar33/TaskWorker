const express = require("express");
const {
  createMessage,
  getMessages,
} = require("../controllers/messageController");
const {
  authMiddleware,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const messageUpload = require("../middlewares/messageUpload");

const router = express.Router();

// POST message (with optional image)
router.post(
  "/:taskId",
  authMiddleware,
  //   authorizeRoles("user"),
  messageUpload.single("image"),
  createMessage
);

// GET messages for a task
router.get(
  "/:taskId",
  authMiddleware,
  //  authorizeRoles("user"),
  getMessages
);

module.exports = router;
