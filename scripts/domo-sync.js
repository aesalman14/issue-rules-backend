/**
 * domo-sync.js — Sync new claims from DOMO into MySQL
 * 
 * Run: node scripts/domo-sync.js
 * 
 * First run: creates table + loads everything
 * Nightly: appends only new DN Claim IDs
 * 
 * Column types match the DOMO Prod Warranty schema.
 * Original column names preserved (with spaces).
 */
require("dotenv").config();
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { getDomoToken } = require("./domo-auth");
const { getConnection } = require("./mysql_connect");

// ─── Config ──────────────────────────────────────────
const DATASET_ID = process.env.DOMO_PROD_DATASET_ID;
const TEMP_DIR = path.join(__dirname, "..", "temp");
const CSV_FILE = path.join(TEMP_DIR, "claims_export.csv");

// ─── Exact Column Types ─────────────────────────────
// Matches your DOMO schema. Keys are exact column names.
const COLUMN_MAP = {
  // Primary key
  "DN Claim ID": "VARCHAR(100) NOT NULL PRIMARY KEY",

  // VARCHAR(50) fields
  "Customer Claim Number": "VARCHAR(50)",
  "Customer": "VARCHAR(50)",
  "VIN": "VARCHAR(50)",
  "Make": "VARCHAR(50)",
  "Model": "VARCHAR(50)",
  "Model Code": "VARCHAR(50)",
  "Model Series": "VARCHAR(50)",
  "Model Platform": "VARCHAR(50)",
  "Engine": "VARCHAR(50)",
  "Engine Description": "VARCHAR(50)",
  "Engine Family": "VARCHAR(50)",
  "Transmission": "VARCHAR(50)",
  "Transmission Description": "VARCHAR(50)",
  "Assembly Plant Code": "VARCHAR(50)",
  "Assembly Plant Description": "VARCHAR(50)",
  "Dealer Code": "VARCHAR(50)",
  "Dealer Name": "VARCHAR(50)",
  "Dealer CIty": "VARCHAR(50)",
  "Dealer State": "VARCHAR(50)",
  "Dealer Zip Code": "VARCHAR(50)",
  "Dealer Country": "VARCHAR(50)",
  "Complaint Code": "VARCHAR(50)",
  "Complaint Code Description": "VARCHAR(50)",
  "Failure Code": "VARCHAR(50)",
  "Failure Code Description": "VARCHAR(50)",
  "DN Part ID": "VARCHAR(50)",
  "PG Product Group": "VARCHAR(50)",
  "Product Family": "VARCHAR(50)",
  "Product Group": "VARCHAR(50)",
  "Product Subgroup": "VARCHAR(50)",
  "Product Description": "VARCHAR(50)",
  "Claimed Part Number": "VARCHAR(50)",
  "Claimed Part Number Description": "VARCHAR(50)",
  "Claimed Part Description": "VARCHAR(50)",
  "Application": "VARCHAR(50)",
  "Labor Code": "VARCHAR(50)",
  "Labor Code Description": "VARCHAR(50)",
  "Currency": "VARCHAR(50)",
  "Supplier Code": "VARCHAR(50)",
  "Custom Column 1": "VARCHAR(50)",
  "Responsibility ID": "VARCHAR(50)",
  "Responsible Engineer": "VARCHAR(50)",
  "DN Username": "VARCHAR(50)",
  "File Name": "VARCHAR(50)",
  "Upload Date": "VARCHAR(50)",
  "DN Assy PN": "VARCHAR(50)",
  "DN Plant - Manuf": "VARCHAR(50)",
  "DN Plant - Assy": "VARCHAR(50)",
  "Product Model Type": "VARCHAR(50)",
  "SubComponent Type": "VARCHAR(50)",
  "SubComponent DN Plant": "VARCHAR(50)",
  "Application Note": "VARCHAR(50)",
  "Customer Comment Category": "VARCHAR(50)",
  "Customer Comment Category Source": "VARCHAR(50)",
  "Customer Comment Category 2": "VARCHAR(50)",
  "Customer Comment Category 2 Source": "VARCHAR(50)",
  "Dealer Comment Category": "VARCHAR(50)",
  "Dealer Comment Category Source": "VARCHAR(50)",
  "Dealer Comment Category 2": "VARCHAR(50)",
  "Dealer Comment Category 2 Source": "VARCHAR(50)",
  "Issue ID": "VARCHAR(50)",
  "Issue ID Source": "VARCHAR(50)",
  "Part Identifier": "VARCHAR(50)",
  "Customer Comment Category AI": "VARCHAR(50)",
  "New Customer Comment Category AI": "VARCHAR(50)",
  "Customer Free Comment Category AI": "VARCHAR(50)",
  "Dealer Comment Category AI": "VARCHAR(50)",
  "New Dealer Comment Category AI": "VARCHAR(50)",
  "Dealer Free Comment Category AI": "VARCHAR(50)",
  "Dealer Causal Component AI": "VARCHAR(50)",
  "rank": "VARCHAR(50)",
  "labels": "VARCHAR(50)",
  "reason": "VARCHAR(50)",

  // BIGINT fields
  "Model Year": "BIGINT",
  "Fiscal Year": "BIGINT",
  "MIS": "BIGINT",
  "Mileage": "BIGINT",
  "Model Year (Fixed)": "BIGINT",
  "Return Tracking ID": "BIGINT",

  // DATE fields
  "Vehicle Build Date": "DATE",
  "Vehicle Sale Date": "DATE",
  "Vehicle Repair Date": "DATE",
  "Claim Process Date": "DATE",

  // NUMERIC fields
  "Labor Time (Hr)": "DOUBLE",
  "Labor Cost": "DECIMAL(15,5)",
  "Part Cost": "DECIMAL(15,5)",
  "Misc Cost": "DECIMAL(15,5)",
  "Claim Total Cost": "DECIMAL(15,5)",

  // TEXT fields (comments can be very long)
  "Customer Comments": "TEXT",
  "Dealer Comments": "TEXT",
  "Correction Comments": "TEXT",
  "Additional Claimed Part Numbers": "TEXT",
  "Additional Claimed Part Number Description": "TEXT",
};

