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

// Import the media file validation middleware
const { validateMediaFiles } = require("../middleware/mediaFilesValidator");
// Apply the validation middleware to the POST and PUT routes
router.post("/upload", validateMediaFiles, createMediaFile);
router.put("/:media_id", validateMediaFiles, updateMediaFile);

// Search media files by tag
const { searchMediaFilesByTag } = require("../controllers/mediaFilesController");
router.get("/search", searchMediaFilesByTag);

// Export the router
module.exports = router;