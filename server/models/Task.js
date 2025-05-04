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
      required: false,
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
    location: {
      type: {
        type: String,
        enum: ['remote', 'physical'],
        required: true,
      },
      address: {
        type: String,
        required: function () {
          return this.type === 'physical'; // Only required if physical
        },
      },
      lat: {
        type: Number,
        required: function () {
          return this.type === 'physical';
        },
      },
      lng: {
        type: Number,
        required: function () {
          return this.type === 'physical';
        },
      },
    },
    
    assignedProvider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    review: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String },
    },
    images: [{ type: String }],
    category: {
      type: String,
      enum: [
        "Cleaning",
        "Plumbing",
        "Electrical",
        "Handyman",
        "Moving",
        "Delivery",
        "Gardening",
        "Tutoring",
        "Tech Support",
        "Other",
      ],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", TaskSchema);
