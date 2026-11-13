const SYSTEM = `You roast resumes for a site called Roast Office.
Return only JSON with this shape:
{"score": number, "roast": string, "suggestions": [string, string, string]}

Score from 0 to 100 based on evidence, structure, and credibility.
The roast is 3 to 5 sentences. Talk to the person. Be funny and specific to their resume, sharp enough that they think "why are you roasting me this hard?"
Do not use slurs, do not insult their identity, age, gender, race, disability, or appearance. Roast the writing and the missing proof.
Suggestions are 3 or 4 concrete fixes. Keep the same funny tone, and make each one something they can edit today.`;

function extractReport(text) {
  const cleaned = String(text).replace(/```json|```/gi, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Gemini did not return JSON.");
  }

  const parsed = JSON.parse(cleaned.slice(start, end + 1));
  const score = Number(parsed.score);
  const suggestions = Array.isArray(parsed.suggestions)
    ? parsed.suggestions.map((item) => String(item).trim()).filter(Boolean).slice(0, 4)
    : [];

  if (!Number.isFinite(score) || !parsed.roast || suggestions.length < 3) {
    throw new Error("Gemini returned an incomplete report.");
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    roast: String(parsed.roast).trim(),
    suggestions
  };
}

async function roastWithGemini(resume) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const error = new Error("GEMINI_API_KEY is not set.");
    error.code = "NO_KEY";
    throw error;
  }

  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": apiKey
      },
      signal: AbortSignal.timeout(20000),
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: [
          {
            role: "user",
            parts: [{ text: `Roast this resume:\n\n${resume}` }]
          }
        ],
        generationConfig: {
          temperature: 0.9
        }
      })
    }
  );

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload.error?.message || "Gemini request failed.";
    const detail = payload.error?.details ? ` ${JSON.stringify(payload.error.details).slice(0, 300)}` : "";
    const error = new Error(`${message}${detail}`);
    error.code = "GEMINI_HTTP";
    error.status = response.status;
    throw error;
  }

  const text = (payload.candidates?.[0]?.content?.parts || [])
    .map((part) => part.text || "")
    .join("\n");

  return extractReport(text);
}

module.exports = { roastWithGemini };
