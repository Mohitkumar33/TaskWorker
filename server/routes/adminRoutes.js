// backend/routes/adminRoutes.js

const express = require("express");
const {
  getAllUsers,
  getAllProviders,
  deleteUser,
  getAllTasks,
  deleteTask,
} = require("../controllers/adminController");

const {
  authMiddleware,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

const router = express.Router();

// ✅ All routes protected by admin role
router.use(authMiddleware, authorizeRoles("admin"));

// 🧑‍💼 User & Provider Management
router.get("/users", getAllUsers);               // Get all users
router.get("/providers", getAllProviders);       // Get all providers
router.delete("/user/:id", deleteUser);          // Delete a user or provider

// 📋 Task Management
router.get("/tasks", getAllTasks);               // Get all tasks
router.delete("/task/:id", deleteTask);          // Delete a task

module.exports = router;
