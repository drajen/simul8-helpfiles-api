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

router.get("/document_id/:document_id", getHelpFileByDocId);

router.post("/", createHelpFile);

router.put("/:id", updateHelpFile);

router.delete("/:id", deleteHelpFile);


// Export the router
module.exports = router;