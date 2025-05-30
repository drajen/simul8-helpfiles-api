const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const { convertMarkdownToJson } = require("../controllers/convertController");

router.post("/helpfile/markdown-json", upload.single("file"), convertMarkdownToJson);

module.exports = router;