/**
 * src/config/constants.js — Shared constants
 */

// Safe subset of claims_prod columns used in SELECT (never SELECT *)
const PREVIEW_COLUMNS = [
  "DN Claim ID", "Customer", "VIN", "Model Year", "Model",
  "DN Part ID", "Failure Code", "Failure Code Description",
  "Claimed Part Number", "Claimed Part Description",
  "Vehicle Repair Date", "Mileage", "Claim Total Cost",
  "Customer Comments", "Dealer Comments",
].map((c) => `\`${c}\``).join(", ");

// White-listed body fields -> DB column mapping for issue updates
const ALLOWED_ISSUE_FIELDS = {
  owner: "Owner",
  customer: "Customer",
  subject: "Subject",
  status: "Status",
  dn_part_id: "DN Part ID",
  checksheet_id: "Checksheet ID",
  major_issue_no: "Major Issue No",
  customer_tracking_number: "Customer Tracking Number",
  bulletin_number: "Bulletin Number",
  dn_design_location: "DN Design Location",
  dn_plant_id: "DN Plant ID",
  responsibility_category: "Responsibility Category",
  progress_updates: "Progress Updates",
  countermeasure: "Countermeasure",
  vehicles_affected: "Vehicles Affected",
  failure_ratio: "Failure Ratio",
  dn_share_ratio: "DN Share Ratio",
  service_contribution_ratio: "Service Contribution Ratio",
  activated: "Activated",
  sql_code: "SQL Code",
};

const DOMO_SYNC_DATASET_NAME = "Issue Rules Domo Sync";

const DOMO_SYNC_COLUMNS = [
  "DN Claim ID",
  "VIN",
  "Model Year",
  "Model Year (Fixed)",
  "Model",
  "Engine",
  "Vehicle Build Date",
  "Vehicle Sale Date",
  "Vehicle Repair Date",
  "Mileage",
  "MIS",
  "DN Part ID",
  "Product Description",
  "Application",
  "Customer",
  "Claimed Part Number",
  "Complaint Code",
  "Complaint Code Description",
  "Failure Code",
  "Failure Code Description",
  "Customer Comments",
  "Dealer Comments",
  "Correction Comments",
  "Customer Comment Category",
  "Customer Comment Category 2",
  "Dealer Comment Category",
  "Dealer Comment Category 2",
  "Issue ID",
  "Customer Comment Category Source",
  "Customer Comment Category 2 Source",
  "Dealer Comment Category Source",
  "Dealer Comment Category 2 Source",
];

module.exports = {
  PREVIEW_COLUMNS,
  ALLOWED_ISSUE_FIELDS,
  DOMO_SYNC_DATASET_NAME,
  DOMO_SYNC_COLUMNS,
};
