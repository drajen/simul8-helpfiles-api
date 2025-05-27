const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const { uploadTxtFile } = require("../controllers/uploadController");

router.post("/upload-txt", upload.single("file"), uploadTxtFile);

module.exports = router;