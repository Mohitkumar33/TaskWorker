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
  acceptBid,
  completeTask,
} = require("../controllers/taskController");
const taskUpload = require("../middlewares/taskUpload");

const router = express.Router();

// Routes for Task management
router.post(
  "/",
  authMiddleware,
  authorizeRoles("user"),
  taskUpload.array("images", 5),
  createTask
); // Only users can create tasks
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

// Route for accepting a bid and assigning the provider
router.put(
  "/:id/acceptBid/:bidId",
  authMiddleware,
  authorizeRoles("user"),
  acceptBid
); // Only task creators can accept a bid

// Route for marking task as completed and providing a review
router.put(
  "/:id/completeTask",
  authMiddleware,
  authorizeRoles("user"),
  completeTask
); // Only task creators can complete task

module.exports = router;
