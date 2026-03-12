/**
 * src/utils/ruleValidation.js
 *
 * Validation + normalization helpers for issue rule logic.
 */

const COLUMN_ALIAS_TO_BACKEND = {
  datalink: "Application",
  "claim category": "Dealer Comment Category",
};

const VALUELESS_OPERANDS = new Set(["IS NULL", "IS NOT NULL"]);

function normalizeOperand(op) {
  return String(op || "").trim().toUpperCase();
}

function normalizeRuleColumn(col) {
  const raw = String(col || "").trim();
  if (!raw) return "";
  const mapped = COLUMN_ALIAS_TO_BACKEND[raw.toLowerCase()];
  return mapped || raw;
}

function countChars(text, char) {
  return Array.from(String(text || "")).filter((c) => c === char).length;
}

/**
 * Validates a full rule set.
 * @param {Array} rules
 * @param {Object} options
 * @param {string[]} [options.allowedColumns]
 * @returns {{valid: boolean, errors: string[], warnings: string[]}}
 */
function validateRuleSet(rules, options = {}) {
  const list = Array.isArray(rules) ? rules : [];
  const errors = [];
  const warnings = [];
  const allowedColumns = options.allowedColumns
    ? new Set(options.allowedColumns.map((c) => String(c).toLowerCase()))
    : null;

  let depth = 0;

  for (let i = 0; i < list.length; i += 1) {
    const rowNum = i + 1;
    const r = list[i] || {};

    const col = normalizeRuleColumn(r.Col ?? r.col ?? "");
    const operandRaw = String(r.Operand ?? r.operand ?? "").trim();
    const operand = normalizeOperand(operandRaw);
    const val = String(r.Val ?? r.val ?? "").trim();
    const p1 = String(r.P1 ?? r.p1 ?? "").trim();
    const p2 = String(r.P2 ?? r.p2 ?? "").trim();
    const andOr = String(r["And Or"] ?? r.and_or ?? "").trim();

    if (!col) errors.push(`Row ${rowNum}: Column is required.`);
    if (!operandRaw) errors.push(`Row ${rowNum}: Operand is required.`);

    if (col && allowedColumns && !allowedColumns.has(col.toLowerCase())) {
      errors.push(`Row ${rowNum}: Unknown column "${col}".`);
    }

    if (operand === "BETWEEN") {
      const parts = val.split(",").map((p) => p.trim()).filter(Boolean);
      if (parts.length !== 2) {
        errors.push(`Row ${rowNum}: Between requires "low,high".`);
      }
    } else if (operand === "IN") {
      const items = val.split(",").map((v) => v.trim()).filter(Boolean);
      if (items.length === 0) {
        errors.push(`Row ${rowNum}: In requires comma-separated values.`);
      }
    } else if (VALUELESS_OPERANDS.has(operand)) {
      if (val) {
        warnings.push(`Row ${rowNum}: Value is ignored for ${operandRaw}.`);
      }
    } else if (operandRaw && !val) {
      errors.push(`Row ${rowNum}: Value is required for ${operandRaw}.`);
    }

    if (i < list.length - 1) {
      if (andOr && !/^(And|Or)$/i.test(andOr)) {
        errors.push(`Row ${rowNum}: And/Or must be "And" or "Or".`);
      }
    } else if (andOr) {
      warnings.push(`Row ${rowNum}: Last row And/Or is ignored.`);
    }

    depth += countChars(p1, "(");
    depth -= countChars(p1, ")");
    if (depth < 0) {
      errors.push(`Row ${rowNum}: Closing parenthesis before opening.`);
      depth = 0;
    }

    depth += countChars(p2, "(");
    depth -= countChars(p2, ")");
    if (depth < 0) {
      errors.push(`Row ${rowNum}: Closing parenthesis before opening.`);
      depth = 0;
    }
  }

  if (depth !== 0) {
    errors.push("Parentheses are unbalanced across rule rows.");
  }

  return { valid: errors.length === 0, errors, warnings };
}

module.exports = {
  validateRuleSet,
  normalizeRuleColumn,
  normalizeOperand,
  VALUELESS_OPERANDS,
};

