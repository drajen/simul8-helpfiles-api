const fs = require("fs");
const { getDB } = require("../db/mongoClient");

/*exports.uploadTxtFile = async (req, res) => {
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
}; */

exports.uploadTxtFile = async (req, res) => {
  try {
    const filePath = req.file.path;
    const rawText = fs.readFileSync(filePath, "utf-8").trim();

    const lines = rawText.split("\n\n");
    const title = lines[0];
    const sections = lines.slice(1).map((para, idx) => ({
      section_title: `Section ${idx + 1}`,
      text: para.trim()
    }));

    const helpFile = {
      document_id: `upload:${Date.now()}`,
      title,
      tags: ["upload"],
      categories: ["Uncategorised"],
      content_sections: sections,
      created_at: new Date()
    };

    const db = getDB();
    const result = await db.collection("HelpFiles").insertOne(helpFile);

    res.status(201).json({
      message: "Text file parsed and stored",
      insertedId: result.insertedId
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Failed to upload and parse file" });
  }
};