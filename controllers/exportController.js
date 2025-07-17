const { getDB } = require("../db/mongoClient");
const { convertToMarkdown } = require("../utils/jsonToMarkdown"); // for markdown only

// Define JSON export
const exportHelpFileAsJSON = async (req, res) => {
  try {
    const db = getDB();
    const document_id = decodeURIComponent(req.params.document_id);
    const doc = await db.collection("HelpFiles").findOne({ document_id });

    if (!doc) return res.status(404).json({ message: "Help file not found" });

    res.setHeader("Content-Disposition", `attachment; filename="${document_id}.json"`);
    res.setHeader("Content-Type", "application/json");
    res.status(200).send(JSON.stringify(doc, null, 2));
  } catch (err) {
    console.error("Export JSON error:", err);
    res.status(500).json({ error: "Failed to export help file" });
  }
};

// Define Markdown export
const exportHelpFileAsMarkdown = async (req, res) => {
  try {
    const db = getDB();
    const document_id = decodeURIComponent(req.params.document_id);
    const file = await db.collection("HelpFiles").findOne({ document_id });

    if (!file) return res.status(404).send("Help file not found");

    const markdown = convertToMarkdown(file);

    res.setHeader("Content-Disposition", `attachment; filename="${document_id}.md"`);
    res.setHeader("Content-Type", "text/markdown");
    res.send(markdown);
  } catch (err) {
    console.error("Markdown export error:", err);
    res.status(500).send("Failed to export as Markdown");
  }
};


module.exports = {
  exportHelpFileAsJSON,
  exportHelpFileAsMarkdown
};