const fs = require("fs");
const { getDB } = require("../db/mongoClient");

exports.uploadTxtFile = async (req, res) => {
  try {
    const filePath = req.file.path;
    const rawText = fs.readFileSync(filePath, "utf-8");

    const db = getDB();
    const result = await db.collection("HelpFiles").insertOne({
      document_id: `upload:${Date.now()}`,
      title: req.file.originalname,
      raw_text: rawText,
      created_at: new Date()
    });

    res.status(201).json({
      message: "Text file uploaded and stored",
      insertedId: result.insertedId
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Failed to upload file" });
  }
};