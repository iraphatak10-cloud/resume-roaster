import { useState } from "react";

const demoReport = {
  score: 62,
  roast:
    "Your resume has the confidence of a CEO and the evidence of an unpaid intern. You list responsibilities like achievements and expect recruiters to connect the dots. They won't. They're busy.",
  suggestions: [
    "Replace vague claims with measurable results. Numbers are more convincing than adjectives.",
    "Your projects need proof of impact. Explain what you built, which tools you used, and what actually worked.",
    "Cut generic phrases like “hardworking team player.” Demonstrate those qualities with evidence instead."
  ]
};

export default function Home() {
  const [resume, setResume] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  async function roastResume() {
    if (!resume.trim()) {
      setError("A blank resume? Bold strategy. Paste your resume first.");
      return;
    }

    setError("");
    setLoading(true);
    setReport(null);

    try {
      const response = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume })
      });

      if (!response.ok) {
        throw new Error("The roast service isn't available yet.");
      }

      const data = await response.json();
      setReport(data);
    } catch {
      setError(
        "Couldn't get a real AI report. Check that your backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  function tryDemo() {
    setError("");
    setReport(demoReport);
  }

  function reset() {
    setResume("");
    setReport(null);
    setError("");
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".txt")) {
      setError("For now, please use a plain-text .txt file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setResume(String(reader.result || ""));
      setError("");
    };
    reader.onerror = () => setError("We couldn't read that file.");
    reader.readAsText(file);
  }

  return (
    <main className="page">
      <header className="nav">
        <a href="/" className="wordmark">
          ROAST <span>/</span> OFFICE
        </a>
        <span className="nav-label">AI-POWERED ANALYSIS</span>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="meta">ISSUE 01 — EDITORIAL REVIEW</p>
          <h1>
            YOUR RESUME.
            <br />
            UNDER
            <br />
            <em>OATH.</em>
          </h1>
          <p className="lede">
            A precise, unsentimental reading of what you claim versus what you
            can prove. No ornament. No mercy. Only the record.
          </p>
        </div>

        <aside className="side-index" aria-label="Review criteria">
          <p className="meta">INDEX</p>
          <ol>
            <li>
              <span>01</span> / EXPERIENCE
            </li>
            <li>
              <span>02</span> / IMPACT
            </li>
            <li>
              <span>03</span> / CREDIBILITY
            </li>
          </ol>
        </aside>
      </section>

      <section className="work">
        <div className="work-rail">
          <p className="meta">SUBMISSION</p>
          <h2>THE RECORD</h2>
          <p className="rail-copy">
            Paste the document or attach a plain-text file. The analysis
            addresses structure, evidence, and tone.
          </p>
        </div>

        <div className="dossier">
          <div className="dossier-head">
            <span className="meta">DOCUMENT</span>
            <label className="file-control">
              UPLOAD .TXT
              <input
                type="file"
                accept=".txt,text/plain"
                onChange={handleFileChange}
              />
            </label>
          </div>

          <label className="field-label" htmlFor="resume">
            RESUME CONTENT <span>{resume.length} CH</span>
          </label>

          <textarea
            id="resume"
            value={resume}
            onChange={(event) => setResume(event.target.value)}
            placeholder={
              "NAME\nROLE\nEXPERIENCE\nPROJECTS\nSKILLS\n\nPaste the full resume here."
            }
            rows={12}
          />

          {error && <p className="error">{error}</p>}

          <div className="actions">
            <button
              className="cta"
              onClick={roastResume}
              disabled={loading}
            >
              {loading ? "READING THE RECORD" : "BEGIN ANALYSIS"}
            </button>
            <button className="ghost" onClick={tryDemo} disabled={loading}>
              SAMPLE REPORT
            </button>
          </div>

          <p className="disclaimer">
            SAMPLE REPORTS ARE ILLUSTRATIVE. REAL REVIEWS REQUIRE THE AI
            BACKEND. AVOID UPLOADING SENSITIVE PERSONAL INFORMATION WHILE
            TESTING.
          </p>
        </div>
      </section>

      {report && (
        <section className="report">
          <div className="report-head">
            <div>
              <p className="meta">FINDINGS</p>
              <h2>VERDICT</h2>
            </div>
            <button className="reset" onClick={reset}>
              RESET
            </button>
          </div>

          <div className="verdict-grid">
            <div className="score-col">
              <p className="meta">SCORE</p>
              <p className="score">
                {report.score ?? "—"}
                <span>/100</span>
              </p>
              <div className="rule" />
              <p className="score-note">Measured against evidence, not ambition.</p>
            </div>

            <div className="roast-col">
              <p className="meta">THE ROAST</p>
              <p className="roast-text">
                {report.roast || report.feedback || "No roast returned."}
              </p>
            </div>
          </div>

          <div className="recs">
            <p className="meta">RECOMMENDATIONS</p>
            <div className="rec-list">
              {(report.suggestions || report.improvements || []).map(
                (item, index) => (
                  <article className="rec" key={index}>
                    <span className="rec-num">
                      0{index + 1}
                    </span>
                    <p>
                      {typeof item === "string"
                        ? item
                        : item.text ||
                          item.suggestion ||
                          "Review this suggestion."}
                    </p>
                  </article>
                )
              )}
            </div>
          </div>
        </section>
      )}

      <footer className="footer">
        <span>ROAST / OFFICE  ©  2026</span>
        <span>SWISS EDITORIAL REVIEW</span>
      </footer>

      <style jsx>{`
        :global(*) {
          box-sizing: border-box;
        }

        :global(html),
        :global(body) {
          margin: 0;
          background: #090909;
          color: #f4efe6;
          font-family: Helvetica, Arial, "Helvetica Neue", sans-serif;
        }

        :global(button),
        :global(textarea),
        :global(input) {
          font: inherit;
        }

        .page {
          min-height: 100vh;
          max-width: 1180px;
          margin: 0 auto;
          padding: 0 48px 48px;
        }

        .meta {
          margin: 0;
          color: #b49a62;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.28em;
          text-transform: uppercase;
        }

        .nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 72px;
          border-bottom: 1px solid #2a2a2a;
        }

        .wordmark {
          color: #f4efe6;
          text-decoration: none;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.32em;
        }

        .wordmark span {
          color: #b49a62;
          margin: 0 2px;
        }

        .nav-label {
          color: #8a857c;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.24em;
        }

        .hero {
          display: grid;
          grid-template-columns: minmax(0, 1.7fr) minmax(220px, 0.7fr);
          gap: 48px;
          padding: 72px 0 56px;
          border-bottom: 1px solid #2a2a2a;
        }

        .hero h1 {
          margin: 18px 0 28px;
          font-size: clamp(48px, 8.4vw, 104px);
          font-weight: 700;
          line-height: 0.88;
          letter-spacing: -0.055em;
          text-transform: uppercase;
        }

        .hero h1 em {
          font-style: normal;
          color: #b49a62;
        }

        .lede {
          max-width: 420px;
          margin: 0;
          color: #b8b2a7;
          font-size: 14px;
          line-height: 1.7;
          letter-spacing: 0.01em;
        }

        .side-index {
          align-self: end;
          padding: 24px 0 8px 28px;
          border-left: 1px solid #2a2a2a;
        }

        .side-index ol {
          margin: 22px 0 0;
          padding: 0;
          list-style: none;
        }

        .side-index li {
          padding: 14px 0;
          border-bottom: 1px solid #222;
          color: #f4efe6;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.18em;
        }

        .side-index li span {
          color: #b49a62;
        }

        .work {
          display: grid;
          grid-template-columns: 220px minmax(0, 1fr);
          gap: 48px;
          padding: 56px 0;
        }

        .work-rail h2,
        .report-head h2 {
          margin: 14px 0 0;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.04em;
        }

        .rail-copy {
          margin: 18px 0 0;
          color: #8f8a82;
          font-size: 12px;
          line-height: 1.7;
        }

        .dossier {
          border: 1px solid #2a2a2a;
          padding: 28px;
        }

        .dossier-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 22px;
          padding-bottom: 16px;
          border-bottom: 1px solid #222;
        }

        .file-control {
          position: relative;
          color: #f4efe6;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          cursor: pointer;
        }

        .file-control input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }

        .field-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          color: #8a857c;
          font-size: 10px;
          letter-spacing: 0.22em;
        }

        .field-label span {
          color: #b49a62;
        }

        textarea {
          width: 100%;
          min-height: 280px;
          resize: vertical;
          padding: 18px;
          border: 1px solid #2a2a2a;
          background: #090909;
          color: #f4efe6;
          font-size: 13px;
          line-height: 1.75;
          outline: none;
          border-radius: 0;
        }

        textarea:focus {
          border-color: #b49a62;
        }

        textarea::placeholder {
          color: #5c5852;
        }

        .error {
          margin: 16px 0 0;
          padding: 12px 0;
          color: #d7b4ab;
          border-top: 1px solid #5a3a34;
          border-bottom: 1px solid #5a3a34;
          font-size: 12px;
          line-height: 1.6;
        }

        .actions {
          display: flex;
          align-items: center;
          gap: 24px;
          margin-top: 22px;
        }

        .cta {
          padding: 14px 22px;
          background: #b49a62;
          border: 1px solid #b49a62;
          color: #090909;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.22em;
          cursor: pointer;
          border-radius: 0;
        }

        .cta:hover:not(:disabled) {
          background: #c7ad73;
        }

        .cta:disabled {
          opacity: 0.55;
          cursor: wait;
        }

        .ghost,
        .reset {
          padding: 0;
          background: transparent;
          border: none;
          color: #b49a62;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.22em;
          cursor: pointer;
        }

        .ghost:disabled {
          opacity: 0.5;
          cursor: wait;
        }

        .disclaimer {
          margin: 22px 0 0;
          color: #6e6a64;
          font-size: 9px;
          line-height: 1.7;
          letter-spacing: 0.12em;
        }

        .report {
          padding: 48px 0 24px;
          border-top: 1px solid #2a2a2a;
        }

        .report-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 40px;
        }

        .reset {
          padding: 8px 0;
          border-bottom: 1px solid #b49a62;
        }

        .verdict-grid {
          display: grid;
          grid-template-columns: 240px minmax(0, 1fr);
          gap: 48px;
          padding-bottom: 40px;
          border-bottom: 1px solid #2a2a2a;
        }

        .score {
          margin: 8px 0 18px;
          font-size: 96px;
          font-weight: 700;
          line-height: 0.85;
          letter-spacing: -0.07em;
        }

        .score span {
          display: inline-block;
          margin-left: 8px;
          color: #6e6a64;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.16em;
          vertical-align: 28px;
        }

        .rule {
          width: 48px;
          height: 1px;
          background: #b49a62;
        }

        .score-note {
          margin: 16px 0 0;
          color: #8f8a82;
          font-size: 12px;
          line-height: 1.6;
        }

        .roast-text {
          margin: 16px 0 0;
          max-width: 640px;
          color: #e7e1d6;
          font-size: 22px;
          font-weight: 500;
          line-height: 1.45;
          letter-spacing: -0.02em;
        }

        .recs {
          padding-top: 40px;
        }

        .rec-list {
          margin-top: 8px;
        }

        .rec {
          display: grid;
          grid-template-columns: 56px minmax(0, 1fr);
          gap: 24px;
          padding: 22px 0;
          border-bottom: 1px solid #222;
        }

        .rec-num {
          color: #b49a62;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.18em;
        }

        .rec p {
          margin: 0;
          color: #c8c2b6;
          font-size: 14px;
          line-height: 1.7;
        }

        .footer {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          margin-top: 24px;
          padding-top: 22px;
          border-top: 1px solid #2a2a2a;
          color: #6e6a64;
          font-size: 9px;
          letter-spacing: 0.2em;
        }

        @media (max-width: 860px) {
          .page {
            padding: 0 20px 36px;
          }

          .hero,
          .work,
          .verdict-grid {
            grid-template-columns: 1fr;
            gap: 28px;
          }

          .hero {
            padding: 48px 0 36px;
          }

          .side-index {
            padding: 0;
            border-left: none;
            border-top: 1px solid #2a2a2a;
          }

          .side-index ol {
            display: grid;
            gap: 0;
          }

          .work {
            padding: 36px 0;
          }

          .dossier {
            padding: 20px;
          }

          .actions {
            flex-direction: column;
            align-items: stretch;
          }

          .score {
            font-size: 72px;
          }

          .roast-text {
            font-size: 18px;
          }

          .footer {
            flex-direction: column;
          }
        }
      `}</style>
    </main>
  );
}
