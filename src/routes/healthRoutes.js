/**
 * src/routes/healthRoutes.js
 */
const { Router } = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const { checkHealth } = require("../controllers/healthController");

const router = Router();

router.get("/", asyncHandler(checkHealth));

module.exports = router;
