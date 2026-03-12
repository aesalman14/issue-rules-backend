/**
 * src/routes/previewRoutes.js
 *
 * Mounts at /api/preview — ad-hoc preview (not tied to a saved issue)
 */
const { Router } = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const { previewAdHoc } = require("../controllers/previewController");

const router = Router();

router.post("/", asyncHandler(previewAdHoc));

module.exports = router;
