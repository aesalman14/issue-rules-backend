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

module.exports = { PREVIEW_COLUMNS, ALLOWED_ISSUE_FIELDS };
