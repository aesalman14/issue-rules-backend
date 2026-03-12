/**
 * src/routes/filterRoutes.js
 *
 * Mounts at /api/filter
 */
const { Router } = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const { filterByCustProductYear } = require("../controllers/filterController");

const router = Router();

router.get("/:customer/:product/:yearExpr", asyncHandler(filterByCustProductYear));

module.exports = router;
