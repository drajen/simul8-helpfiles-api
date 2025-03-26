const { getDB } = require("../db/mongoClient");
const { ObjectId } = require("mongodb");

// GET all media files
const getAllMediaFiles = async (req, res) => {
  try {
    const db = getDB();
    const files = await db.collection("MediaFiles").find({}).toArray();
    res.status(200).json({ files });
  } catch (err) {
    console.error("Error fetching media files:", err);
    res.status(500).json({ error: "Failed to fetch media files" });
  }
};

// GET a single media file by media_id
const getMediaFileByMedId = async (req, res) => {
  try {
    const db = getDB();
    const mediaId = req.params.media_id;

    const file = await db
      .collection("MediaFiles")
      .findOne({ media_id: mediaId });

    if (!file) {
      return res.status(404).json({ message: "Media file not found" });
    }

    res.status(200).json(file);
  } catch (err) {
    console.error("Error fetching media file:", err);
    res.status(500).json({ error: "Failed to fetch media file" });
  }
};

// POST new media file
const createMediaFile = async (req, res) => {
  try {
    const db = getDB();
    const newFile = req.body;

    const result = await db.collection("MediaFiles").insertOne(newFile);
    res.status(201).json({
      message: "File uploaded successfully",
      url: newFile.url,
    });
  } catch (err) {
    console.error("Error uploading media file:", err);
    res.status(500).json({ error: "Failed to upload media file" });
  }
};

// PUT update media file metadata by _id
const updateMediaFile = async (req, res) => {
  try {
    const db = getDB();
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ObjectId format" });
    }

    const updateData = req.body;

    const result = await db.collection("MediaFiles").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Media file not found" });
    }

    res.status(200).json({ message: "Updated successfully" });
  } catch (err) {
    console.error("Error updating media file:", err);
    res.status(500).json({ error: "Failed to update media file" });
  }
};

// DELETE a media file by _id
const deleteMediaFile = async (req, res) => {
  try {
    const db = getDB();
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ObjectId format" });
    }

    const result = await db.collection("MediaFiles").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Media file not found" });
    }

    res.status(200).json({ message: "Deleted" });
  } catch (err) {
    console.error("Error deleting media file:", err);
    res.status(500).json({ error: "Failed to delete media file" });
  }
};

// Export the controller functions
module.exports = {
  getAllMediaFiles,
  getMediaFileByMedId,
  createMediaFile,
  updateMediaFile,
  deleteMediaFile,
};