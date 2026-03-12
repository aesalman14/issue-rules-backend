/**
 * src/routes/columnRoutes.js
 *
 * Mounts at /api/columns
 */
const { Router } = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const { listColumns, columnValues } = require("../controllers/columnController");

const router = Router();

router.get("/",              asyncHandler(listColumns));
router.get("/:column/values", asyncHandler(columnValues));

module.exports = router;
