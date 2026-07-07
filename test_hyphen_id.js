const dotenv = require('dotenv');
const path = require('path');
const axios = require('axios');

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const HYPHEN_CONFIG = {
  userId: process.env.HYPHEN_USER_ID || "zkfnth01",
  hKey: process.env.HYPHEN_HKEY || "bebc2c0dfab3266b",
  baseUrl: "https://api.hyphen.im",
  gustation: process.env.HYPHEN_GUSTATION || "N"
};

async function testHometaxIdDuplicate(userId) {
  try {
    console.log(`[Test] Checking userId: ${userId}`);
    const headers = {
      "user-id": HYPHEN_CONFIG.userId,
      "Hkey": HYPHEN_CONFIG.hKey,
      "Content-Type": "application/json"
    };
    if (HYPHEN_CONFIG.gustation === "Y") headers["hyphen-gustation"] = "Y";

    const res = await axios.post(`${HYPHEN_CONFIG.baseUrl}/in0076000354`, {
      userId
    }, { headers, timeout: 30000 });

    console.log("[Response] Status:", res.status);
    console.log("[Response] Common:", JSON.stringify(res.data?.common, null, 2));
    console.log("[Response] Data:", JSON.stringify(res.data?.data, null, 2));
  } catch (error) {
    if (error.response) {
      console.error("[HTTP Error]", error.response.status, JSON.stringify(error.response.data));
    } else {
      console.error("[Error]", error.message);
    }
  }
}

// Test with a random ID
const randomId = 'testetr' + Math.floor(1000 + Math.random() * 9000);
testHometaxIdDuplicate(randomId).then(() => process.exit(0));
