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

// Redirect root to login page
router.get("/", (req, res) => {
  res.redirect("/auth/login");
});

// Dashboard page route (with live data)
router.get("/dashboard", verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const { category, tag, q, file_type, deleted, view } = req.query;
    const isMediaView = view === "media";

    let files = [];
    let mediaFiles = [];

    if (isMediaView) {
      // MEDIA FILE QUERY
      const mediaQuery = {};

      if (file_type) {
        mediaQuery.file_type = file_type;
      }

      if (tag) {
        mediaQuery.tags = { $in: [tag] };
      }

      if (q) {
        mediaQuery.$or = [
          { media_id: { $regex: q, $options: "i" } },
          { tags: { $in: [q] } },
          { "used_in_help_files.document_id": { $regex: q, $options: "i" } }
        ];
      }

      mediaFiles = await db.collection("MediaFiles")
        .find(mediaQuery)
        .project({ media_id: 1, file_type: 1, tags: 1, used_in_help_files: 1, media_url: 1 })
        .limit(50)
        .toArray();
    } else {
      // HELP FILE QUERY
      const helpQuery = {};

      if (category) {
        helpQuery.categories = { $in: [category] };
      }

      if (tag) {
        helpQuery.tags = { $in: [tag] };
      }

      if (q) {
        helpQuery.title = { $regex: q, $options: "i" };
      }

      files = await db.collection("HelpFiles")
        .find(helpQuery)
        .project({ document_id: 1, title: 1, categories: 1 })
        .limit(50)
        .toArray();
      
        files.forEach(f => {
        f.encoded_id = encodeURIComponent(f.document_id);
      });
    }

    res.render("dashboard", {
      layout: "header",
      title: isMediaView ? "Media Files" : "Help Files",
      user: req.user,
      deleted: deleted === "1",
      isMediaView,
      files,
      mediaFiles
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

// Changelog UI route
router.get("/changelog", verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const logs = await db.collection("ChangeLogs").find().sort({ timestamp: -1 }).toArray();
    res.render("changelog", { layout: "header", logs, user: req.user });
  } catch (err) {
    console.error("Changelog UI error:", err);
    res.render("changelog", { layout: "header", logs: [], user: req.user });
  }
});

// Edit media file UI route
router.get("/mediafiles/:media_id/edit", verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const media = await db.collection("MediaFiles").findOne({ media_id: req.params.media_id });

    if (!media) {
      return res.status(404).send("Media file not found");
    }

    res.render("editMedia", {
      layout: "header",
      title: "Edit Media File",
      user: req.user,
      media
    });
  } catch (err) {
    console.error("Media edit UI error:", err);
    res.status(500).send("Server error");
  }
});


// POST /mediafiles/:media_id/edit
router.post("/mediafiles/:media_id/edit", verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const { file_type, tags, media_url } = req.body;

    const updated = await db.collection("MediaFiles").updateOne(
      { media_id: req.params.media_id },
      {
        $set: {
          file_type,
          media_url,
          tags: tags.split(",").map(t => t.trim()) // Convert to array
        }
      }
    );

    if (updated.modifiedCount > 0) {
      res.redirect("/dashboard?view=media&updated=1");
    } else {
      res.redirect("/dashboard?view=media&updated=0");
    }
  } catch (err) {
    console.error("Media update error:", err);
    res.status(500).send("Failed to update media file");
  }
});

// Bulk delete route for help files
router.post("/bulk-delete", verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const selected = req.body.selected;

    if (!selected || selected.length === 0) {
      return res.redirect("/dashboard?deleted=0");
    }

    const ids = Array.isArray(selected) ? selected : [selected];

    const result = await db.collection("HelpFiles").deleteMany({
      document_id: { $in: ids }
    });

    console.log(`Deleted ${result.deletedCount} help files`);
    res.redirect("/dashboard?deleted=1");
  } catch (err) {
    console.error("Bulk delete error:", err);
    res.status(500).send("Failed to bulk delete");
  }
});


router.post("/bulk-delete-media", verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const selected = req.body.selected;

    if (!selected || selected.length === 0) {
      return res.redirect("/dashboard?view=media&deleted=0");
    }

    const ids = Array.isArray(selected) ? selected : [selected];

    const result = await db.collection("MediaFiles").deleteMany({
      media_id: { $in: ids }
    });

    console.log(`Deleted ${result.deletedCount} media files`);
    res.redirect("/dashboard?view=media&deleted=1");
  } catch (err) {
    console.error("Bulk delete (media) error:", err);
    res.status(500).send("Failed to bulk delete media files");
  }
});

module.exports = router;