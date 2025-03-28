// backend/routes/taskRoutes.js

const express = require("express");
const {
  authMiddleware,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const {
  createTask,
  getTasks,
  getTask,
  updateTaskStatus,
  deleteTask,
  bidOnTask,
} = require("../controllers/taskController");

const router = express.Router();

// Routes for Task management
router.post("/", authMiddleware, authorizeRoles("user"), createTask); // Only users can create tasks
router.get("/", authMiddleware, getTasks); // Get all tasks
router.get("/:id", authMiddleware, getTask); // Get task by ID
router.put(
  "/:id/status",
  authMiddleware,
  authorizeRoles("admin", "user"),
  updateTaskStatus
); // Update task status
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("user", "admin"),
  deleteTask
); // Delete task

// Routes for bidding on tasks
router.post("/:id/bid", authMiddleware, authorizeRoles("provider"), bidOnTask); // Only providers can bid

module.exports = router;
