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

router.get("/media_id/:media_id", getMediaFileByMedId);

router.post("/upload", createMediaFile);

router.put("/:id", updateMediaFile);

router.delete("/:id", deleteMediaFile);


// Export the router
module.exports = router;