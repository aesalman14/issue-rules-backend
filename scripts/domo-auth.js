/**
 * domo-auth.js — Get DOMO OAuth token
 * Run: node scripts/domo-auth.js
 */
require("dotenv").config();
const axios = require("axios");

async function getDomoToken() {
  const { DOMO_CLIENT_ID, DOMO_CLIENT_SECRET } = process.env;

  if (!DOMO_CLIENT_ID || !DOMO_CLIENT_SECRET) {
    throw new Error("Missing DOMO_CLIENT_ID or DOMO_CLIENT_SECRET in .env file");
  }

  const credentials = Buffer.from(`${DOMO_CLIENT_ID}:${DOMO_CLIENT_SECRET}`).toString("base64");

  const response = await axios.get("https://api.domo.com/oauth/token", {
    params: { grant_type: "client_credentials", scope: "data" },
    headers: { Authorization: `Basic ${credentials}` },
  });

  return response.data;
}

if (require.main === module) {
  getDomoToken()
    .then((data) => {
      console.log("DOMO Auth successful!");
      console.log("  Token:", data.access_token.substring(0, 30) + "...");
      console.log("  Expires in:", data.expires_in + "s");
      console.log("  Scope:", data.scope);
    })
    .catch((err) => {
      console.error("DOMO Auth FAILED:", err.response?.data || err.message);
    });
}

module.exports = { getDomoToken };