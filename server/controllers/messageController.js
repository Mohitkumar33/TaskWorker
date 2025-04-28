const Message = require("../models/Message");
const mongoose = require('mongoose');

const createMessage = async (req, res) => {
  const { text, receiverId } = req.body;
  const { taskId } = req.params;
  const io = req.app.get('io'); // get the socket server instance

  try {
    const message = new Message({
      taskId,
      sender: req.user.id,
      receiver: receiverId,
      text: text || '[Image]',
      image: req.file?.path || null,
    });
    console.log("Message created:", message);

    await message.save();

    // Emit the message via WebSocket to the task room
    if (io) {
      io.to(taskId).emit('receiveMessage', {
        sender: { _id: message.sender },
        receiver: message.receiver,
        text: message.text,
        image: message.image,
        timestamp: message.timestamp,
      });
      console.log("📢 Emitted message to room:", taskId);
    }

    res.status(201).json(message);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

const getMessages = async (req, res) => {
  const { taskId } = req.params;

  try {
    const messages = await Message.find({ taskId })
      .populate("sender", "name profilePhoto")
      .sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

const getChatSummary = async (req, res) => {
  const userId = req.params.userId;

  try {
    const chats = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: new mongoose.Types.ObjectId(userId) },
            { receiver: new mongoose.Types.ObjectId(userId) }
          ]
        }
      },
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: "$taskId",
          lastMessage: { $first: "$text" },
          lastImage: { $first: "$image" },
          lastTimestamp: { $first: "$timestamp" },
          sender: { $first: "$sender" },
          receiver: { $first: "$receiver" },
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "receiver",
          foreignField: "_id",
          as: "receiverInfo"
        }
      },
      {
        $unwind: { path: "$receiverInfo", preserveNullAndEmptyArrays: true }
      },
      {
        $lookup: {
          from: "users",
          localField: "sender",
          foreignField: "_id",
          as: "senderInfo"
        }
      },
      {
        $unwind: { path: "$senderInfo", preserveNullAndEmptyArrays: true }
      },
      {
        $addFields: {
          chatPartner: {
            $cond: [
              { $eq: ["$sender", new mongoose.Types.ObjectId(userId)] },
              "$receiverInfo",
              "$senderInfo"
            ]
          }
        }
      },
      {
        $project: {
          _id: 0,
          taskId: "$_id",
          lastMessage: 1,
          lastImage: 1,
          lastTimestamp: 1,
          partnerName: "$chatPartner.name",
          partnerProfilePhoto: "$chatPartner.profilePhoto"
        }
      },
      {
        $sort: { lastTimestamp: -1 }
      }
    ]);

    res.json(chats);
  } catch (err) {
    console.error('❌ Error getting chat summary:', err);
    res.status(500).send("Server Error");
  }
};

module.exports = { createMessage, getMessages, getChatSummary };


