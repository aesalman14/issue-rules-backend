/**
 * src/controllers/columnController.js — Claims column / value endpoints
 */
const { getDb } = require("../config/db");

// In-memory cache for the 94 column names (populated once)
let claimsColumnsCache = null;

async function getClaimsColumns() {
  if (claimsColumnsCache) return claimsColumnsCache;
  const db = getDb();
  const [rows] = await db.execute("SHOW COLUMNS FROM claims_prod");
  claimsColumnsCache = rows.map((r) => r.Field);
  return claimsColumnsCache;
}

// ── GET all column names ───────────────────────────────
async function listColumns(req, res) {
  const columns = await getClaimsColumns();
  res.json(columns);
}

// ── GET distinct values for a column ───────────────────
async function columnValues(req, res) {
  const db = getDb();
  const col = req.params.column;
  const limit = Math.min(parseInt(req.query.limit || "500", 10), 1000);
  const search = (req.query.search || "").toString().trim();

  const allowedColumns = await getClaimsColumns();
  if (!allowedColumns.includes(col)) {
    return res.status(400).json({ error: `Invalid column: ${col}` });
  }

  let sql = `SELECT DISTINCT \`${col}\` AS value FROM claims_prod WHERE \`${col}\` IS NOT NULL`;
  const params = [];

  if (search.length > 0) {
    sql += ` AND CAST(\`${col}\` AS CHAR) LIKE ?`;
    params.push(`%${search}%`);
  }

  sql += ` ORDER BY \`${col}\` LIMIT ${limit}`;

  const [rows] = await db.execute(sql, params);
  res.json(rows.map((r) => r.value).filter((v) => v !== ""));
}

module.exports = { listColumns, columnValues, getClaimsColumns };
