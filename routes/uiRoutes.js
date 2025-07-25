const express = require("express");
const router = express.Router();
const { getDB } = require("../db/mongoClient");
const { parseMarkdownToHtml } = require("../utils/parseMarkdown");
const { verifyToken } = require("../middleware/authMiddleware");
const { logChange, getDifferences } = require("../utils/changelogLogger");
const { helpFilesValidationRules } = require("../middleware/helpFilesValidator");
const { validationResult } = require("express-validator");
const { updateHelpFile } = require("../controllers/helpFilesController");
const { updateMediaFile } = require("../controllers/mediaFilesController");

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

router.get("/dashboard", verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const { category, tag, q, file_type, deleted, view } = req.query;
    const limit = Math.min(parseInt(req.query.limit) || 10, 25); // cap to 25 max
    //debug 
    console.log("LIMIT DEBUG:", limit, "Query string value:", req.query.limit);

    const isLimit10 = limit === 10;
    const isLimit25 = limit === 25;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    const isMediaView = view === "media";

    let files = [];
    let mediaFiles = [];
    let mediaQuery = {};
    let totalCount = 0;

    if (isMediaView) {
      // Combined query with AND conditions
      const andConditions = [];

      if (category) {
        andConditions.push({
          "used_in_help_files.document_id": { $regex: new RegExp(`^${category}:`, "i") }
        });
      }

      if (q) {
        andConditions.push({
          $or: [
            { media_id: { $regex: q, $options: "i" } },
            { tags: { $in: [q] } },
            { "used_in_help_files.document_id": { $regex: q, $options: "i" } }
          ]
        });
      }

      if (tag) {
        andConditions.push({ tags: { $in: [tag] } });
      }

      if (file_type) {
        andConditions.push({ file_type });
      }

      mediaQuery = andConditions.length ? { $and: andConditions } : {};

      totalCount = await db.collection("MediaFiles").countDocuments(mediaQuery);

      mediaFiles = await db.collection("MediaFiles")
        .find(mediaQuery)
        .project({ media_id: 1, file_type: 1, tags: 1, used_in_help_files: 1, media_url: 1 })
        .skip(skip)
        .limit(limit)
        .toArray();

    } else {
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

      totalCount = await db.collection("HelpFiles").countDocuments(helpQuery);

      files = await db.collection("HelpFiles")
        .find(helpQuery)
        .project({ document_id: 1, title: 1, categories: 1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      for (const f of files) {
        f.encoded_id = encodeURIComponent(f.document_id);

        const mediaCount = await db.collection("MediaFiles").countDocuments({
          "used_in_help_files.document_id": f.document_id
        });

        f.media_count = mediaCount;
      }
    }

    const totalPages = Math.ceil(totalCount / limit);
    const pageLinks = Array.from({ length: totalPages }, (_, i) => ({
      number: i + 1,
      active: i + 1 === page
    }));

    // Build category and tag dropdown options
    /*const categoryOptions = [
      "features",
      "examples",
      "tutorials",
      "troubleshooting",
      "getting started",
      "key concepts",
      "simul8 online"
    ].map(cat => ({
      label: cat,
      value: cat,
      selected: cat.toLowerCase() === (category || "").toLowerCase()
    }));*/

    //Refine to slugify categories
    const rawCategories = [
    { label: "Features", slug: "features" },
    { label: "Examples", slug: "examples" },
    { label: "Tutorials", slug: "tutorials" },
    { label: "Troubleshooting", slug: "troubleshooting" },
    { label: "Getting Started", slug: "getting_started" },
    { label: "Key Concepts", slug: "key_concepts" },
    { label: "Simul8 Online", slug: "simul8-online" }  // slug matches document_id
    ];

    const categoryOptions = rawCategories.map(cat => ({
      label: cat.label,
      value: cat.slug,
      selected: cat.slug === category
    }));

    const tagOptions = [
      "labels",
      "queue",
      "clock",
      "warm-up"
    ].map(tagValue => ({
      value: tagValue,
      selected: tagValue === tag
    }));

    /*res.render("dashboard", {
      layout: "header",
      title: isMediaView ? "Media Files" : "Help Files",
      user: req.user,
      deleted: deleted === "1",
      isMediaView,
      files,
      mediaFiles,
      categoryOptions,
      tagOptions    
    });*/

    const fileTypeOptions = [
      "image/png",
      "image/jpeg",
      "image/gif",
      "simulation/s8"
    ].map(type => ({
      value: type,
      selected: type === file_type
    }));

    const filtersActive = !!(req.query.q || req.query.category || req.query.tag);
    
    // Debugging logs
    console.log("Category used:", category);
    console.log("Media View Category:", category);
    console.log("categoryOptions debug:", categoryOptions);

    res.render("dashboard", {
      layout: "header",
      title: isMediaView ? "Media Files" : "Help Files",
      user: req.user,
      deleted: deleted === "1",
      isMediaView,
      files,
      mediaFiles,
      categoryOptions,
      tagOptions,
      fileTypeOptions,
      q,
      category,
      tag,
      file_type,
      limit,
      page,
      totalPages,
      pageLinks,
      filtersActive,
      submitted_bug: req.query.submitted === "bug",
      submitted_feature: req.query.submitted === "feature"
    });

  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).send("Failed to load dashboard");
  }
});

