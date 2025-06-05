const express = require("express");
const router = express.Router();
const { getDB } = require("../db/mongoClient");
const { parseMarkdownToHtml } = require("../utils/parseMarkdown");
const { verifyToken } = require("../middleware/authMiddleware");

// Dashboard page route
//router.get("/dashboard", (req, res) => {
 // res.render("dashboard", {
   // title: "Document Management",
   // isAdmin: true,
   // documents: [] // this will be populated with actual data later
 // });
//});

// Dashboard page route (with live data)
router.get("/dashboard", verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const { category, tag, q, deleted } = req.query;

    const query = {};

    if (category) {
      query.categories = { $in: [category] }; // Exact match inside categories array
    }

    if (tag) {
      query.tags = { $in: [tag] }; // Match inside tags array (if used)
    }

    if (q) {
      query.title = { $regex: q, $options: "i" }; // Case-insensitive search
    }

    const files = await db.collection("HelpFiles")
      .find(query)
      .project({ document_id: 1, title: 1, categories: 1 })
      .limit(50)
      .toArray();

    res.render("dashboard", {
      layout: "header",
      title: "Document Management",
      user: req.user,
      files,
      deleted: deleted === "1"
    });

  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).send("Failed to load dashboard");
  }
});

// Render the preview page 
router.get("/preview/:document_id", async (req, res) => {
  const db = getDB();
  const docId = req.params.document_id;

  const file = await db.collection("HelpFiles").findOne({ document_id: docId });

  if (!file) return res.status(404).send("Document not found");

  const parsed_sections = file.content_sections.map(section => ({
    section_title: section.section_title,
    html: parseMarkdownToHtml(section.text)
  }));

  res.render("preview", {
    title: file.title,
    parsed_sections
  });
});

// GET /helpfiles/:document_id/edit
router.get("/helpfiles/:document_id/edit", async (req, res) => {
  try {
    const db = getDB();
    const docId = req.params.document_id;

    const file = await db.collection("HelpFiles").findOne({ document_id: docId });
    if (!file) return res.status(404).send("Help file not found");

    res.render("edit", {
      layout: "header",
      title: `Edit: ${file.title}`,
      document_id: file.document_id,
      titleValue: file.title,
      category: file.categories?.[0] || "",
      section: file.content_sections?.[0] || {}
    });

  } catch (err) {
    console.error("Edit view error:", err);
    res.status(500).send("Failed to load edit form");
  }
});

// POST /helpfiles/:document_id/edit
router.post("/helpfiles/:document_id/edit", async (req, res) => {
  try {
    const db = getDB();
    const docId = req.params.document_id;

  
    const update = {
      title: req.body.title,
      categories: [req.body.category],
      content_sections: [
        {
          section_title: req.body.section_title,
          text: req.body.section_text,
        }
      ]
    };

    await db.collection("HelpFiles").updateOne(
      { document_id: docId },
      { $set: update }
    );

    res.redirect(`/preview/${docId}`);
  } catch (err) {
    console.error("Edit save error:", err);
    res.status(500).send("Failed to save changes");
  }
});

// DELETE /helpfiles/:document_id/delete
router.post("/helpfiles/:document_id/delete", async (req, res) => {
  try {
    const db = getDB();
    await db.collection("HelpFiles").deleteOne({ document_id: req.params.document_id });

    res.redirect("/dashboard?deleted=1");
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).send("Failed to delete help file");
  }
});

module.exports = router;