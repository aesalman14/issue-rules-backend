/**
 * src/middleware/asyncHandler.js
 *
 * Wraps an async route handler so thrown errors are forwarded to
 * Express's next() instead of crashing the process.
 *
 * Usage:
 *   router.get("/foo", asyncHandler(async (req, res) => { … }));
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
