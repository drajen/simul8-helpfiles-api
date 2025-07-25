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

/*exports.uploadTxtFile = async (req, res) => {
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
};*/

exports.uploadTxtFile = async (req, res) => {
  try {
    const filePath = req.file.path;

    // 1. Validate .txt extension
    if (!req.file.originalname.endsWith(".txt")) {
      fs.unlinkSync(filePath); // delete immediately if invalid
      return res.status(400).json({ error: "Only .txt files are allowed" });
    }

    const rawText = fs.readFileSync(filePath, "utf-8").trim();

    // 2. Get selected doc_type from form (used for category + document_id prefix)
    const docType = req.body.doc_type?.trim();
    if (!docType) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: "Document type not provided" });
    }

    // 3. Parse sections
    const lines = rawText.split("\n\n").filter(Boolean);
    const titleLine = lines[0] || "Untitled";
    const cleanTitle = titleLine.replace(/=+/g, "").trim(); // strip markdown = for title

    const contentSections = lines.slice(1).map((para, idx) => ({
      section_title: `Section ${idx + 1}`,
      text: para.trim()
    }));

    // 4. Build document_id slug 
    const slug = cleanTitle
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");

    const helpFile = {
      document_id: `${docType}:${slug}`,
      title: cleanTitle,
      tags: ["upload"],
      categories: [docType],
      content_sections: contentSections,
      created_at: new Date()
    };

    const db = getDB();
    const result = await db.collection("HelpFiles").insertOne(helpFile);

    fs.unlinkSync(filePath);

    /*res.status(201).json({
      message: "Text file parsed and stored",
      document_id: helpFile.document_id,
      insertedId: result.insertedId*/

    res.redirect(`/upload?success=Help file '${helpFile.document_id}' uploaded successfully`);
  } catch (err) {
      console.error("Upload error:", err);
    /*res.status(500).json({ error: "Failed to upload and parse file" });*/
    res.redirect(`/upload?error=Failed to upload or parse file`);
  }
};