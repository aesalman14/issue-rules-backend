require("dotenv").config();
const express = require("express");
const buildSecurityMiddleware = require("./middleware/security");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const routes = require("./routes");

function createApp() {
  const app = express();

  app.use(...buildSecurityMiddleware());
  app.use("/api", routes);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };