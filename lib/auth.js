const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function secret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is required in production.");
  }
  return "dev-only-resume-roaster-secret";
}

function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

function checkPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, secret(), { expiresIn: "7d" });
}

function readUserId(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return null;

  try {
    const payload = jwt.verify(header.slice(7), secret());
    return payload.sub || null;
  } catch {
    return null;
  }
}

module.exports = { hashPassword, checkPassword, signToken, readUserId };
