// backend/routes/adminRoutes.js

const express = require("express");
const {
  getAllUsers,
  getAllProviders,
  getUserById,
  deleteUser,
  verifyUser,
  changeUserRole,
  changeUserRank,
  getAllTasks,
  deleteTask,
  editTaskByAdmin,
  deleteComment,
  deleteReply,
} = require("../controllers/adminController");

const {
  authMiddleware,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

const router = express.Router();

// ✅ All routes protected by admin role
router.use(authMiddleware, authorizeRoles("admin"));

// 🧑‍💼 User & Provider Management
router.get("/users", getAllUsers);
router.get("/providers", getAllProviders);
router.get("/users/:id", getUserById);
router.delete("/user/:id", deleteUser);
router.put("/users/:id/verify", verifyUser);
router.put("/users/:id/role", changeUserRole);
router.put("/users/:id/rank", changeUserRank);

// 📋 Task Management
router.get("/tasks", getAllTasks);
router.delete("/task/:id", deleteTask);
router.put("/tasks/:id/edit", editTaskByAdmin);

// 💬 Comment & Reply Moderation
router.delete("/tasks/:taskId/comments/:commentId", deleteComment);
router.delete("/tasks/:taskId/comments/:commentId/replies/:replyId", deleteReply);

module.exports = router;
