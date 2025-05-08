// Load environment variables
require("dotenv").config();

// Core modules and middleware
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const { connectToDatabase } = require("./db/mongoClient");

const app = express();

// Middleware
app.use(cookieParser());
app.use(cors());
app.use(express.json());

// Routes
const helpFilesRoutes = require("./routes/helpFilesRoutes");
app.use("/api/helpfiles", helpFilesRoutes);

const mediaFilesRoutes = require("./routes/mediaFilesRoutes");
app.use("/api/mediafiles", mediaFilesRoutes);

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

// DB and Server start
connectToDatabase().then(() => {
  app.listen(process.env.PORT || 5050, () => {
    console.log(`Server running on port ${process.env.PORT || 5050}`);
  });
});