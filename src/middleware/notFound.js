/**
 * src/middleware/notFound.js — 404 catch-all
 *
 * Register AFTER all real routes, BEFORE errorHandler.
 */
function notFound(req, res, _next) {
  res.status(404).json({
    error: "Not Found",
    path: req.originalUrl,
  });
}

module.exports = notFound;
