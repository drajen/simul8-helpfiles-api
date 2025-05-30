const { getDB } = require("../db/mongoClient");

// Export help file as JSON
exports.exportHelpFileAsJSON = async (req, res) => {
  try {
    const db = getDB();
    const doc = await db.collection("HelpFiles").findOne({ document_id: req.params.document_id });

    if (!doc) return res.status(404).json({ message: "Help file not found" });

    res.setHeader("Content-Disposition", `attachment; filename=${doc.document_id}.json`);
    res.setHeader("Content-Type", "application/json");
    res.status(200).send(JSON.stringify(doc, null, 2));
  } catch (err) {
    console.error("Export JSON error:", err);
    res.status(500).json({ error: "Failed to export help file" });
  }
};

// Export help file as Markdown

const { convertToMarkdown } = require("../utils/jsonToMarkdown");

exports.exportHelpFileAsMarkdown = async (req, res) => {
  try {
    const db = getDB();
    const doc = await db.collection("HelpFiles").findOne({ document_id: req.params.document_id });

    if (!doc) return res.status(404).json({ message: "Help file not found" });

    //let mdOutput = `# ${doc.title || "Untitled"}\n\n`; // moved to utils under utils as exportController.js 

    //doc.content_sections?.forEach((section) => {
    //  mdOutput += `## ${section.section_title}\n\n`;
    //  mdOutput += `${section.text}\n\n`;
    //});

    const mdOutput = convertToMarkdown(doc); // delegates formatting to utils/jsonToMarkdown.js

    res.setHeader("Content-Disposition", `attachment; filename=${doc.document_id}.md`);
    res.setHeader("Content-Type", "text/markdown");
    res.status(200).send(mdOutput);
  } catch (err) {
    console.error("Export Markdown error:", err);
    res.status(500).json({ error: "Failed to export help file" });
  }
};