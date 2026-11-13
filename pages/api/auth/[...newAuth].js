const { User, initDb, publicUser } = require("../../../lib/db");
const { hashPassword, checkPassword, signToken, readUserId } = require("../../../lib/auth");

function actionName(req) {
  const value = req.query.newAuth;
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function readBody(req) {
  return req.body && typeof req.body === "object" ? req.body : {};
}

export default async function handler(req, res) {
  try {
    await initDb();
    const action = actionName(req);

    if (action === "register") return register(req, res);
    if (action === "login") return login(req, res);
    if (action === "me") return me(req, res);

    return res.status(404).json({ error: "Unknown auth route." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Auth is unavailable right now." });
  }
}

async function register(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST to create an account." });
  }

  const { name, email, password } = readBody(req);
  const cleanName = typeof name === "string" ? name.trim() : "";
  const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const cleanPassword = typeof password === "string" ? password : "";

  if (!cleanName || cleanName.length > 80) {
    return res.status(400).json({ error: "Add a name under 80 characters." });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return res.status(400).json({ error: "That email does not look usable." });
  }

  if (cleanPassword.length < 8 || cleanPassword.length > 200) {
    return res.status(400).json({ error: "Use a password of at least 8 characters." });
  }

  const existing = await User.findOne({ where: { email: cleanEmail } });
  if (existing) {
    return res.status(409).json({ error: "An account with that email already exists." });
  }

  const user = await User.create({
    name: cleanName,
    email: cleanEmail,
    passwordHash: await hashPassword(cleanPassword)
  });

  return res.status(201).json({ token: signToken(user), user: publicUser(user) });
}

async function login(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST to log in." });
  }

  const { email, password } = readBody(req);
  const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const cleanPassword = typeof password === "string" ? password : "";
  const user = await User.findOne({ where: { email: cleanEmail } });
  const matches = user ? await checkPassword(cleanPassword, user.passwordHash) : false;

  if (!user || !matches) {
    return res.status(401).json({ error: "Email or password is wrong." });
  }

  return res.status(200).json({ token: signToken(user), user: publicUser(user) });
}

async function me(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Use GET for the current account." });
  }

  const userId = readUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "Log in first." });
  }

  const user = await User.findByPk(userId);
  if (!user) {
    return res.status(401).json({ error: "That login is no longer valid." });
  }

  return res.status(200).json({ user: publicUser(user) });
}
