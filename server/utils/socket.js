// socket.js
const { Server } = require("socket.io");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // You can restrict this in production
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 New client connected:", socket.id);

    socket.on("joinTask", ({ taskId, userId }) => {
      const roomName = taskId;
      socket.join(roomName);
      console.log(`${userId} joined task room ${roomName}`);
    });

    socket.on("sendMessage", ({ taskId, sender, text, image }) => {
      const messageData = {
        taskId,
        sender,
        text,
        image,
        timestamp: new Date(),
      };
      io.to(taskId).emit("receiveMessage", messageData);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Client disconnected:", socket.id);
    });
  });

  return io;
};

module.exports = { initSocket };
