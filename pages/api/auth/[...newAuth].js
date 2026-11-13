const { initDb } = require("../../../lib/db");
const { register, login, me } = require("../../../lib/accounts");
const { rateLimit } = require("../../../lib/rateLimit");

function actionName(req) {
  const value = req.query.newAuth;
  return Array.isArray(value) ? value[0] || "" : value || "";
}

export default async function handler(req, res) {
  try {
    rateLimit(req, { limit: 20, windowMs: 60000 });
    await initDb();
    const action = actionName(req);

    if (action === "register" || action === "signup") return register(req, res);
    if (action === "login") return login(req, res);
    if (action === "me") return me(req, res);

    return res.status(404).json({ error: "Unknown auth route." });
  } catch (error) {
    if (error.status === 429) {
      return res.status(429).json({ error: error.message });
    }
    console.error(error);
    return res.status(500).json({ error: "Auth is unavailable right now." });
  }
}
