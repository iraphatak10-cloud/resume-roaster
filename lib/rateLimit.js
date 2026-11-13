const buckets = new Map();

function clientKey(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "local";
}

function rateLimit(req, { limit = 12, windowMs = 60000 } = {}) {
  const key = clientKey(req);
  const now = Date.now();
  const hits = (buckets.get(key) || []).filter((time) => now - time < windowMs);
  if (hits.length >= limit) {
    const error = new Error("Slow down. Try again in a minute.");
    error.status = 429;
    throw error;
  }
  hits.push(now);
  buckets.set(key, hits);
}

module.exports = { rateLimit };
