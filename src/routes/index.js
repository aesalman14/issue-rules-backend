/**
 * src/routes/index.js — Route aggregator
 *
 * Imports every route module and mounts it under the correct prefix.
 * server.js only needs:  app.use("/api", routes);
 */
const { Router } = require("express");

const healthRoutes  = require("./healthRoutes");
const issueRoutes   = require("./issueRoutes");
const previewRoutes = require("./previewRoutes");
const sqlCodeRoutes = require("./sqlCodeRoutes");
const lookupRoutes  = require("./lookupRoutes");
const columnRoutes  = require("./columnRoutes");
const filterRoutes  = require("./filterRoutes");

const router = Router();

router.use("/health",   healthRoutes);
router.use("/issues",   issueRoutes);
router.use("/preview",  previewRoutes);
router.use("/sql-code", sqlCodeRoutes);
router.use("/lookups",  lookupRoutes);
router.use("/columns",  columnRoutes);
router.use("/filter",   filterRoutes);

module.exports = router;
