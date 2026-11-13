const { initDb } = require("../../../lib/db");
const { register } = require("../../../lib/accounts");
const { rateLimit } = require("../../../lib/rateLimit");

export default async function handler(req, res) {
  try {
    rateLimit(req, { limit: 8, windowMs: 60000 });
    await initDb();
    return register(req, res);
  } catch (error) {
    if (error.status === 429) {
      return res.status(429).json({ error: error.message });
    }
    console.error(error);
    return res.status(500).json({ error: "Auth is unavailable right now." });
  }
}
