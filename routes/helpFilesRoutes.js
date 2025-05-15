const express = require("express");
const router = express.Router();

const {
  getAllHelpFiles,
  getHelpFileByDocId,
  createHelpFile,
  updateHelpFile,
  deleteHelpFile,
  searchHelpFilesByTag
} = require("../controllers/helpFilesController");

const { helpFilesValidationRules } = require("../middleware/helpFilesValidator");
const { validateRequest } = require("../middleware/validateRequest");

// GET all help files
router.get("/", getAllHelpFiles);

// GET a single help file by document_id
router.get("/document_id/:document_id", getHelpFileByDocId);

// SEARCH help files by tag
router.get("/search", searchHelpFilesByTag);

// POST create new help file (with validation)
router.post("/", helpFilesValidationRules, validateRequest, createHelpFile);

// PUT update help file by document_id (with validation)
router.put("/:document_id", helpFilesValidationRules, validateRequest, updateHelpFile);

// DELETE a help file by document_id
router.delete("/:document_id", deleteHelpFile);

// Preview a help file by document_id
const { previewHelpFile } = require("../controllers/helpFilesController");
router.get("/preview/:document_id", previewHelpFile);

module.exports = router;