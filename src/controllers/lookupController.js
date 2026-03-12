/**
 * src/controllers/lookupController.js
 *
 * Lookup endpoints for dropdown-backed values in the UI.
 */
const { getDb } = require("../config/db");

async function getCommodityOptions(req, res) {
  const db = getDb();

  const [rows] = await db.execute(
    `SELECT
       dn_part_id,
       COALESCE(NULLIF(product_description, ''), product_name) AS product_description,
       pg_product_group,
       product_family,
       product_group,
       product_subgroup
     FROM lookup_commodities
     ORDER BY product_description, dn_part_id`
  );

  const options = rows.map((r) => {
    const parts = [
      r.product_description,
      r.pg_product_group,
      r.product_family,
      r.product_group,
      r.product_subgroup,
    ].filter((v) => v && v.toString().trim() !== "");

    return {
      value: r.dn_part_id,
      label: parts.join(" | "),
      selected_label: r.product_description,
      product_description: r.product_description,
      pg_product_group: r.pg_product_group,
      product_family: r.product_family,
      product_group: r.product_group,
      product_subgroup: r.product_subgroup,
    };
  });

  res.json(options);
}

async function getProducts(req, res) {
  const db = getDb();
  const [rows] = await db.execute(
    "SELECT DISTINCT COALESCE(NULLIF(product_description, ''), product_name) AS product_description FROM lookup_commodities ORDER BY product_description"
  );
  res.json(rows.map((r) => r.product_description));
}

async function getDnPartIds(req, res) {
  const db = getDb();
  const product = (req.query.product || "").toString().trim();

  if (!product) {
    return res.status(400).json({ error: "Query param 'product' is required" });
  }

  const [rows] = await db.execute(
    "SELECT DISTINCT dn_part_id FROM lookup_commodities WHERE COALESCE(NULLIF(product_description, ''), product_name) = ? ORDER BY dn_part_id",
    [product]
  );
  res.json(rows.map((r) => r.dn_part_id));
}

async function getCustomers(req, res) {
  const db = getDb();
  const [rows] = await db.execute(
    "SELECT customer_name FROM lookup_customers ORDER BY customer_name"
  );
  res.json(rows.map((r) => r.customer_name));
}

async function getIssueStatuses(req, res) {
  const db = getDb();
  const [rows] = await db.execute(
    "SELECT issue_status_name FROM lookup_issue_statuses ORDER BY issue_status_name"
  );
  res.json(rows.map((r) => r.issue_status_name));
}

async function getDesignLocations(req, res) {
  const db = getDb();
  const [rows] = await db.execute(
    "SELECT design_location_name FROM lookup_design_locations ORDER BY design_location_name"
  );
  res.json(rows.map((r) => r.design_location_name));
}

async function getPlants(req, res) {
  const db = getDb();
  const [rows] = await db.execute(
    "SELECT dn_plant_id, dn_plant_name FROM lookup_plants ORDER BY dn_plant_id"
  );
  res.json(
    rows.map((r) => ({
      value: r.dn_plant_id,
      label:
        r.dn_plant_name === r.dn_plant_id
          ? r.dn_plant_id
          : `${r.dn_plant_id} (${r.dn_plant_name})`,
      dn_plant_id: r.dn_plant_id,
      dn_plant_name: r.dn_plant_name,
    }))
  );
}

async function getResponsibilityCategories(req, res) {
  const db = getDb();
  const [rows] = await db.execute(
    `SELECT responsibility_category, responsibility_category_description
     FROM lookup_responsibility_categories
     ORDER BY responsibility_category`
  );
  res.json(
    rows.map((r) => ({
      value: r.responsibility_category,
      label: `${r.responsibility_category} - ${r.responsibility_category_description}`,
      responsibility_category: r.responsibility_category,
      responsibility_category_description: r.responsibility_category_description,
    }))
  );
}

module.exports = {
  getCommodityOptions,
  getProducts,
  getDnPartIds,
  getCustomers,
  getIssueStatuses,
  getDesignLocations,
  getPlants,
  getResponsibilityCategories,
};
