const { getDB } = require("../db/mongoClient");
const { convertToMarkdown } = require("../utils/jsonToMarkdown"); // for markdown only
const archiver = require("archiver");
const path = require("path");

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

// Define bulk export for multiple files
const bulkExport = async (req, res) => {
  try {
    let { ids, format } = req.body; // ids might be stringified JSON

    // Parse ids if it’s a string
    if (typeof ids === "string") {
      try {
        ids = JSON.parse(ids);
      } catch (e) {
        console.error("Failed to parse ids:", e);
        return res.status(400).send("Invalid document IDs");
      }
    }

    const db = getDB();

    // Check if no documents selected
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).send("No documents selected");
    }

    // If only 1 file, export single file
    if (ids.length === 1) {
      const document_id = decodeURIComponent(ids[0]);
      const file = await db.collection("HelpFiles").findOne({ document_id });
      if (!file) return res.status(404).send("Help file not found");

      if (format === "json") {
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${document_id}.json"`
        );
        res.setHeader("Content-Type", "application/json");
        return res.send(JSON.stringify(file, null, 2));
      } else {
        const markdown = convertToMarkdown(file);
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${document_id}.md"`
        );
        res.setHeader("Content-Type", "text/markdown");
        return res.send(markdown);
      }
    }

    // Multiple files - create a zip archive
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="helpfiles-${format}.zip"`
    );
    res.setHeader("Content-Type", "application/zip");

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res);

    for (const id of ids) {
      const document_id = decodeURIComponent(id);
      const file = await db.collection("HelpFiles").findOne({ document_id });
      if (!file) continue;

      if (format === "json") {
        archive.append(JSON.stringify(file, null, 2), {
          name: `${document_id}.json`,
        });
      } else {
        const markdown = convertToMarkdown(file);
        archive.append(markdown, { name: `${document_id}.md` });
      }
    }

    await archive.finalize();
  } catch (err) {
    console.error("Bulk export error:", err);
    res.status(500).send("Failed to export files");
  }
};


module.exports = {
  exportHelpFileAsJSON,
  exportHelpFileAsMarkdown,
  bulkExport,
};