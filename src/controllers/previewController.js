/**
 * src/controllers/previewController.js — Claim preview endpoints
 */
const { getDb } = require("../config/db");
const { PREVIEW_COLUMNS } = require("../config/constants");
const { buildWhereFromRules, toDisplaySqlCode } = require("../utils/sqlBuilder");

// ── Preview using an existing issue's rules ────────────
async function previewByIssue(req, res) {
  const db = getDb();
  const limit = Math.min(parseInt(req.query.limit) || 500, 5000);

  const [issues] = await db.execute(
    "SELECT * FROM issue_tracking_history WHERE `Issue ID` = ?",
    [req.issueId]
  );
  if (issues.length === 0) return res.status(404).json({ error: "Issue not found" });

  const issue = issues[0];
  const dnPartId = issue["DN Part ID"];
  const customer = issue["Customer"];

  if (!dnPartId) return res.status(400).json({ error: "Issue has no DN Part ID" });

  const [rules] = await db.execute(
    "SELECT * FROM rule_logic_history WHERE `Rule ID` = ? ORDER BY `Logic Number`",
    [req.issueId]
  );

  const where = buildWhereFromRules(rules, dnPartId, customer);
  const previewSQL = `SELECT ${PREVIEW_COLUMNS} FROM claims_prod WHERE ${where} LIMIT ${limit}`;
  const countSQL   = `SELECT COUNT(*) AS total FROM claims_prod WHERE ${where}`;

  const [previewRows] = await db.execute(previewSQL);
  const [countRows]   = await db.execute(countSQL);

  res.json({
    issue_id: req.issueId,
    dn_part_id: dnPartId,
    customer,
    sql: previewSQL,
    where,
    sql_code: toDisplaySqlCode(where),
    columns: previewRows.length > 0 ? Object.keys(previewRows[0]) : [],
    rows: previewRows,
    preview_count: previewRows.length,
    total_count: countRows[0].total,
  });
}

// ── Preview with custom / ad-hoc rules ─────────────────
async function previewAdHoc(req, res) {
  const db = getDb();
  const { dn_part_id, customer, rules, limit: rawLimit } = req.body;

  if (!dn_part_id) return res.status(400).json({ error: "dn_part_id required" });

  const limit = Math.min(parseInt(rawLimit) || 500, 5000);
  const where = buildWhereFromRules(rules || [], dn_part_id, customer);
  const previewSQL = `SELECT ${PREVIEW_COLUMNS} FROM claims_prod WHERE ${where} LIMIT ${limit}`;
  const countSQL   = `SELECT COUNT(*) AS total FROM claims_prod WHERE ${where}`;

  const [previewRows] = await db.execute(previewSQL);
  const [countRows]   = await db.execute(countSQL);

  res.json({
    dn_part_id,
    customer,
    sql: previewSQL,
    where,
    sql_code: toDisplaySqlCode(where),
    columns: previewRows.length > 0 ? Object.keys(previewRows[0]) : [],
    rows: previewRows,
    preview_count: previewRows.length,
    total_count: countRows[0].total,
  });
}

module.exports = { previewByIssue, previewAdHoc };
