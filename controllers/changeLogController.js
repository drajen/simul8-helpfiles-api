const { getDB } = require("../db/mongoClient");

// Log a change
async function logChange({ action, collection, document_id, user = "system", oldData, newData }) {
  const db = getDB();
  await db.collection("ChangeLogs").insertOne({
    action,               // e.g. "update", "delete"
    collection,           // e.g. "HelpFiles"
    document_id,
    user,
    timestamp: new Date(),
    oldData: oldData || null,
    newData: newData || null
  });
}

module.exports = {
  logChange
};