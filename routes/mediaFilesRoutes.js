const express = require("express");
const router = express.Router();
const {
  getAllMediaFiles,
  getMediaFileByMedId,
  createMediaFile,
  updateMediaFile,
  deleteMediaFile,
} = require("../controllers/mediaFilesController");

// Define the routes
router.get("/", getAllMediaFiles);

// Get a single media file by media_id
router.get("/media_id/:media_id", getMediaFileByMedId);

// Upload a new media file
router.post("/upload", createMediaFile);

// Update media file metadata by media_id
router.put("/media_id/:media_id", updateMediaFile);

// Delete a media file by media_id
router.delete("/:media_id", deleteMediaFile);


// Export the router
module.exports = router;