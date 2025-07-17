const express = require("express");
const router = express.Router();
const {
  exportHelpFileAsJSON,
  exportHelpFileAsMarkdown
} = require("../controllers/exportController");

router.get("/helpfile/markdown/:document_id", exportHelpFileAsMarkdown);

router.get("/helpfile/json/:document_id", exportHelpFileAsJSON);

module.exports = router;