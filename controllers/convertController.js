const fs = require("fs");
const { parseMarkdownToHelpFile } = require("../utils/markdownToJson");

exports.convertMarkdownToJson = async (req, res) => {
  try {
    const filePath = req.file.path;
    const markdownText = fs.readFileSync(filePath, "utf-8");

    const parsedHelpFile = parseMarkdownToHelpFile(markdownText);

    // Clean up
    fs.unlinkSync(filePath);

    res.status(200).json({
      message: "Markdown parsed successfully",
      helpFile: parsedHelpFile,
    });
  } catch (err) {
    console.error("Markdown parsing failed:", err);
    res.status(500).json({ error: "Failed to parse Markdown file" });
  }
};