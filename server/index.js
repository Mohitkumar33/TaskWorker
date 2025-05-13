require("dotenv").config();
const express = require("express");
const http = require("http");
const connectDB = require("./config/db");
const cors = require("cors");

const taskRoutes = require("./routes/taskRoutes");
const authRoutes = require("./routes/authRoutes");
const locationRoutes = require("./routes/locationRoutes");
const { initSocket } = require("./utils/socket");
const messageRoutes = require("./routes/messageRoutes"); // <- you'll create this next
const adminRoutes = require("./routes/adminRoutes"); // <- you'll create this next

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json());

// Connect to Database
connectDB();

// Routes
app.use("/api/locations", locationRoutes); // Use location routes for Australian locations
app.use("/api/auth", authRoutes); // Use auth routes for login, register, etc.
app.use("/api/tasks", taskRoutes); // Use task routes for task management
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminRoutes); // Use admin routes for admin functionalities

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Init socket server
const io = initSocket(server);
app.set('io', io); // <-- Attach io to Express app


const PORT = process.env.PORT || 8001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
