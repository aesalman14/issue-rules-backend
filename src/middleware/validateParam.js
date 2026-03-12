/**
 * src/middleware/validateParam.js — Lightweight request validators
 */

/**
 * Ensure :id param is a positive integer.
 * Attach parsed value as req.issueId for convenience.
 */
function validateIssueId(req, res, next) {
  const raw = req.params.id;
  const parsed = parseInt(raw, 10);
  if (isNaN(parsed) || parsed <= 0) {
    return res.status(400).json({ error: `Invalid issue ID: ${raw}` });
  }
  req.issueId = String(parsed);
  next();
}

/**
 * Ensure :logicNumber param is a positive integer.
 */
function validateLogicNumber(req, res, next) {
  const raw = req.params.logicNumber;
  const parsed = parseInt(raw, 10);
  if (isNaN(parsed) || parsed <= 0) {
    return res.status(400).json({ error: `Invalid logic number: ${raw}` });
  }
  req.logicNumber = parsed;
  next();
}

module.exports = { validateIssueId, validateLogicNumber };
