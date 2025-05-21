const express = require("express");
const router = express.Router();
const {
  createMessage,
  getMessagesWithUser,
  getChatSummary,
} = require("../controllers/messageController");

const { authMiddleware } = require("../middlewares/authMiddleware");
const messageUpload = require("../middlewares/messageUpload");

// Send message
router.post("/", authMiddleware, messageUpload.single("image"), createMessage);

// Get chat history with another user
router.get("/:otherUserId", authMiddleware, getMessagesWithUser);

// Get chat summaries
router.get("/summary/me", authMiddleware, getChatSummary);

module.exports = router;
