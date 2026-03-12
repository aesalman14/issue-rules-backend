/**
 * src/controllers/healthController.js — System health checks
 */
const { getDb } = require("../config/db");

async function checkHealth(req, res) {
  const db = getDb();
  const status = {
    api: "ok",
    mysql: "unknown",
    claims_prod: "unknown",
    issues: "unknown",
    rules: "unknown",
  };

  try {
    await db.execute("SELECT 1");
    status.mysql = "ok";
  } catch (e) {
    status.mysql = e.message;
  }

  try {
    const [rows] = await db.execute("SELECT COUNT(*) AS total FROM claims_prod");
    status.claims_prod = rows[0].total + " rows";
  } catch (e) {
    status.claims_prod = e.message;
  }

  try {
    const [rows] = await db.execute("SELECT COUNT(*) AS total FROM issue_tracking_history");
    status.issues = rows[0].total + " issues";
  } catch (e) {
    status.issues = e.message;
  }

  try {
    const [rows] = await db.execute("SELECT COUNT(*) AS total FROM rule_logic_history");
    status.rules = rows[0].total + " rules";
  } catch (e) {
    status.rules = e.message;
  }

  res.json(status);
}

module.exports = { checkHealth };
