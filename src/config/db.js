/**
 * src/config/db.js - MySQL pool singleton
 *
 * Usage:
 *   const { getDb, initDb } = require("./config/db");
 *   await initDb();          // call once at startup
 *   const db = getDb();      // use anywhere
 */
const { getPool } = require("../../scripts/mysql_connect");

let pool = null;

async function initDb() {
  if (pool) return pool;
  pool = await getPool();
  console.log("  [ok] MySQL pool ready");
  return pool;
}

function getDb() {
  if (!pool) throw new Error("Database not initialized - call initDb() first");
  return pool;
}

module.exports = { initDb, getDb };
