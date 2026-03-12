/**
 * src/controllers/ruleController.js — Rule CRUD (nested under issues)
 */
const { getDb } = require("../config/db");
const { getClaimsColumns } = require("./columnController");
const {
  validateRuleSet,
  normalizeRuleColumn,
} = require("../utils/ruleValidation");

// ── GET rules for an issue ─────────────────────────────
async function getRules(req, res) {
  const db = getDb();
  const [rules] = await db.execute(
    "SELECT * FROM rule_logic_history WHERE `Rule ID` = ? ORDER BY `Logic Number`",
    [req.issueId]
  );
  res.json(rules);
}

// ── VALIDATE rules for an issue (body rules or saved rules) ──────────────
async function validateRules(req, res) {
  const db = getDb();
  const ruleId = req.issueId;

  let sourceRules;
  if (req.body && Object.prototype.hasOwnProperty.call(req.body, "rules")) {
    if (!Array.isArray(req.body.rules)) {
      return res.status(400).json({ error: "rules must be an array when provided" });
    }
    sourceRules = req.body.rules;
  } else {
    const [rows] = await db.execute(
      "SELECT * FROM rule_logic_history WHERE `Rule ID` = ? ORDER BY `Logic Number`",
      [ruleId]
    );
    sourceRules = rows.map((r) => ({
      p1: r.P1 || "",
      col: r.Col || "",
      operand: r.Operand || "",
      val: r.Val || "",
      p2: r.P2 || "",
      and_or: r["And Or"] || "",
    }));
  }

  const normalizedRules = sourceRules.map((r) => ({
    ...r,
    col: normalizeRuleColumn(r?.col ?? r?.Col),
  }));
  const allowedColumns = await getClaimsColumns();
  const validation = validateRuleSet(normalizedRules, { allowedColumns });

  return res.json({
    valid: validation.valid,
    errors: validation.errors,
    warnings: validation.warnings,
    rule_count: normalizedRules.length,
  });
}

// ── ADD a single rule row ──────────────────────────────
async function addRule(req, res) {
  const db = getDb();
  const ruleId = req.issueId;
  const { p1, col, operand, val, p2, and_or } = req.body;
  const normalizedCol = normalizeRuleColumn(col);

  if (!normalizedCol || !operand) {
    return res.status(400).json({ error: "col and operand are required" });
  }

  const allowedColumns = await getClaimsColumns();
  const validation = validateRuleSet(
    [{ p1, col: normalizedCol, operand, val, p2, and_or }],
    { allowedColumns }
  );
  if (!validation.valid) {
    return res.status(400).json({
      error: "Rule validation failed",
      details: validation.errors,
      warnings: validation.warnings,
    });
  }

  const [countRows] = await db.execute(
    "SELECT COUNT(*) AS total FROM rule_logic_history WHERE `Rule ID` = ?",
    [ruleId]
  );
  const nextLogic = countRows[0].total + 1;

  await db.execute(
    `INSERT INTO rule_logic_history
      (\`Logic ID\`, \`Rule ID\`, \`Logic Number\`, \`P1\`, \`Col\`, \`Operand\`, \`Val\`, \`P2\`, \`And Or\`)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      `${ruleId}-${nextLogic}`, ruleId, nextLogic,
      p1 || null, normalizedCol, operand, val, p2 || null, and_or || null,
    ]
  );
  res.status(201).json({
    rule_id: ruleId,
    logic_number: nextLogic,
    status: "added",
    warnings: validation.warnings,
  });
}

// ── REPLACE all rules for an issue (transactional) ─────
async function replaceRules(req, res) {
  const db = getDb();
  const ruleId = req.issueId;
  const { rules } = req.body;

  if (!Array.isArray(rules)) {
    return res.status(400).json({ error: "rules must be an array" });
  }
  const normalizedRules = rules.map((r) => ({
    ...r,
    col: normalizeRuleColumn(r?.col),
  }));
  const allowedColumns = await getClaimsColumns();
  const validation = validateRuleSet(normalizedRules, { allowedColumns });
  if (!validation.valid) {
    return res.status(400).json({
      error: "Rule validation failed",
      details: validation.errors,
      warnings: validation.warnings,
    });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute("DELETE FROM rule_logic_history WHERE `Rule ID` = ?", [ruleId]);

    for (let i = 0; i < normalizedRules.length; i++) {
      const r = normalizedRules[i];
      const logicNum = i + 1;
      const logicId = `${ruleId}-${logicNum}`;
      await conn.execute(
        `INSERT INTO rule_logic_history
          (\`Logic ID\`, \`Rule ID\`, \`Logic Number\`, \`P1\`, \`Col\`, \`Operand\`, \`Val\`, \`P2\`, \`And Or\`)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          logicId, ruleId, logicNum,
          r.p1 || null, r.col, r.operand, r.val, r.p2 || null, r.and_or || null,
        ]
      );
    }

    await conn.commit();
    res.json({
      status: "saved",
      rule_count: normalizedRules.length,
      warnings: validation.warnings,
    });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

// ── DELETE a single rule row (re-number remaining) ─────
async function deleteRule(req, res) {
  const db = getDb();
  const ruleId = req.issueId;
  const logicNum = req.logicNumber;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute(
      "DELETE FROM rule_logic_history WHERE `Rule ID` = ? AND `Logic Number` = ?",
      [ruleId, logicNum]
    );
    await conn.execute(
      "UPDATE rule_logic_history SET `Logic Number` = `Logic Number` - 1 WHERE `Rule ID` = ? AND `Logic Number` > ?",
      [ruleId, logicNum]
    );
    await conn.commit();
    res.json({ status: "deleted" });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

module.exports = { getRules, validateRules, addRule, replaceRules, deleteRule };
