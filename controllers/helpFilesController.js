const { getDB } = require("../db/mongoClient");
const { ObjectId } = require("mongodb");

// Define the getAllHelpFiles function
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

// Define the getHelpFilByDocId function
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


// Define the createHelpFile function
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


// Define the updateHelpFile function
const updateHelpFile = async (req, res) => {
  try {
    const db = getDB();
    const id = req.params.id;
    
    // Check if the id is a valid ObjectId (change to document_id?)
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ObjectId format" });
    }
    
    const updateData = req.body;

    const result = await db.collection("HelpFiles").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Help file not found" });
    }

    res.status(200).json({ message: "Updated successfully" });
  } catch (err) {
    console.error("Error updating help file:", err);
    res.status(500).json({ error: "Failed to update help file" });
  }
};


// Define the deleteHelpFile function
const deleteHelpFile = async (req, res) => {
  try {
    const db = getDB();
    const id = req.params.id;

    // For validation, check if the id is a valid ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ObjectId format" });
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