const { Roast, initDb } = require("../../lib/db");
const { readUserId } = require("../../lib/auth");

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Use GET to read saved roasts." });
  }

  try {
    await initDb();
    const userId = readUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Log in first." });
    }

    const rows = await Roast.findAll({
      where: { UserId: userId },
      order: [["createdAt", "DESC"]],
      limit: 20
    });

    return res.status(200).json({
      roasts: rows.map((row) => ({
        id: row.id,
        score: row.score,
        roast: row.roast,
        suggestions: JSON.parse(row.suggestions),
        source: row.source,
        resumeText: row.resumeText,
        createdAt: row.createdAt
      }))
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Saved roasts are unavailable right now." });
  }
}
