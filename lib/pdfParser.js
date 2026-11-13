const pdfParse = require("pdf-parse");

async function parsePDF(fileBuffer) {
  const result = await pdfParse(fileBuffer);
  const text = String(result.text || "").replace(/\u0000/g, "").trim();
  if (!text) {
    throw new Error("That PDF has no readable text. Export it as text, or paste the resume.");
  }
  return text;
}

module.exports = { parsePDF };
