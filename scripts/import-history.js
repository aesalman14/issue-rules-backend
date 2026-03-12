/**
 * import-history.js — Import SQL Server CSVs into MySQL
 * 
 * Handles messy CSVs with commas and newlines inside fields.
 * Uses papaparse for proper CSV parsing.
 * 
 * Usage:
 *   node scripts/import-history.js
 * 
 * Place these files in the project root before running:
 *   - Field_Issue_Tracking.csv
 *   - Field_Issues_Rule_Logic.csv
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const Papa = require("papaparse");

// ─── Config ──────────────────────────────────────────
const TRACKING_CSV = path.join(__dirname, "..", "issue_tracking.csv");
const LOGIC_CSV = path.join(__dirname, "..", "rule_logic.csv");

// ─── Parse CSV properly ──────────────────────────────
function parseCSV(filePath) {
  console.log(`  Parsing: ${filePath}`);
  const fileContent = fs.readFileSync(filePath, "utf8");
  const result = Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false, // keep everything as strings for safe insert
  });

  if (result.errors.length > 0) {
    console.log(`  Warnings: ${result.errors.length} parse issues (continuing anyway)`);
  }

  console.log(`  Parsed: ${result.data.length} rows, ${result.meta.fields.length} columns`);
  console.log(`  Columns: ${result.meta.fields.join(", ")}`);
  return { rows: result.data, columns: result.meta.fields };
}

// ─── Create table + insert ───────────────────────────
async function importTable(conn, tableName, csvPath) {
  console.log(`\n=== Importing ${tableName} ===`);

  if (!fs.existsSync(csvPath)) {
    console.error(`  File not found: ${csvPath}`);
    console.error(`  Place the CSV in: ${path.dirname(csvPath)}`);
    return;
  }

  const { rows, columns } = parseCSV(csvPath);
  if (rows.length === 0) {
    console.log("  No rows found — skipping");
    return;
  }

  // Drop existing table
  await conn.execute(`DROP TABLE IF EXISTS \`${tableName}\``);

  // Create table — all columns as TEXT to avoid truncation issues
  const colDefs = columns.map((col) => `\`${col}\` TEXT`);
  const createSQL = `CREATE TABLE \`${tableName}\` (${colDefs.join(", ")}) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
  await conn.execute(createSQL);
  console.log(`  Created table: ${tableName}`);

  // Insert rows in batches of 100
  const batchSize = 100;
  let inserted = 0;

  const placeholderRow = "(" + columns.map(() => "?").join(", ") + ")";

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const placeholders = batch.map(() => placeholderRow).join(", ");
    const values = [];

    for (const row of batch) {
      for (const col of columns) {
        const val = row[col];
        values.push(val === undefined || val === "" ? null : val);
      }
    }

    const insertSQL = `INSERT INTO \`${tableName}\` (${columns.map((c) => `\`${c}\``).join(", ")}) VALUES ${placeholders}`;
    await conn.execute(insertSQL, values);
    inserted += batch.length;
  }

  console.log(`  Inserted: ${inserted} rows`);

  // Verify
  const [countRows] = await conn.execute(`SELECT COUNT(*) AS total FROM \`${tableName}\``);
  console.log(`  Verified: ${countRows[0].total} rows in ${tableName}`);
}

// ─── Run ─────────────────────────────────────────────
async function main() {
  console.log("\n=== SQL Server History Import ===\n");

  const mysql = require("mysql2/promise");
  const conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT || "3306"),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    charset: "utf8mb4",
  });

  await conn.execute("SET sql_mode = ''");

  await importTable(conn, "issue_tracking_history", TRACKING_CSV);
  await importTable(conn, "rule_logic_history", LOGIC_CSV);

  await conn.end();
  console.log("\n=== Import Complete ===\n");
}

main().catch((err) => {
  console.error("Import FAILED:", err.message);
  process.exit(1);
});