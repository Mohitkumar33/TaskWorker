const User = require("../models/User");
const Task = require("../models/Task");

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get all providers
const getAllProviders = async (req, res) => {
  try {
    const providers = await User.find({ role: "provider" }).select("-password");
    res.json(providers);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get single user
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a user/provider
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Verify a user
const verifyUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    );
    res.json({ message: "User verified", user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Change user role
const changeUserRole = async (req, res) => {
  const { role } = req.body;
  if (!["user", "provider", "admin"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );
    res.json({ message: "Role updated", user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Change provider rank
const changeUserRank = async (req, res) => {
  const { rank } = req.body;
  if (!["Bronze", "Silver", "Gold", "Platinum"].includes(rank)) {
    return res.status(400).json({ message: "Invalid rank" });
  }
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { rank },
      { new: true }
    );
    res.json({ message: "Rank updated", user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get all tasks
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate("user", "name email");
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Edit task by admin
const editTaskByAdmin = async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json({ message: "Task updated", task: updatedTask });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete comment
const deleteComment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.comments = task.comments.filter(
      (comment) => comment._id.toString() !== req.params.commentId
    );
    await task.save();
    res.json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete reply
const deleteReply = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const comment = task.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    comment.replies = comment.replies.filter(
      (reply) => reply._id.toString() !== req.params.replyId
    );
    await task.save();

    res.json({ message: "Reply deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
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
};
