const express = require("express");
const router = express.Router();
const {
    getAllHelpFiles,
    getHelpFileByDocId,
    createHelpFile,
    updateHelpFile,
    deleteHelpFile,
} = require("../controllers/helpFilesController");

// Define the routes
router.get("/", getAllHelpFiles);

// Get a single help file by document_id
router.get("/document_id/:document_id", getHelpFileByDocId);

// Create a new help file
router.post("/", createHelpFile);

// Update a help file by document_id
router.put("/:document_id", updateHelpFile);

// Delete a help file by document_id
router.delete("/:document_id", deleteHelpFile);


// Export the router
module.exports = router;