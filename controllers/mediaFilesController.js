const { getDB } = require("../db/mongoClient");
const { ObjectId } = require("mongodb");
const { logChange } = require("../utils/changelogLogger");
const { getDifferences } = require("../utils/changelogLogger");



// GET all media files
const getAllMediaFiles = async (req, res) => {
  try {
    const db = getDB();
    const files = await db.collection("MediaFiles").find({}).toArray();
    res.status(200).json({ files });
  } catch (err) {
    console.error("Error fetching media files:", err);
    res.status(500).json({ error: "Failed to fetch media files" });
  }
};


// GET a single media file by media_id
const getMediaFileByMedId = async (req, res) => {
  try {
    const db = getDB();
    const mediaId = req.params.media_id;

    const file = await db
      .collection("MediaFiles")
      .findOne({ media_id: mediaId });

    if (!file) {
      return res.status(404).json({ message: "Media file not found" });
    }

    res.status(200).json(file);
  } catch (err) {
    console.error("Error fetching media file:", err);
    res.status(500).json({ error: "Failed to fetch media file" });
  }
};


// POST upload new media file
const createMediaFile = async (req, res) => {
  try {
    const db = getDB();
    const newFile = req.body;

    const result = await db.collection("MediaFiles").insertOne(newFile);

    // This needs changed to show what media file was created
    //res.status(201).json({
    //  message: "File uploaded successfully",
    //  url: newFile.url,
    //});

    // Shows which media file was created
    // Consider adding a validation step before this to make sure media url is added too
    res.status(201).json({
      message: `Media file '${newFile.media_id}' uploaded successfully`,
      insertedId: result.insertedId,
      url: newFile.url,
    }); 
  } catch (err) {
    console.error("Error uploading media file:", err);
    res.status(500).json({ error: "Failed to upload media file" });
  }
};


// PUT update media file metadata by media_id
const updateMediaFile = async (req, res) => {
  try {
    const db = getDB();
    const id = req.params.media_id;
    const updateData = req.body;


    // Not needed as media_id is used instead of _id
    //if (!ObjectId.isValid(id)) {
    //  return res.status(400).json({ error: "Invalid media id" });
    //}

    const existingDoc = await db.collection("MediaFiles").findOne(
      { media_id: id }
    );
   
    const result = await db.collection("MediaFiles").updateOne(
      { media_id: id },
      { $set: updateData }
    );

    // If no media were matched, means the media_id was not found
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Media file not found" });
    }
  
    // If no media file were modified, it means the update data 
    // was incorrect or the same as the existing data
    if (result.modifiedCount === 0) {
      return res.status(200).json({
        message: `Media file with media_id '${id}' found, but no changes were made`,
        note: "Please check the update data.",
      });
    }

    // This needs changed to show what data and media file was updated
    //res.status(200).json({ message: "Updated successfully" });

    // Shows the updated media file metadata in full
    // and what was updated
    const updatedDoc = await db.collection("MediaFiles").findOne({ media_id: id });

    // Log the change
    await logChange({
      action: "update",
      collection: "MediaFiles",
      document_id: id,
      user: req.user && req.user.username ? { name: req.user.username } : { name: "system" },
      oldData: existingDoc,
      newData: updateData
    });

    const changelogs = await db.collection("ChangeLogs")
      .find({ document_id: id })
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

    /*res.status(200).json({
      message: `Media file with media_id '${id}' updated successfully`,
      updatedFields: updateData,
      updatedDocument: updatedDoc
    });*/
    return res.render("editmedia", {
      media: updatedDoc,
      isAdmin: req.user?.role === "admin",
      changelogs,
      success: `✔ Media file '${id}' updated successfully`
    });
  } catch (err) {
    console.error("Error updating media file:", err);
    res.status(500).json({ error: "Failed to update media file" });
  }
};


// DELETE a media file by media_id
const deleteMediaFile = async (req, res) => {
  try {
    const db = getDB();
    const id = req.params.media_id;
  
    // Not needed as media_id is used instead of _id
    //if (!ObjectId.isValid(id)) {
    //  return res.status(400).json({ error: "Invalid ObjectId format" });
    //}

    // Use document_id instead of _id for deletion
    // if media_id is not found, return 404

    const existingDoc = await db.collection("MediaFiles").findOne(
      { media_id: id }
    );

    const result = await db
      .collection("MediaFiles")
      .deleteOne({ media_id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Media file not found" });
    }

    //const result = await db.collection("MediaFiles").deleteOne({
    //  _id: new ObjectId(id),
    //});

    //if (result.deletedCount === 0) {
    //  return res.status(404).json({ message: "Media file not found" });
    //}
    
    // This needs changed to show what media file was deleted
    //res.status(200).json({ message: "Deleted" });
    
    // Log the change
    await logChange({
      action: "delete",
      collection: "MediaFiles",
      document_id: id,
      user: req.user && req.user.username ? { name: req.user.username } : { name: "system" },
      oldData: existingDoc,
      newData: null
    });

    // Shows which help file was deleted
    res.status(200).json({
      message: `Media file with media_id '${id}' deleted successfully`
    });
  } catch (err) {
    console.error("Error deleting media file:", err);
    res.status(500).json({ error: "Failed to delete media file" });
  }
};

// Search media files by tag
const searchMediaFilesByTag = async (req, res) => {
  try {
    const db = getDB();
    const tag = req.query.tag;
    if (!tag) {
      return res.status(400).json({ error: "Tag parameter is required" });
    }
    const results = await db.collection("MediaFiles").find({ tags: tag }).toArray();
    res.status(200).json(results);
  } catch (err) {
    console.error("Error searching MediaFiles:", err);
    res.status(500).json({ error: "Failed to search MediaFiles" });
  }
};

// GET /mediafiles/:media_id/preview
const previewMediaFile = async (req, res) => {
  try {
    const db = getDB();
    const mediaId = req.params.media_id;

    const file = await db.collection("MediaFiles").findOne({ media_id: mediaId });

    if (!file) {
      return res.status(404).send("Media file not found");
    }

    res.render("mediaPreview", {
      layout: "header",
      file,
      user: req.user
    });
  } catch (err) {
    console.error("Preview media error:", err);
    res.status(500).send("Error previewing media");
  }
};

// Export the controller functions
module.exports = {
  getAllMediaFiles,
  getMediaFileByMedId,
  createMediaFile,
  updateMediaFile,
  deleteMediaFile,
  searchMediaFilesByTag,
  previewMediaFile
};