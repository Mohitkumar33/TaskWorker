const Message = require("../models/Message");

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

module.exports = { createMessage, getMessages };
