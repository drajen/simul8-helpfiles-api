const { getDB } = require("../db/mongoClient");

async function logChange({ action, collection, document_id, user = "system", oldData, newData }) {
  try {
    const db = getDB();
    const logEntry = {
      action,
      collection,
      document_id,
      user: typeof user === "string" ? { name: user } : (user?.name ? { name: user.name } : { name: "system" }),
      timestamp: new Date(),
      oldData: oldData || null,
      newData: newData || null,
    };
    await db.collection("ChangeLogs").insertOne(logEntry);
    console.log("Change logged:", logEntry);
  } catch (err) {
    console.error("Failed to log change:", err);
  }
}

module.exports = { logChange };