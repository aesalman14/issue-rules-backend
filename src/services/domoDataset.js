const axios = require("axios");
const { getDomoToken } = require("../../scripts/domo-auth");

const DOMO_COLUMN_TYPES = {
  "DN Claim ID": "STRING",
  VIN: "STRING",
  "Model Year": "LONG",
  "Model Year (Fixed)": "LONG",
  Model: "STRING",
  Engine: "STRING",
  "Vehicle Build Date": "DATE",
  "Vehicle Sale Date": "DATE",
  "Vehicle Repair Date": "DATE",
  Mileage: "LONG",
  MIS: "LONG",
  "DN Part ID": "STRING",
  "Product Description": "STRING",
  Application: "STRING",
  Customer: "STRING",
  "Claimed Part Number": "STRING",
  "Complaint Code": "STRING",
  "Complaint Code Description": "STRING",
  "Failure Code": "STRING",
  "Failure Code Description": "STRING",
  "Customer Comments": "STRING",
  "Dealer Comments": "STRING",
  "Correction Comments": "STRING",
  "Customer Comment Category": "STRING",
  "Customer Comment Category 2": "STRING",
  "Dealer Comment Category": "STRING",
  "Dealer Comment Category 2": "STRING",
  "Issue ID": "STRING",
  "Customer Comment Category Source": "STRING",
  "Customer Comment Category 2 Source": "STRING",
  "Dealer Comment Category Source": "STRING",
  "Dealer Comment Category 2 Source": "STRING",
};

function normalizeDatasetValue(value) {
  if (value === null || value === undefined) return "";
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return value;
}

function escapeCsvValue(value) {
  const normalized = normalizeDatasetValue(value);
  if (normalized === null || normalized === undefined) return "";
  const text = String(normalized);
  if (!/[",\r\n]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

function rowsToCsv(columns, rows) {
  const header = columns.map(escapeCsvValue).join(",");
  const lines = (rows || []).map((row) =>
    columns.map((column) => escapeCsvValue(row?.[column])).join(",")
  );
  return [header, ...lines].join("\n");
}

function getDatasetSchema(columns) {
  return {
    columns: (columns || []).map((name) => ({
      type: DOMO_COLUMN_TYPES[name] || "STRING",
      name,
    })),
  };
}

async function createDataset({ name, description, columns }) {
  const tokenData = await getDomoToken();
  const payload = {
    name,
    description,
    rows: 0,
    schema: getDatasetSchema(columns),
  };

  const { data } = await axios.post("https://api.domo.com/v1/datasets", payload, {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      "Content-Type": "application/json",
    },
  });

  return data;
}

async function replaceDatasetData({ datasetId, columns, rows }) {
  if (!datasetId) {
    throw new Error(
      "Missing DOMO_ISSUE_RULES_SYNC_DATASET_ID. Add it to the backend .env file before activating DOMO sync."
    );
  }

  const tokenData = await getDomoToken();
  const csv = rowsToCsv(columns, rows);

  await axios.put(
    `https://api.domo.com/v1/datasets/${encodeURIComponent(datasetId)}/data`,
    csv,
    {
      params: { updateMethod: "REPLACE" },
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "text/csv",
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    }
  );

  return {
    datasetId,
    rowsUploaded: Array.isArray(rows) ? rows.length : 0,
    columnsUploaded: Array.isArray(columns) ? columns.length : 0,
  };
}

module.exports = {
  createDataset,
  getDatasetSchema,
  replaceDatasetData,
  rowsToCsv,
};