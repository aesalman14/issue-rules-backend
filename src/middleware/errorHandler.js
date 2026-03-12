/**
 * src/middleware/errorHandler.js — Central error handler
 *
 * Must be registered LAST with app.use(errorHandler).
 * Catches anything thrown / next(err)'d from controllers.
 */

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  // Log full error in dev; keep prod logs lean
  const isDev = process.env.NODE_ENV !== "production";
  if (isDev) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}`);
    console.error(err.stack || err);
  } else {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} — ${err.message}`);
  }

  const statusCode = err.statusCode || 500;
  const body = {
    error: err.message || "Internal Server Error",
  };

  // Include SQL that caused the failure (helpful for debugging queries)
  if (err.sql) body.sql = err.sql;

  // Include stack trace in development only
  if (isDev) body.stack = err.stack;

  res.status(statusCode).json(body);
}

module.exports = errorHandler;
