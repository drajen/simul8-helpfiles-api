const express = require("express");
const router = express.Router();

const {
  getAllMediaFiles,
  getMediaFileByMedId,
  createMediaFile,
  updateMediaFile,
  deleteMediaFile,
  searchMediaFilesByTag
} = require("../controllers/mediaFilesController");

const { validateMediaFiles } = require("../middleware/mediaFilesValidator");
const { validateRequest } = require("../middleware/validateRequest");

// GET all media files
router.get("/", getAllMediaFiles);

// GET a single media file by media_id
router.get("/media_id/:media_id", getMediaFileByMedId);

// SEARCH media files by tag
router.get("/search", searchMediaFilesByTag);

// POST upload new media file (with validation)
router.post("/upload", validateMediaFiles, validateRequest, createMediaFile);

// PUT update media file metadata by media_id (with validation)
router.put("/media_id/:media_id", validateMediaFiles, validateRequest, updateMediaFile);

// DELETE a media file by media_id
router.delete("/media_id/:media_id", deleteMediaFile);

module.exports = router;