// Render the preview page 
/*router.get("/preview/:document_id", async (req, res) => {
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
});*/

// Render the preview page - updated version
router.get("/preview/:document_id", verifyToken, async (req, res) => {
  const db = getDB();
  const docId = req.params.document_id;

  const file = await db.collection("HelpFiles").findOne({ document_id: docId });
  if (!file) return res.status(404).send("Document not found");

  const parsed_sections = file.content_sections.map(section => {
    // Parse markdown
    let html = parseMarkdownToHtml(section.text);

    // Append media images (if any)
    if (section.media_references && section.media_references.length) {
      const mediaImages = section.media_references.map(media => {
        const url = media.url || `https://www.simul8.com/support/help/lib/exe/fetch.php?media=${media.file_path}`;
        const alt = media.alt_text || media.media_id || "image";
        return `<img src="${url}" alt="${alt}" class="img-fluid my-2" style="max-height:300px;" />`;
      }).join("\n");
      html += `<div class="mt-3">${mediaImages}</div>`;
    }

    return {
      section_title: section.section_title,
      html
    };
  });

  // Find "See Also" references if available
  const seeAlso = (file.references || []).find(ref => ref.type === "see_also");
  const seeAlsoLinks = seeAlso?.documents?.map(doc => ({
    link_text: doc.link_text,
    document_id: doc.document_id
  })) || [];

  res.render("preview", {
    title: file.title,
    document_id: file.document_id,
    parsed_sections,
    seeAlsoLinks
  });
});

// GET /helpfiles/:document_id/edit
router.get("/helpfiles/:document_id/edit", async (req, res) => {
  try {
    const db = getDB();
    const docId = req.params.document_id;

    const file = await db.collection("HelpFiles").findOne({ document_id: docId });
    if (!file) return res.status(404).send("Help file not found");

    const changelogs = await db.collection("ChangeLogs")
      .find({ document_id: docId })
      .sort({ timestamp: -1 })
      .limit(5)
      .toArray(); 

    changelogs.forEach(log => {
      log.timestamp = new Date(log.timestamp).toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short"
      });

      if (log.oldData && log.newData) {
        log.differences = getDifferences(log.oldData, log.newData);
      } else {
        log.differences = [];
      }
    });

    res.render("edit", {
      layout: "header",
      title: `Edit: ${file.title}`,
      document_id: file.document_id,
      titleValue: file.title,
      category: file.categories?.[0] || "",
      tags: (file.tags || []).join(", "),
      references: JSON.stringify(file.references || [], null, 2),
      content_sections: file.content_sections || [],
      changelogs,
      isAdmin: req.user?.role === "admin"
    });

  } catch (err) {
    console.error("Edit view error:", err);
    res.status(500).send("Failed to load edit form");
  }
});

// GET /mediafiles/:media_id/preview
router.get("/mediafiles/:media_id/preview", verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const media = await db.collection("MediaFiles").findOne({ media_id: req.params.media_id });

    if (!media) {
      return res.status(404).send("Media file not found");
    }

    // Adding preview properties
    media.isImage = media.file_type && media.file_type.startsWith("image/");
    media.isSimulation = media.file_type === "simulation/s8";

    res.render("mediaPreview", {
      layout: "header",
      title: `Preview: ${media.media_id}`,
      file: media,
      user: req.user
    });
  } catch (err) {
    console.error("Media preview error:", err);
    res.status(500).send("Server error");
  }
});


