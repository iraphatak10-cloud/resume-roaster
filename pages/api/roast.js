const { analyzeResume } = require("../../lib/analyzeResume");
const { roastWithClaude } = require("../../lib/claude");
const { roastWithGemini } = require("../../lib/gemini");
const { Roast, initDb } = require("../../lib/db");
const { readUserId } = require("../../lib/auth");

const MAX_CHARS = 20000;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST with the resume text." });
  }

  const resume = typeof req.body?.resume === "string" ? req.body.resume.trim() : "";

  if (!resume) {
    return res.status(400).json({ error: "Paste a resume before asking for a verdict." });
  }

  if (resume.length > MAX_CHARS) {
    return res.status(413).json({
      error: "That resume is too long. Keep it under 20,000 characters."
    });
  }

  let report;
  let source = "local";

  try {
    if (process.env.GEMINI_API_KEY) {
      report = await roastWithGemini(resume);
      source = "gemini";
    } else if (process.env.ANTHROPIC_API_KEY) {
      report = await roastWithClaude(resume);
      source = "claude";
    } else {
      throw new Error("No AI key is set.");
    }
  } catch (error) {
    console.error(error.message);
    report = analyzeResume(resume);
    source = "local";
  }

  try {
    await initDb();
    const userId = readUserId(req);
    await Roast.create({
      resumeText: resume,
      score: report.score,
      roast: report.roast,
      suggestions: JSON.stringify(report.suggestions),
      source,
      UserId: userId
    });
  } catch (error) {
    console.error(error);
  }

  return res.status(200).json({
    score: report.score,
    roast: report.roast,
    suggestions: report.suggestions,
    source
  });
}
