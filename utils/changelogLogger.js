const { getDB } = require("../db/mongoClient");

async function logChange({ action, collection, document_id, oldData, newData }) {
  try {
    const db = getDB();
    const logEntry = {
      action,
      collection,
      document_id,
      timestamp: new Date(),
      oldData,
      newData,
    };
    await db.collection("ChangeLogs").insertOne(logEntry);
    console.log("Change logged:", logEntry);
  } catch (err) {
    console.error("Failed to log change:", err);
  }
}

module.exports = { logChange };