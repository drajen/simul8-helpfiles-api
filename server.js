const express = require("express");
const cors = require("cors");
const { connectToDatabase } = require("./db/mongoClient");

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

const helpFilesRoutes = require("./routes/helpFilesRoutes");
app.use("/api/helpfiles", helpFilesRoutes);

const mediaFilesRoutes = require("./routes/mediaFilesRoutes");
app.use("/api/mediafiles", mediaFilesRoutes);

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

// TODO: Route hooks will go here

connectToDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});