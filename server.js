// Load environment variables
require("dotenv").config();

// Core modules and middleware
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mustacheExpress = require("mustache-express");
const path = require("path");

const { connectToDatabase } = require("./db/mongoClient");

const app = express();

// Middleware
app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// View engine setup for Mustache
const mustachePath = path.join(__dirname, "views");

app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(mustachePath, "pages")); 
app.set("view engine", "mustache");
app.engine("mustache", mustacheExpress(path.join(mustachePath, "layouts"), ".mustache"));

// Routes
const helpFilesRoutes = require("./routes/helpFilesRoutes");
app.use("/api/helpfiles", helpFilesRoutes);

const mediaFilesRoutes = require("./routes/mediaFilesRoutes");
app.use("/", mediaFilesRoutes);

const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

const uploadRoutes = require("./routes/uploadRoutes");
app.use("/api/files", uploadRoutes);

const exportRoutes = require("./routes/exportRoutes");
app.use("/export", require("./routes/exportRoutes"));

const convertRoutes = require("./routes/convertRoutes");
app.use("/api/convert", convertRoutes);

const uiRoutes = require("./routes/uiRoutes");
app.use("/", uiRoutes);

// DB and Server start
connectToDatabase().then(() => {
  app.listen(process.env.PORT || 5050, () => {
    console.log(`Server running on port ${process.env.PORT || 5050}`);
  });
});