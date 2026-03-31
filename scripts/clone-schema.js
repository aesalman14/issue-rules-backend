require("dotenv").config();
const mysql = require("mysql2/promise");

function quoteIdentifier(identifier) {
  return `\`${String(identifier).replace(/`/g, "``")}\``;
}

function quoteSchemaOption(optionName, optionValue) {
  if (!/^[0-9A-Za-z_]+$/.test(String(optionValue))) {
    throw new Error(`Invalid ${optionName} \"${optionValue}\" returned by MySQL.`);
  }

  return String(optionValue);
}

async function getServerConnection() {
  return mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT || "3306", 10),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    multipleStatements: false,
  });
}

async function getSchemaDefaults(connection, schemaName) {
  const [rows] = await connection.query(
    `
      SELECT DEFAULT_CHARACTER_SET_NAME AS charsetName, DEFAULT_COLLATION_NAME AS collationName
      FROM information_schema.SCHEMATA
      WHERE SCHEMA_NAME = ?
    `,
    [schemaName],
  );

  if (!rows.length) {
    throw new Error(`Source schema \"${schemaName}\" was not found.`);
  }

  return rows[0];
}

async function getBaseTables(connection, schemaName) {
  const [rows] = await connection.query(
    `
      SELECT TABLE_NAME AS tableName
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = ?
        AND TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `,
    [schemaName],
  );

  return rows.map((row) => row.tableName);
}

async function cloneSchema({ sourceSchema, targetSchema }) {
  if (!sourceSchema || !targetSchema) {
    throw new Error("Both source and target schema names are required.");
  }

  if (sourceSchema === targetSchema) {
    throw new Error("Source and target schema names must be different.");
  }

  const connection = await getServerConnection();
  let originalSqlMode = null;

  try {
    const { charsetName, collationName } = await getSchemaDefaults(connection, sourceSchema);
    const tables = await getBaseTables(connection, sourceSchema);

    if (!tables.length) {
      throw new Error(`Source schema \"${sourceSchema}\" does not contain any base tables.`);
    }

    const safeCharset = quoteSchemaOption("character set", charsetName);
    const safeCollation = quoteSchemaOption("collation", collationName);

    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${quoteIdentifier(targetSchema)} CHARACTER SET ${safeCharset} COLLATE ${safeCollation}`,
    );

    console.log(`Cloning ${tables.length} tables from ${sourceSchema} to ${targetSchema}...`);

    const [sqlModeRows] = await connection.query("SELECT @@SESSION.sql_mode AS sqlMode");
    originalSqlMode = sqlModeRows[0]?.sqlMode ?? "";

    if (originalSqlMode) {
      console.log("Temporarily disabling strict SQL mode for legacy date values during clone...");
    }

    await connection.query("SET SESSION sql_mode = ''");
    await connection.query("SET FOREIGN_KEY_CHECKS = 0");

    for (const tableName of tables) {
      const sourceTable = `${quoteIdentifier(sourceSchema)}.${quoteIdentifier(tableName)}`;
      const targetTable = `${quoteIdentifier(targetSchema)}.${quoteIdentifier(tableName)}`;

      console.log(`- ${tableName}`);
      await connection.query(`DROP TABLE IF EXISTS ${targetTable}`);
      await connection.query(`CREATE TABLE ${targetTable} LIKE ${sourceTable}`);
      await connection.query(`INSERT INTO ${targetTable} SELECT * FROM ${sourceTable}`);
    }

    await connection.query("SET FOREIGN_KEY_CHECKS = 1");
    console.log(`Done. ${targetSchema} now mirrors ${sourceSchema}.`);
  } finally {
    try {
      await connection.query("SET FOREIGN_KEY_CHECKS = 1");
    } catch (error) {
      if (error && error.message) {
        console.warn("Could not reset FOREIGN_KEY_CHECKS:", error.message);
      }
    }

    if (originalSqlMode !== null) {
      try {
        await connection.query("SET SESSION sql_mode = ?", [originalSqlMode]);
      } catch (error) {
        if (error && error.message) {
          console.warn("Could not restore sql_mode:", error.message);
        }
      }
    }

    await connection.end();
  }
}

if (require.main === module) {
  const sourceSchema = process.argv[2] || process.env.MYSQL_DATABASE || "issue_rules";
  const targetSchema = process.argv[3] || `${sourceSchema}_dev`;

  cloneSchema({ sourceSchema, targetSchema }).catch((error) => {
    console.error("Schema clone failed:", error.message);
    process.exitCode = 1;
  });
}

module.exports = { cloneSchema };