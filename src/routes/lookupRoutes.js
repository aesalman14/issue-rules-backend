/**
 * src/routes/lookupRoutes.js
 *
 * Mounts at /api/lookups
 */
const { Router } = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const lookup = require("../controllers/lookupController");

const router = Router();

router.get("/commodities/options",     asyncHandler(lookup.getCommodityOptions));
router.get("/commodities/products",    asyncHandler(lookup.getProducts));
router.get("/commodities/dn-part-ids", asyncHandler(lookup.getDnPartIds));
router.get("/customers",               asyncHandler(lookup.getCustomers));
router.get("/issue-statuses",          asyncHandler(lookup.getIssueStatuses));
router.get("/design-locations",        asyncHandler(lookup.getDesignLocations));
router.get("/plants",                  asyncHandler(lookup.getPlants));
router.get("/responsibility-categories", asyncHandler(lookup.getResponsibilityCategories));

module.exports = router;
