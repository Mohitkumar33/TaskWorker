require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");


const app = express();

// Middleware
app.use(express.json());

// Connect to Database
connectDB();

// Routes
app.use("/api/auth", require("./routes/authRoutes"));

const port = 3300;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port hi ${port}`);
});
