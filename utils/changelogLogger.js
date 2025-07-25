const { getDB } = require("../db/mongoClient");

async function logChange({ action, collection, document_id, oldData, newData, user }) {
  try {
    const db = getDB();
    const logEntry = {
      action,
      collection,
      document_id,
      user: user || { name: "system" },
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

function getDifferences(oldData, newData) {
  const diffs = [];

  for (const key in newData) {
    if (key === "updated_at") continue;

    const oldVal = oldData?.[key];
    const newVal = newData[key];

    if (Array.isArray(oldVal) && Array.isArray(newVal)) {
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        diffs.push(`${key}: "${oldVal.join(",")}" → "${newVal.join(",")}"`);
      }
    } else if (
      typeof oldVal !== "object" &&
      typeof newVal !== "object" &&
      oldVal !== newVal
    ) {
      diffs.push(`${key}: "${oldVal}" → "${newVal}"`);
    }
  }

  return diffs;
}

module.exports = { logChange, getDifferences };