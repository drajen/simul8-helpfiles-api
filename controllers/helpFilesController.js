const { getDB } = require("../db/mongoClient");
const { ObjectId } = require("mongodb");



// Get all help files
const getAllHelpFiles = async (req, res) => {
  try {
    const db = getDB();
    const files = await db.collection("HelpFiles").find({}).toArray();
    res.status(200).json({ files });
  } catch (err) {
    console.error("Error fetching help files:", err);
    res.status(500).json({ error: "Failed to fetch help files" });
  }
};


// GET a single help file by document_id
const getHelpFileByDocId = async (req, res) => {
  try {
    const db = getDB();
    const documentId = req.params.document_id;

    const file = await db
      .collection("HelpFiles")
      .findOne({ document_id: req.params.document_id });

    if (!file) {
      return res.status(404).json({ message: "Help file not found" });
    }

    res.status(200).json(file);
  } catch (err) {
    console.error("Error fetching help file by document_id:", err);
    res.status(500).json({ error: "Failed to fetch help file" });
  }
};


// POST Create new help file
// Need to edit this to show what help file created with document id
const createHelpFile = async (req, res) => {
  try {
    const db = getDB();
    const newFile = req.body;

    const result = await db.collection("HelpFiles").insertOne(newFile);
    res.status(201).json({
      message: "Help file created successfully",
      insertedId: result.insertedId,
    });
  } catch (err) {
    console.error("Error creating help file:", err);
    res.status(500).json({ error: "Failed to create help file" });
  }
};


// PUT update help file by document_id
const updateHelpFile = async (req, res) => {
  try {
    const db = getDB();
    const id = req.params.document_id;
    
    // Check if the document_id is a valid
    // Double check code 68-80
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid document_id entered" });
    }
    
    const updateData = req.body;

    const result = await db.collection("HelpFiles").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Help file not found" });
    }
     
    // Update this to reflect what and where its updated
    // must run and test on Postman API
    // Need to create responses for each parameter that's updated?
    res.status(200).json({ message: "Help file '${updated.title}' updated", 
      updatedFields: updateData
    });
  } catch (err) {
    console.error("Error updating help file:", err);
    res.status(500).json({ error: "Failed to update help file" });
  }
};


// DELETE a help file by document_id
const deleteHelpFile = async (req, res) => {
  try {
    const db = getDB();
    const id = req.params.document_id;

    // For validation, check if the id is a valid ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid document id" });
    }

    const result = await db
      .collection("HelpFiles")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Help file not found" });
    }

    res.status(200).json({ message: "Deleted" });
  } catch (err) {
    console.error("Error deleting help file:", err);
    res.status(500).json({ error: "Failed to delete help file" });
  }
};


// Export the controller functions
module.exports = {
  getAllHelpFiles,
  getHelpFileByDocId,
  createHelpFile,
  updateHelpFile,
  deleteHelpFile,
};