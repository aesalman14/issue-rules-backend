require("dotenv").config();

const {
  DOMO_SYNC_DATASET_NAME,
  DOMO_SYNC_COLUMNS,
} = require("../src/config/constants");
const { createDataset } = require("../src/services/domoDataset");

async function main() {
  const existingDatasetId = process.env.DOMO_ISSUE_RULES_SYNC_DATASET_ID;

  if (existingDatasetId) {
    console.log("DOMO_ISSUE_RULES_SYNC_DATASET_ID is already set:");
    console.log(`  ${existingDatasetId}`);
    console.log("");
    console.log("If you still want a brand new dataset, temporarily remove that env var and rerun this script.");
    return;
  }

  const dataset = await createDataset({
    name: DOMO_SYNC_DATASET_NAME,
    description:
      "Trimmed claims table synced from Issue Rule activations. Created once and reused for REPLACE uploads.",
    columns: DOMO_SYNC_COLUMNS,
  });

  console.log("Issue Rules Domo Sync dataset created successfully.");
  console.log(`  Dataset Name: ${dataset.name || DOMO_SYNC_DATASET_NAME}`);
  console.log(`  Dataset ID:   ${dataset.id}`);
  console.log("");
  console.log("Add this to your backend .env file:");
  console.log(`DOMO_ISSUE_RULES_SYNC_DATASET_ID=${dataset.id}`);
}

main().catch((err) => {
  console.error("Create dataset FAILED:", err.response?.data || err.message);
  process.exit(1);
});