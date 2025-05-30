const { getDB } = require("../db/mongoClient");


// Filter help files by category
exports.filterByCategory = async (req, res) => {
  try {
    const db = getDB();
    const category = req.params.category;

    const files = await db.collection("HelpFiles")
      .find({ categories: category })
      .project({ document_id: 1, title: 1, categories: 1 })
      .toArray();

    res.json(files);
  } catch (err) {
    console.error("Category filter error:", err);
    res.status(500).json({ error: "Failed to filter by category" });
  }
};


// Filter help files by tag
exports.filterByTag = async (req, res) => {
  try {
    const db = getDB();
    const tag = req.params.tag;

    const files = await db.collection("HelpFiles")
      .find({ tags: tag })
      .project({ document_id: 1, title: 1, tags: 1 })
      .toArray();

    res.json(files);
  } catch (err) {
    console.error("Tag filter error:", err);
    res.status(500).json({ error: "Failed to filter by tag" });
  }
};