// POST /helpfiles/:document_id/edit
/*router.post("/helpfiles/:document_id/edit", async (req, res) => {
  try {
    const db = getDB();
    const docId = req.params.document_id;

    //Fetch old data before updating
    const oldData = await db.collection("HelpFiles").findOne({ document_id: req.params.document_id });
     
    // Prepare the update
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

    // Perform the update
    await db.collection("HelpFiles").updateOne(
      { document_id: docId },
      { $set: update }
    );

    // Fetch full updated doc
    const newData = await db.collection("HelpFiles").findOne({ document_id: docId });

    // Log the change
    await logChange({
      action: "update",
      collection: "HelpFiles",
      document_id: docId,
      user: req.user && req.user.username ? { name: req.user.username } : { name: "system" }, // fallback to system if no user session
      oldData,
      newData
    });

    res.redirect(`/preview/${docId}`);
  } catch (err) {
    console.error("Edit save error:", err);
    res.status(500).send("Failed to save changes");
  }
});*/

// POST /helpfiles/:document_id/edit
router.post("/helpfiles/:document_id/edit", verifyToken, async (req, res, next) => {
  // Convert comma-separated strings BEFORE validation runs
  if (typeof req.body.categories === "string") {
    req.body.categories = req.body.categories
      .split(",")
      .map(c => c.trim())
      .filter(Boolean);
  }

  if (typeof req.body.tags === "string") {
    req.body.tags = req.body.tags
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);
  }

  next();
}, helpFilesValidationRules, async (req, res) => {
  const errors = validationResult(req);
  const docId = req.params.document_id;

  if (!errors.isEmpty()) {
    const db = getDB();
    const file = await db.collection("HelpFiles").findOne({ document_id: docId });

    const changelogs = await db.collection("ChangeLogs")
      .find({ document_id: docId })
      .sort({ timestamp: -1 })
      .limit(5)
      .toArray();

    changelogs.forEach(log => {
      log.timestamp = new Date(log.timestamp).toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short"
      });
      if (log.oldData && log.newData) {
        log.differences = getDifferences(log.oldData, log.newData);
      } else {
        log.differences = [];
      }
    });

    return res.status(400).render("edit", {
      title: file.title,
      document_id: file.document_id,
      titleValue: file.title,
      categories: file.categories.join(", "),
      tags: file.tags.join(", "),
      references: JSON.stringify(file.references, null, 2),
      content_sections: file.content_sections,
      changelogs,
      isAdmin: req.user?.role === "admin",
      errors: errors.array()
    });
  }

  // No errors, proceed to update
  await updateHelpFile(req, res);
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

    const { getDifferences } = require("../utils/changelogLogger"); 

    logs.forEach(log => {
      log.timestamp = new Date(log.timestamp).toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      });

      if (log.oldData && log.newData) {
        log.differences = getDifferences(log.oldData, log.newData);
      } else {
        log.differences = [];
      }
    });

    // Modify before rendering
   /* logs.forEach(log => {
      log.timestamp = new Date(log.timestamp).toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      });

      // Pre-stringify for Mustache
      log.oldDataStr = log.oldData ? JSON.stringify(log.oldData, null, 2) : "";
      log.newDataStr = log.newData ? JSON.stringify(log.newData, null, 2) : "";
    });*/

    res.render("changelog", {
      layout: "header",
      logs,
      user: req.user
    });
  } catch (err) {
    console.error("Changelog UI error:", err);
    res.render("changelog", { layout: "header", logs: [], user: req.user });
  }
});

// Edit media file UI route
/*router.get("/mediafiles/:media_id/edit", verifyToken, async (req, res) => {
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
});*/

