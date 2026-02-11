const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

const route = require("../src/Routes/route");

app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// MongoDB connection caching for serverless
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("MongoDB connected (serverless)");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    throw err;
  }
}

// Connect before handling requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ status: false, message: "Database connection failed" });
  }
});

app.use("/api", route);

// Health check
app.get("/", (req, res) => {
  res.json({ status: true, message: "Impulse API is running" });
});

module.exports = app;
