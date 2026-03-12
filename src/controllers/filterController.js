/**
 * src/controllers/filterController.js — Quick path-style filter endpoint
 *
 * Example: GET /api/filter/GM/Compressor/=2025
 */
const { getDb } = require("../config/db");
const { PREVIEW_COLUMNS } = require("../config/constants");

async function filterByCustProductYear(req, res) {
  const db = getDb();
  const customer  = decodeURIComponent((req.params.customer || "").trim());
  const product   = decodeURIComponent((req.params.product || "").trim());
  const yearExpr  = decodeURIComponent((req.params.yearExpr || "").trim());
  const limit     = Math.min(parseInt(req.query.limit || "200", 10), 1000);

  if (!customer || !product || !yearExpr) {
    return res.status(400).json({
      error: "customer, product, and yearExpr are required",
      example: "/api/filter/GM/Compressor/=2025",
    });
  }

  // Validate year expression: operator + 4-digit year
  const match = yearExpr.match(/^(<=|>=|=|<|>)(\d{4})$/);
  if (!match) {
    return res.status(400).json({
      error: "yearExpr must look like =2025, >=2024, <2023",
    });
  }

  const modelYearOp    = match[1];
  const modelYearValue = parseInt(match[2], 10);

  // Resolve product name → DN Part IDs via lookup table
  const [partRows] = await db.execute(
    `SELECT DISTINCT dn_part_id
     FROM lookup_commodities
     WHERE LOWER(COALESCE(NULLIF(product_description, ''), product_name)) = LOWER(?)
     ORDER BY dn_part_id`,
    [product]
  );

  const dnPartIds = partRows.map((r) => r.dn_part_id);
  if (dnPartIds.length === 0) {
    return res.status(404).json({
      error: `No DN Part IDs found for product '${product}'`,
    });
  }

  const inPlaceholders = dnPartIds.map(() => "?").join(", ");
  const where =
    `\`Customer\` = ? ` +
    `AND \`DN Part ID\` IN (${inPlaceholders}) ` +
    `AND CAST(\`Model Year\` AS SIGNED) ${modelYearOp} ?`;

  const previewSQL = `SELECT ${PREVIEW_COLUMNS} FROM claims_prod WHERE ${where} LIMIT ${limit}`;
  const countSQL   = `SELECT COUNT(*) AS total FROM claims_prod WHERE ${where}`;
  const params     = [customer, ...dnPartIds, modelYearValue];

  const [previewRows] = await db.execute(previewSQL, params);
  const [countRows]   = await db.execute(countSQL, params);

  res.json({
    customer,
    product,
    dn_part_ids: dnPartIds,
    model_year: `${modelYearOp}${modelYearValue}`,
    sql: previewSQL,
    preview_count: previewRows.length,
    total_count: countRows[0].total,
    rows: previewRows,
  });
}

module.exports = { filterByCustProductYear };