// GET /mediafiles/:media_id/edit
router.get("/mediafiles/:media_id/edit", verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const media = await db.collection("MediaFiles").findOne({ media_id: req.params.media_id });
    if (!media) return res.status(404).send("Media file not found");

    const changelogs = await db.collection("ChangeLogs")
      .find({ document_id: req.params.media_id })
      .sort({ timestamp: -1 })
      .limit(5)
      .toArray();

    changelogs.forEach(log => {
      log.timestamp = new Date(log.timestamp).toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      });

      log.user = typeof log.user === "string"
      ? log.user
      : (log.user?.name || "system");

      if (log.oldData && log.newData) {
        log.differences = getDifferences(log.oldData, log.newData);
      } else {
        log.differences = [];
      }
    });
    
    console.log("Media changelogs for preview:", changelogs);

    res.render("editMedia", {
      layout: "header",
      title: "Edit Media File",
      user: req.user,
      media,
      changelogs
    });

  } catch (err) {
    console.error("Edit Media view error:", err);
    res.status(500).send("Failed to load edit media form");
  }
});


// POST /mediafiles/:media_id/edit
/*router.post("/mediafiles/:media_id/edit", verifyToken, async (req, res) => {
  await updateMediaFile(req, res);
  //debug
  console.log("USER DEBUG:", req.user);
  try {
    const db = getDB();
    const { file_type, tags, media_url } = req.body;
    const mediaId = req.params.media_id;

    // Fetch old document first
    const oldData = await db.collection("MediaFiles").findOne({ media_id: mediaId });

    // Perform update
    await db.collection("MediaFiles").updateOne(
      { media_id: mediaId },
      {
        $set: {
          file_type,
          media_url,
          tags: tags.split(",").map(t => t.trim()) // Convert to array
        }
      }
    );

    // Fetch updated document
    const newData = await db.collection("MediaFiles").findOne({ media_id: mediaId });

    //debug
    console.log("Logging media update", {
      user: req.user,
      oldData,
      newData
    });

    // Log the change
    await logChange({
      action: "update",
      collection: "MediaFiles",
      document_id: req.params.media_id,
      user: req.user && req.user.username ? { name: req.user.username } : { name: "system" },
      oldData,
      newData
    });

    if (JSON.stringify(oldData) !== JSON.stringify(newData)) {
      res.redirect("/dashboard?view=media&updated=1");
    } else {
      res.redirect("/dashboard?view=media&updated=0");
    }
  } catch (err) {
    console.error("Media update error:", err);
    res.status(500).send("Failed to update media file");
  }
});*/

router.post("/mediafiles/:media_id/edit", verifyToken, async (req, res) => {
  await updateMediaFile(req, res);
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

    const deletedDocs = await db.collection("HelpFiles").find({ document_id: { $in: ids } }).toArray();

    for (const doc of deletedDocs) {
      await logChange({
        action: "delete",
        collection: "HelpFiles",
        document_id: doc.document_id,
        user: req.user && req.user.username ? { name: req.user.username } : { name: "system" },
        oldData: doc,
        newData: null
      });
    }

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

// Bulk delete route for media files
router.post("/bulk-delete-media", verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const selected = req.body.selected;

    if (!selected || selected.length === 0) {
      return res.redirect("/dashboard?view=media&deleted=0");
    }

    const ids = Array.isArray(selected) ? selected : [selected];

    const deletedDocs = await db.collection("MediaFiles").find({ media_id: { $in: ids } }).toArray();

    for (const doc of deletedDocs) {
      await logChange({
        action: "delete",
        collection: "MediaFiles",
        document_id: doc.media_id,
        user: req.user && req.user.username ? { name: req.user.username } : { name: "system" },
        oldData: doc,
        newData: null
      });
    }

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

// GET /upload render Mustache form
router.get("/upload", verifyToken, (req, res) => {
  res.render("upload", {
    layout: "header",
    title: "Upload Help File",
    user: req.user
  });
});

const multer = require("multer");
const upload = multer({ dest: "uploads/" });


// Report Bug
router.post("/report-bug", upload.single("screenshot"), async (req, res) => {
  const db = getDB();
  const bug = {
    description: req.body.description,
    screenshot: req.file ? req.file.filename : null,
    date: new Date()
  };
  await db.collection("bug_reports").insertOne(bug);
  res.redirect("/dashboard?submitted=bug");
});

// Suggest Feature
router.post("/suggest-feature", async (req, res) => {
  const db = getDB();
  const suggestion = {
    suggestion: req.body.suggestion,
    date: new Date()
  };
  await db.collection("feature_suggestions").insertOne(suggestion);
  res.redirect("/dashboard?submitted=feature");
});

module.exports = router;