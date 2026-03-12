/**
 * src/routes/sqlCodeRoutes.js
 *
 * Mounts at /api/sql-code — ad-hoc SQL code generation
 */
const { Router } = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const { postSqlCode } = require("../controllers/issueController");

const router = Router();

router.post("/", asyncHandler(postSqlCode));

module.exports = router;
