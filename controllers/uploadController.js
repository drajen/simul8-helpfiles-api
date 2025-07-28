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
  //debugger;
  console.log("UPLOAD ROUTE HIT", req.file, req.body);
  try {
    const filePath = req.file.path;

    // 1. Validate .txt extension
    if (!req.file.originalname.endsWith(".txt")) {
      fs.unlinkSync(filePath); // delete immediately if invalid
      return res.status(400).json({ error: "Only .txt files are allowed" });
    }

    const rawText = fs.readFileSync(filePath, "utf-8").trim();

    /* 2. Get selected doc_type from form (used for category + document_id prefix)
    const docType = req.body.doc_type?.trim();
    if (!docType) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: "Document type not provided" });
    } */
    // 3. Parse DokuWiki-style headings
    const titleMatch = rawText.match(/^={4,}\s*(.*?)\s*={4,}/m);
    const cleanTitle = titleMatch ? titleMatch[1].trim() : "Untitled";

    // Split into sections based on "==== Section Title ===="
    const sectionRegex = /={4,}\s*(.*?)\s*={4,}\n/g;
    let match;
    let lastIndex = 0;
    let contentSections = [];
    let firstSectionDone = false;

    // Find all section headings and their positions
    while ((match = sectionRegex.exec(rawText)) !== null) {
      if (!firstSectionDone) {
        firstSectionDone = true;
        // Skip the main title line
        lastIndex = sectionRegex.lastIndex;
        continue;
      }
      // The section title
      const sectionTitle = match[1].trim();
      // Find where the next section starts
      const nextSection = sectionRegex.exec(rawText);
      // Reset lastIndex for next iteration
      sectionRegex.lastIndex = match.index + match[0].length;

      // Get the section text
      let sectionText;
      if (nextSection) {
        sectionText = rawText.substring(match.index + match[0].length, nextSection.index).trim();
        // Put back the pointer for the next loop
        sectionRegex.lastIndex = nextSection.index;
      } else {
        sectionText = rawText.substring(match.index + match[0].length).trim();
      }

      contentSections.push({
        section_title: sectionTitle,
        text: sectionText
      });
      // If there was a nextSection, put sectionRegex back to its last found position
      if (nextSection) {
        sectionRegex.lastIndex = nextSection.index;
      }
    }

    // If no sections found, treat everything after the main title as one section
    if (contentSections.length === 0 && cleanTitle !== "Untitled") {
      const afterTitle = rawText.split(titleMatch[0])[1]?.trim() || "";
      contentSections = [{
        section_title: cleanTitle,
        text: afterTitle
      }];
    }

    // 4. Get doc_id input from form (new field)
    let docIdInput = req.body.doc_id?.trim() || ""; // added to upload form
    let document_id = docIdInput;
    const urlMatch = docIdInput.match(/id=([^&]+)/);
    let legacy_url = "";

    if (urlMatch) {
      document_id = urlMatch[1];
      legacy_url = docIdInput; // full URL pasted
    } else {
      legacy_url = ""; // or set to null if only doc ID is given
    }

    // If user didn’t provide, fallback to slug logic
    if (!document_id) {
      const slug = cleanTitle
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "");
      document_id = `${docType}:${slug}`;
    }

    const helpFile = {
    document_id,
    legacy_url, // store the pasted DokuWiki URL (or "" if just doc ID)
    title: cleanTitle,
    tags: ["upload"],
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