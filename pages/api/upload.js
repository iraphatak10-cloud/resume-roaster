const { parsePDF } = require("../../lib/pdfParser");
const { rateLimit } = require("../../lib/rateLimit");

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "4mb"
    }
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST to upload a PDF." });
  }

  try {
    rateLimit(req, { limit: 8, windowMs: 60000 });
    const filename = typeof req.body?.filename === "string" ? req.body.filename : "";
    const data = typeof req.body?.data === "string" ? req.body.data : "";

    if (!filename.toLowerCase().endsWith(".pdf") || !data) {
      return res.status(400).json({ error: "Upload a PDF resume." });
    }

    const fileBuffer = Buffer.from(data, "base64");
    if (!fileBuffer.length || fileBuffer.length > 4 * 1024 * 1024) {
      return res.status(413).json({ error: "That PDF is too large. Keep it under 4 MB." });
    }

    const text = await parsePDF(fileBuffer);
    if (text.length > 20000) {
      return res.status(413).json({ error: "That resume is too long after extraction." });
    }

    return res.status(200).json({ text, filename });
  } catch (error) {
    const status = error.status || 400;
    console.error(error);
    return res.status(status).json({
      error: error.message || "Could not extract text from that PDF."
    });
  }
}
