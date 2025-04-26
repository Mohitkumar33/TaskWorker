const Message = require("../models/Message");

const createMessage = async (req, res) => {
  const { text, receiverId } = req.body;
  const { taskId } = req.params;

  try {
    const message = new Message({
      taskId,
      sender: req.user.id,
      receiver: receiverId,
      text,
      image: req.file?.path || null,
    });
    // console.log("Message created:", message);
    await message.save();
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
