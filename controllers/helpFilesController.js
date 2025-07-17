const { getDB } = require("../db/mongoClient");
const { ObjectId } = require("mongodb");
const { logChange } = require("./changeLogController");


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

    //This needs changed to show what help file was created
    //res.status(201).json({
    //  message: "Help file created successfully",
    //  insertedId: result.insertedId,
    //});
    
    // Changelog for create help file
    await logChange({
      action: "create",
      collection: "HelpFiles",
      document_id: newFile.document_id,
      user: req.user?.username || "system",
      newData: newFile
    });
   
    // Shows which help file was created
    res.status(201).json({
      message: `Help file with document_id '${newFile.document_id}' created successfully`,
      insertedId: result.insertedId
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
    const updateData = req.body;
    
    // Check if the document_id is a valid
    // Not needed as document_id is being used instead of _id
    //if (!ObjectId.isValid(id)) {
    //  return res.status(400).json({ error: "Invalid document_id entered" });
    //}
    const existingDoc = await db.collection("HelpFiles").findOne(
      { document_id: id }
    );
    
    const result = await db.collection("HelpFiles").updateOne(
      { document_id: id },
      { $set: updateData }
    );
 
    // If no documents were matched, it means the document_id was not found
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Help file not found" });
    }

    // If no documents were modified, it means the update data 
    // was incorrect or the same as the existing data
    if (result.modifiedCount === 0) {
      return res.status(200).json({
        message: `Help file with document_id '${id}' found, but no changes were made`,
        note: "Please check the update data.",
      });
    }

    // Update this to reflect what and where its updated
    // must run and test on Postman API
    // Need to create responses for each parameter that's updated?
    //res.status(200).json({ message: "Help file '${updated.title}' updated", 
    // updatedFields: updateData
    //});
    
    // Shows the updated help file in full
    // and what was updated
    const updatedDoc = await db.collection("HelpFiles").findOne({ document_id: id });
 
    // Log the change
    await logChange({
      action: "update",
      collection: "HelpFiles",
      document_id: id,
      oldData: existingDoc,
      newData: updateData
    });

    res.status(200).json({
      message: `Help file with document_id '${id}' updated successfully`,
      updatedFields: updateData,
      updatedDocument: updatedDoc
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
   // if (!ObjectId.isValid(id)) {
    //  return res.status(400).json({ error: "Invalid document id" });
   // }

   const existingDoc = await db.collection("HelpFiles").findOne(
    { document_id: id }
   );

    // Use document_id instead of _id for deletion
    const result = await db
      .collection("HelpFiles")
      .deleteOne({ document_id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Help file not found" });
    }
    
    // Update this to reflect what and where its deleted
    //res.status(200).json({ message: "Deleted" });
   //} catch (err) {
   // console.error("Error deleting help file:", err);
    //res.status(500).json({ error: "Failed to delete help file" });
    
    // Log the change
    await logChange({
      action: "delete",
      collection: "HelpFiles",
      document_id: id,
      oldData: existingDoc,
      newData: null
    });

    // Shows which help file was deleted
    res.status(200).json({
      message: `Help file with document_id '${id}' deleted successfully`
    });
  } catch (err) {
    console.error("Error deleting help file:", err);
    res.status(500).json({ error: "Failed to delete help file" });
  }
};

// Search help files by tag
const searchHelpFilesByTag = async (req, res) => {
  try {
    const db = getDB();
    const tag = req.query.tag;
    if (!tag) {
      return res.status(400).json({ error: "Tag parameter is required" });
    }
    const results = await db.collection("HelpFiles").find({ tags: tag }).toArray();
    res.status(200).json(results);
  } catch (err) {
    console.error("Error searching HelpFiles:", err);
    res.status(500).json({ error: "Failed to search HelpFiles" });
  }
};

const { parseMarkdownToHtml } = require('../utils/parseMarkdown');

// GET /api/helpfiles/preview/:document_id
const previewHelpFile = async (req, res) => {
  try {
    const db = getDB();
    const docId = req.params.document_id;

    const file = await db.collection("HelpFiles").findOne({ document_id: docId });
    if (!file) return res.status(404).json({ message: "Help file not found" });

    const parsedSections = file.content_sections.map(section => ({
      section_title: section.section_title,
      html: parseMarkdownToHtml(section.text)
    }));

    res.status(200).json({
      document_id: file.document_id,
      title: file.title,
      parsed_sections: parsedSections
    });
  } catch (err) {
    console.error("Markdown parsing error:", err);
    res.status(500).json({ error: "Failed to parse markdown" });
  }
};

// Export the controller functions
module.exports = {
  getAllHelpFiles,
  getHelpFileByDocId,
  createHelpFile,
  updateHelpFile,
  deleteHelpFile,
  searchHelpFilesByTag,
  previewHelpFile,
};