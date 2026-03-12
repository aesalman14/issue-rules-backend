/**
 * src/routes/issueRoutes.js
 *
 * Mounts at /api/issues
 * Sub-routes for rules, preview, sql-code, run/deactivate are composed here.
 */
const { Router } = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const { validateIssueId, validateLogicNumber } = require("../middleware/validateParam");
const issue   = require("../controllers/issueController");
const rule    = require("../controllers/ruleController");
const preview = require("../controllers/previewController");

const router = Router();

// ── Issue CRUD ─────────────────────────────────────────
router.get("/",           asyncHandler(issue.getAll));
router.post("/",          asyncHandler(issue.create));
router.get("/:id",        validateIssueId, asyncHandler(issue.getById));
router.put("/:id",        validateIssueId, asyncHandler(issue.update));
router.delete("/:id",     validateIssueId, asyncHandler(issue.remove));

// ── Activate / Deactivate ──────────────────────────────
router.post("/:id/run",        validateIssueId, asyncHandler(issue.activate));
router.post("/:id/deactivate", validateIssueId, asyncHandler(issue.deactivate));

// ── SQL Code (per issue) ───────────────────────────────
router.get("/:id/sql-code", validateIssueId, asyncHandler(issue.getSqlCode));

// ── Rules (nested under issues) ────────────────────────
router.get("/:id/rules",    validateIssueId, asyncHandler(rule.getRules));
router.post("/:id/validate-rules", validateIssueId, asyncHandler(rule.validateRules));
router.post("/:id/rules",   validateIssueId, asyncHandler(rule.addRule));
router.put("/:id/rules",    validateIssueId, asyncHandler(rule.replaceRules));
router.delete("/:id/rules/:logicNumber", validateIssueId, validateLogicNumber, asyncHandler(rule.deleteRule));

// ── Preview (per issue) ────────────────────────────────
router.get("/:id/preview", validateIssueId, asyncHandler(preview.previewByIssue));

module.exports = router;
