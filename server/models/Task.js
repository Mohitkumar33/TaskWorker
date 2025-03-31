// backend/models/Task.js

const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    budget: {
      type: Number,
      required: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "In Progress", "Completed", "Cancelled"], 
      default: "Active",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bids: [
      {
        provider: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        price: Number,
        estimatedTime: { type: String, required: true },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    assignedProvider: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    review: {
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String }
      }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", TaskSchema);
