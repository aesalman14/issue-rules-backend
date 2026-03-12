/**
 * mysql-connect.js — Test MySQL connection
 * Run: node scripts/mysql-connect.js
 */
require("dotenv").config();
const mysql = require("mysql2/promise");

async function getConnection() {
  return mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });
}

async function getPool() {
  return mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
  });
}

if (require.main === module) {
  (async () => {
    try {
      const conn = await getConnection();
      console.log("MySQL connected!");
      console.log("  Host:", process.env.MYSQL_HOST + ":" + process.env.MYSQL_PORT);
      console.log("  Database:", process.env.MYSQL_DATABASE);

      const [tables] = await conn.execute("SHOW TABLES");
      if (tables.length > 0) {
        console.log("  Tables:");
        tables.forEach((t) => console.log("    -", Object.values(t)[0]));
      } else {
        console.log("  No tables found yet.");
      }

      await conn.end();
    } catch (err) {
      console.error("MySQL FAILED:", err.message);
    }
  })();
}

module.exports = { getConnection, getPool };