// ─── Indexes ─────────────────────────────────────────
const INDEXES = [
  "INDEX idx_part_year_customer (`DN Part ID`, `Model Year`, `Customer`)",
  "INDEX idx_model (`Model`)",
];

// ─── Step 1: Export CSV from DOMO ────────────────────
async function exportFromDomo(datasetId) {
  console.log("Step 1: Exporting CSV from DOMO...");
  const tokenData = await getDomoToken();
  const token = tokenData.access_token;

  const response = await axios.get(
    `https://api.domo.com/v1/datasets/${datasetId}/data?includeHeader=true`,
    {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "stream",
    }
  );

  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }

  const writer = fs.createWriteStream(CSV_FILE);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", () => {
      const stats = fs.statSync(CSV_FILE);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(1);
      console.log(`  Saved: ${CSV_FILE} (${sizeMB} MB)`);
      resolve(CSV_FILE);
    });
    writer.on("error", reject);
  });
}

// ─── Step 2: Create table if not exists ──────────────
async function ensureTable(conn) {
  console.log("Step 2: Checking claims_prod table...");

  // Check if table exists
  const [tables] = await conn.execute(
    "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'claims_prod'",
    [process.env.MYSQL_DATABASE]
  );

  if (tables.length > 0) {
    const [countRows] = await conn.execute("SELECT COUNT(*) AS total FROM claims_prod");
    console.log(`  Table exists with ${countRows[0].total.toLocaleString()} rows`);
    return false;
  }

  // Read CSV header to know which columns exist
  const readline = require("readline");
  const fileStream = fs.createReadStream(CSV_FILE);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let firstLine = "";
  for await (const line of rl) {
    firstLine = line;
    break;
  }
  rl.close();
  fileStream.destroy();

  const csvColumns = firstLine
    .split(",")
    .map((col) => col.replace(/"/g, "").trim())
    .filter((col) => col.length > 0);

  console.log(`  Found ${csvColumns.length} columns in CSV`);

  // Build column definitions from the map
  const colDefs = [];
  let mapped = 0;
  let unmapped = 0;

  for (const col of csvColumns) {
    const type = COLUMN_MAP[col];
    if (type) {
      colDefs.push(`\`${col}\` ${type}`);
      mapped++;
    } else {
      // Fallback for any column not in the map
      colDefs.push(`\`${col}\` VARCHAR(255)`);
      unmapped++;
      console.log(`  Warning: unmapped column "${col}" → VARCHAR(255)`);
    }
  }

  console.log(`  Mapped: ${mapped}, Unmapped: ${unmapped}`);

  // Only add indexes for columns that exist
  const validIndexes = INDEXES.filter((idx) => {
    const match = idx.match(/`([^`]+)`/);
    return match && csvColumns.includes(match[1]);
  });

  const allDefs = [...colDefs, ...validIndexes];

  const createSQL = `
    CREATE TABLE claims_prod (
      ${allDefs.join(",\n      ")}
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  `;

  console.log(`  Creating table with ${colDefs.length} columns and ${validIndexes.length} indexes`);
  await conn.execute(createSQL);
  console.log("  Table created");
  return true;
}

// ─── Step 3: Load data ──────────────────────────────
async function loadData(conn, isNewTable) {
  const start = Date.now();

  await conn.execute("SET NAMES utf8mb4");
  await conn.execute("SET FOREIGN_KEY_CHECKS = 0");
  await conn.execute("SET sql_mode = ''");

  if (isNewTable) {
    // First run — load everything
    console.log("Step 3: First run — loading all rows...");

    await conn.query({
      sql: `LOAD DATA LOCAL INFILE ?
            INTO TABLE claims_prod
            CHARACTER SET binary
            FIELDS TERMINATED BY ','
            OPTIONALLY ENCLOSED BY '"'
            LINES TERMINATED BY '\\n'
            IGNORE 1 ROWS`,
      values: [CSV_FILE],
      infileStreamFactory: () => fs.createReadStream(CSV_FILE),
    });
  } else {
    // Nightly — append only new rows
    console.log("Step 3: Nightly run — finding new claims...");

    // Create temp table with same structure
    await conn.execute("DROP TABLE IF EXISTS claims_prod_temp");
    await conn.execute("CREATE TABLE claims_prod_temp LIKE claims_prod");

    // Remove primary key from temp so duplicates don't error
    try {
      await conn.execute("ALTER TABLE claims_prod_temp DROP PRIMARY KEY");
    } catch (e) {
      // No primary key to drop, that's fine
    }

    // Load full CSV into temp
    await conn.query({
      sql: `LOAD DATA LOCAL INFILE ?
            INTO TABLE claims_prod_temp
            CHARACTER SET binary
            FIELDS TERMINATED BY ','
            OPTIONALLY ENCLOSED BY '"'
            LINES TERMINATED BY '\\n'
            IGNORE 1 ROWS`,
      values: [CSV_FILE],
      infileStreamFactory: () => fs.createReadStream(CSV_FILE),
    });

    const [tempCount] = await conn.execute("SELECT COUNT(*) AS total FROM claims_prod_temp");
    console.log(`  Temp table: ${tempCount[0].total.toLocaleString()} rows`);

    // Insert only new DN Claim IDs
    const [insertResult] = await conn.execute(`
      INSERT INTO claims_prod
      SELECT t.* FROM claims_prod_temp t
      LEFT JOIN claims_prod p ON t.\`DN Claim ID\` = p.\`DN Claim ID\`
      WHERE p.\`DN Claim ID\` IS NULL
    `);

    console.log(`  New rows added: ${insertResult.affectedRows.toLocaleString()}`);

    // Drop temp
    await conn.execute("DROP TABLE IF EXISTS claims_prod_temp");
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  const [rows] = await conn.execute("SELECT COUNT(*) AS total FROM claims_prod");
  const count = rows[0].total;

  console.log(`  claims_prod total: ${count.toLocaleString()} rows (${elapsed}s)`);
  return count;
}

// ─── Step 4: Cleanup ─────────────────────────────────
function cleanup() {
  console.log("Step 4: Cleaning up...");
  if (fs.existsSync(CSV_FILE)) {
    fs.unlinkSync(CSV_FILE);
    console.log(`  Deleted: ${CSV_FILE}`);
  }
}

// ─── Run ─────────────────────────────────────────────
async function sync() {
  const totalStart = Date.now();
  console.log("");
  console.log("=== DOMO > MySQL Sync ===");
  console.log("Dataset:", DATASET_ID);
  console.log("");

  try {
    // Export CSV first (need header for table creation)
    await exportFromDomo(DATASET_ID);

    // Connect
    const mysql = require("mysql2/promise");
    const conn = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: parseInt(process.env.MYSQL_PORT || "3306"),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      charset: "utf8mb4",
      flags: ["LOCAL_FILES"],
    });

    // Create table if needed
    const isNewTable = await ensureTable(conn);

    // Load data
    const count = await loadData(conn, isNewTable);

    await conn.end();
    cleanup();

    const totalElapsed = ((Date.now() - totalStart) / 1000).toFixed(1);
    console.log("");
    console.log("=== Sync Complete ===");
    console.log(`  Total rows: ${count.toLocaleString()}`);
    console.log(`  Total time: ${totalElapsed}s`);
    console.log("");
  } catch (err) {
    console.error("Sync FAILED:", err.message);
    try {
      const mysql = require("mysql2/promise");
      const conn = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: parseInt(process.env.MYSQL_PORT || "3306"),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
      });
      await conn.execute("DROP TABLE IF EXISTS claims_prod_temp");
      await conn.end();
    } catch (e) {}
    cleanup();
    process.exit(1);
  }
}

if (require.main === module) {
  sync();
}

module.exports = { sync, exportFromDomo };