/**
 * server.js - Issue Rule Logic API (entry point)
 *
 * Architecture:
 *   src/config/       - DB pool, constants
 *   src/middleware/   - Security, error handling, validation
 *   src/controllers/  - Business logic (one per domain)
 *   src/routes/       - Express routers (one per domain)
 *   src/utils/        - Pure helpers (SQL builder)
 *
 * Run: node server.js
 */
require("dotenv").config();
const { initDb } = require("./src/config/db");
const { createApp } = require("./src/app");

const app = createApp();

// --- Start ---
const HOST = process.env.HOST || process.env.BIND_HOST || "0.0.0.0";
const PORT = parseInt(process.env.PORT || "7271", 10);

(async () => {
  try {
    await initDb();
  } catch (e) {
    console.error("MySQL not connected:", e.message);
  }

  const displayHost = HOST === "0.0.0.0" ? "127.0.0.1" : HOST;
  const baseUrl = `http://${displayHost}:${PORT}`;

  app.listen(PORT, HOST, () => {
    console.log("");
    console.log(`Issue Rule Logic API running on ${baseUrl}`);
    console.log(`  Bind:  ${HOST}:${PORT}`);
    console.log(`  MySQL: ${process.env.MYSQL_HOST}:${process.env.MYSQL_PORT}`);
    console.log("");
    console.log("Endpoints:");
    console.log("  GET    /api/health                         - Health check");
    console.log("");
    console.log("  Issues:");
    console.log("  GET    /api/issues                         - List all issues");
    console.log("  GET    /api/issues/:id                     - Get issue + rules");
    console.log("  POST   /api/issues                         - Create issue");
    console.log("  PUT    /api/issues/:id                     - Update issue");
    console.log("  DELETE /api/issues/:id                     - Delete issue");
    console.log("  POST   /api/issues/:id/run                 - Activate issue");
    console.log("  POST   /api/issues/:id/deactivate          - Deactivate issue");
    console.log("  GET    /api/issues/:id/sql-code            - SQL code for issue");
    console.log("");
    console.log("  Rules:");
    console.log("  GET    /api/issues/:id/rules               - Get rules");
    console.log("  POST   /api/issues/:id/rules               - Add a rule");
    console.log("  PUT    /api/issues/:id/rules               - Replace all rules");
    console.log("  DELETE /api/issues/:id/rules/:num          - Delete a rule");
    console.log("  POST   /api/issues/:id/validate-rules      - Validate rules");
    console.log("");
    console.log("  Preview & SQL:");
    console.log("  GET    /api/issues/:id/preview             - Preview (issue rules)");
    console.log("  POST   /api/preview                        - Preview (ad-hoc)");
    console.log("  POST   /api/sql-code                       - SQL code (ad-hoc)");
    console.log("");
    console.log("  Lookups:");
    console.log("  GET    /api/lookups/customers               - Customers");
    console.log("  GET    /api/lookups/issue-statuses          - Issue statuses");
    console.log("  GET    /api/lookups/design-locations        - Design locations");
    console.log("  GET    /api/lookups/plants                  - Plants");
    console.log("  GET    /api/lookups/responsibility-categories - Responsibility categories");
    console.log("  GET    /api/lookups/commodities/options     - Commodity options");
    console.log("  GET    /api/lookups/commodities/products    - Products");
    console.log("  GET    /api/lookups/commodities/dn-part-ids - DN Part IDs");
    console.log("");
    console.log("  Columns & Filters:");
    console.log("  GET    /api/columns                        - Claims columns");
    console.log("  GET    /api/columns/:col/values            - Column values");
    console.log("  GET    /api/filter/:cust/:prod/:year       - Quick filter");
    console.log("");
    console.log("Quick test:");
    console.log(`  ${baseUrl}/api/health`);
    console.log(`  ${baseUrl}/api/issues`);
    console.log(`  ${baseUrl}/api/lookups/customers`);
    console.log("");
  });
})();
