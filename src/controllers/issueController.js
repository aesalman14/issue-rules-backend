/**
 * src/controllers/issueController.js — Issue CRUD + activate / deactivate / sql-code
 */
const { getDb } = require("../config/db");
const { ALLOWED_ISSUE_FIELDS } = require("../config/constants");
const { buildWhereFromRules, toDisplaySqlCode } = require("../utils/sqlBuilder");

// ── GET all issues ─────────────────────────────────────
async function getAll(req, res) {
  const db = getDb();
  const [rows] = await db.execute(
    "SELECT * FROM issue_tracking_history ORDER BY `Issue ID` DESC"
  );
  res.json(rows);
}

// ── GET single issue + its rules ───────────────────────
async function getById(req, res) {
  const db = getDb();
  const [issues] = await db.execute(
    "SELECT * FROM issue_tracking_history WHERE `Issue ID` = ?",
    [req.issueId]
  );
  if (issues.length === 0) return res.status(404).json({ error: "Not found" });

  const [rules] = await db.execute(
    "SELECT * FROM rule_logic_history WHERE `Rule ID` = ? ORDER BY `Logic Number`",
    [req.issueId]
  );

  res.json({ ...issues[0], rules });
}

// ── CREATE issue ───────────────────────────────────────
async function create(req, res) {
  const db = getDb();
  const {
    owner, customer, subject, status, dn_part_id,
    checksheet_id, major_issue_no, customer_tracking_number,
    bulletin_number, dn_design_location, dn_plant_id,
    responsibility_category, progress_updates, countermeasure,
    vehicles_affected, failure_ratio, dn_share_ratio,
    service_contribution_ratio,
  } = req.body;

  const [maxRows] = await db.execute(
    "SELECT MAX(CAST(`Issue ID` AS UNSIGNED)) AS max_id FROM issue_tracking_history"
  );
  const nextId = (maxRows[0].max_id || 0) + 1;

  await db.execute(
    `INSERT INTO issue_tracking_history (
      \`Issue ID\`, \`Owner\`, \`Customer\`, \`Subject\`, \`Status\`, \`DN Part ID\`,
      \`Checksheet ID\`, \`Major Issue No\`, \`Customer Tracking Number\`,
      \`Bulletin Number\`, \`DN Design Location\`, \`DN Plant ID\`,
      \`Responsibility Category\`, \`Progress Updates\`, \`Countermeasure\`,
      \`Vehicles Affected\`, \`Failure Ratio\`, \`DN Share Ratio\`,
      \`Service Contribution Ratio\`, \`Activated\`
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'No')`,
    [
      nextId,
      owner || null, customer || null, subject || null, status || null,
      dn_part_id || null, checksheet_id || null, major_issue_no || null,
      customer_tracking_number || null, bulletin_number || null,
      dn_design_location || null, dn_plant_id || null,
      responsibility_category || null, progress_updates || null,
      countermeasure || null, vehicles_affected || null,
      failure_ratio || null, dn_share_ratio || null,
      service_contribution_ratio || null,
    ]
  );

  res.status(201).json({ issue_id: nextId, status: "created" });
}

// ── UPDATE issue ───────────────────────────────────────
async function update(req, res) {
  const db = getDb();
  const fields = req.body;

  const updates = [];
  const values = [];
  for (const [key, col] of Object.entries(ALLOWED_ISSUE_FIELDS)) {
    if (fields[key] !== undefined) {
      updates.push(`\`${col}\` = ?`);
      values.push(fields[key]);
    }
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: "No valid fields" });
  }

  values.push(req.issueId);
  await db.execute(
    `UPDATE issue_tracking_history SET ${updates.join(", ")} WHERE \`Issue ID\` = ?`,
    values
  );
  res.json({ status: "updated" });
}

// ── DELETE issue (and its rules) ────────────────────────────────────────
async function remove(req, res) {
  const db = getDb();
  const issueId = req.issueId;

  const [existing] = await db.execute(
    "SELECT `Issue ID` FROM issue_tracking_history WHERE `Issue ID` = ?",
    [issueId]
  );
  if (existing.length === 0) {
    return res.status(404).json({ error: "Issue not found" });
  }

  await db.execute(
    "DELETE FROM rule_logic_history WHERE `Rule ID` = ?",
    [issueId]
  );
  await db.execute(
    "DELETE FROM issue_tracking_history WHERE `Issue ID` = ?",
    [issueId]
  );

  res.json({ status: "deleted", issue_id: Number(issueId) });
}

// ── RUN / ACTIVATE issue ───────────────────────────────
async function activate(req, res) {
  const db = getDb();
  const issueId = req.issueId;

  const [issues] = await db.execute(
    "SELECT * FROM issue_tracking_history WHERE `Issue ID` = ?",
    [issueId]
  );
  if (issues.length === 0) return res.status(404).json({ error: "Issue not found" });

  const issue = issues[0];
  const dnPartId = issue["DN Part ID"];
  const customer = issue["Customer"];

  const [rules] = await db.execute(
    "SELECT * FROM rule_logic_history WHERE `Rule ID` = ? ORDER BY `Logic Number`",
    [issueId]
  );

  const where = buildWhereFromRules(rules, dnPartId, customer);

  const [countRows] = await db.execute(
    `SELECT COUNT(*) AS total FROM claims_prod WHERE ${where}`
  );

  const sqlCode = where.replace(/%/g, "*").replace(/'/g, "#");
  await db.execute(
    "UPDATE issue_tracking_history SET `SQL Code` = ?, `Activated` = 'Yes' WHERE `Issue ID` = ?",
    [sqlCode, issueId]
  );

  res.json({
    issue_id: parseInt(issueId),
    status: "activated",
    matching_claims: countRows[0].total,
    sql_code: sqlCode,
    where_clause: where,
  });
}

// ── DEACTIVATE issue ───────────────────────────────────
async function deactivate(req, res) {
  const db = getDb();
  await db.execute(
    "UPDATE issue_tracking_history SET `Activated` = 'No' WHERE `Issue ID` = ?",
    [req.issueId]
  );
  res.json({ status: "deactivated" });
}

// ── SQL Code for a saved issue ─────────────────────────
async function getSqlCode(req, res) {
  const db = getDb();

  const [issues] = await db.execute(
    "SELECT * FROM issue_tracking_history WHERE `Issue ID` = ?",
    [req.issueId]
  );
  if (issues.length === 0) return res.status(404).json({ error: "Issue not found" });

  const issue = issues[0];
  const dnPartId = issue["DN Part ID"];
  const customer = issue["Customer"];

  const [rules] = await db.execute(
    "SELECT * FROM rule_logic_history WHERE `Rule ID` = ? ORDER BY `Logic Number`",
    [req.issueId]
  );

  const where = buildWhereFromRules(rules, dnPartId, customer);
  res.json({
    issue_id: req.issueId,
    dn_part_id: dnPartId,
    customer,
    where,
    sql_code: toDisplaySqlCode(where),
  });
}

// ── SQL Code ad-hoc (POST body) ────────────────────────
async function postSqlCode(req, res) {
  const { dn_part_id, customer, rules } = req.body;
  if (!dn_part_id) return res.status(400).json({ error: "dn_part_id required" });

  const where = buildWhereFromRules(rules || [], dn_part_id, customer);
  res.json({
    dn_part_id,
    customer,
    where,
    sql_code: toDisplaySqlCode(where),
  });
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  activate,
  deactivate,
  getSqlCode,
  postSqlCode,
};
