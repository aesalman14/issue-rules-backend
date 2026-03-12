const { normalizeRuleColumn } = require("./ruleValidation");

/**
 * src/utils/sqlBuilder.js — SQL generation helpers
 *
 * Mirrors the Access VBA generateFilter logic.
 * Pure functions — no Express, no DB dependency.
 */

/** Escape single-quotes, strip semicolons and comment markers */
function sanitize(val) {
  return String(val)
    .replace(/'/g, "''")
    .replace(/;/g, "")
    .replace(/--/g, "")
    .trim();
}

/** Convert an operand + field + value into a MySQL WHERE fragment */
function operandToSQL(operand, field, value) {
  const op = (operand || "").trim();

  if (op === "=" || op === "Equals")
    return `\`${field}\` = '${sanitize(value)}'`;

  if (op === "<>" || op === "!=" || op === "Not Equals")
    return `\`${field}\` != '${sanitize(value)}'`;

  if (op === "Like" || op === "LIKE" || op === "Contains (*)") {
    const cleanVal = value.replace(/\*/g, "").replace(/%/g, "");
    return `\`${field}\` LIKE '%${sanitize(cleanVal)}%'`;
  }

  if (op === ">" || op === "Greater Than")
    return `\`${field}\` > '${sanitize(value)}'`;

  if (op === "<" || op === "Less Than")
    return `\`${field}\` < '${sanitize(value)}'`;

  if (op === ">=" || op === "Greater or Equal")
    return `\`${field}\` >= '${sanitize(value)}'`;

  if (op === "<=" || op === "Less or Equal")
    return `\`${field}\` <= '${sanitize(value)}'`;

  if (op === "In" || op === "IN") {
    const items = value
      .split(",")
      .map((v) => `'${sanitize(v.trim())}'`)
      .join(", ");
    return `\`${field}\` IN (${items})`;
  }

  if (op === "Between" || op === "BETWEEN") {
    const [low, high] = value.split(",");
    return `\`${field}\` BETWEEN '${sanitize(low.trim())}' AND '${sanitize(high.trim())}'`;
  }

  if (op === "Is Null" || op === "IS NULL")
    return `\`${field}\` IS NULL`;

  if (op === "Is Not Null" || op === "IS NOT NULL")
    return `\`${field}\` IS NOT NULL`;

  // Fallback — use operand as-is
  return `\`${field}\` ${op} '${sanitize(value)}'`;
}

/**
 * Build a WHERE clause from issue metadata + rule rows.
 *   ([DN Part ID] = '184') AND <rule clauses>
 *   Customer filtering comes from the rule rows themselves.
 */
function buildWhereFromRules(rules, dnPartId, customer) {
  const prefix = `(\`DN Part ID\` = '${sanitize(dnPartId)}')`;

  if (!rules || rules.length === 0) return prefix;

  const parts = [];
  for (const rule of rules) {
    const p1      = (rule.P1 || rule.p1 || "").trim();
    const col     = normalizeRuleColumn((rule.Col || rule.col || "").trim());
    const operand = (rule.Operand || rule.operand || "").trim();
    const val     = (rule.Val || rule.val || "").trim();
    const p2      = (rule.P2 || rule.p2 || "").trim();
    const andOr   = (rule["And Or"] || rule.and_or || "").trim();

    if (!col || !operand) continue;

    const clause = operandToSQL(operand, col, val);
    parts.push(`${p1} ${clause} ${p2} ${andOr}`);
  }

  if (parts.length === 0) return prefix;
  return `${prefix} AND ${parts.join(" ").trim()}`;
}

/** Convert MySQL back-tick syntax to Access-style bracket notation for display */
function toDisplaySqlCode(whereClause) {
  return String(whereClause || "")
    .replace(/`([^`]+)`/g, "[$1]")
    .replace(/%/g, "*")
    // Strip quotes from purely numeric values so 184 not '184'
    .replace(/(=|!=|<>|>=|<=|>|<)\s*'(\d+\.?\d*)'/g, "$1 $2")
    .replace(/BETWEEN\s+'(\d+\.?\d*)'\s+AND\s+'(\d+\.?\d*)'/gi, "BETWEEN $1 AND $2")
    .replace(/\s+/g, " ")
    .trim();
}

module.exports = {
  sanitize,
  operandToSQL,
  buildWhereFromRules,
  toDisplaySqlCode,
};
