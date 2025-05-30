const fs = require("fs");
const path = require("path");
const { getDB } = require("../utils/db");
const { parseHelpFileContent } = require("../utils/markdownParser");

// Uploads a text file, parses its content, and stores it in the database
// Utility fucntion to handle text file uploads
// Needs further refined for strict JSON schema validation
const uploadTxtFile = async (req, res) => {
  try {
    const db = getDB();
    const filePath = req.file.path;
    const rawText = fs.readFileSync(filePath, "utf-8");

    const parsed = parseHelpFileContent(rawText); // title, content, sections

    const newDoc = {
      document_id: `upload:${Date.now()}`,
      title: req.file.originalname.replace(".txt", ""),
      raw_text: rawText,
      parsed_sections: parsed.sections || [],
      created_at: new Date()
    };

    const result = await db.collection("HelpFiles").insertOne(newDoc);

    fs.unlinkSync(filePath); // delete uploaded file    

    res.status(201).json({
      message: "File uploaded and parsed successfully",
      insertedId: result.insertedId,
      document_id: newDoc.document_id,
      parsedPreview: parsed.sections
    });
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ error: "File upload failed" });
  }
};

module.exports = { uploadTxtFile };