import { useEffect, useState } from "react";

const demoReport = {
  score: 62,
  roast:
    "You wrote this like the job was already yours. It is not. You listed responsibilities and waited for someone to call them achievements. They won't. They're busy, and this reads like a group project where your contribution was \"morale.\"",
  suggestions: [
    "Add a number. Percent, money, users, hours. \"I helped\" is not a plot twist.",
    "Your projects need receipts. What you built, which tools, and what changed. We are not taking your word for it.",
    "Delete “hardworking team player.” If you have to announce it, the work already failed the audition."
  ]
};

export default function Home() {
  const [resume, setResume] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [history, setHistory] = useState([]);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const savedResume = sessionStorage.getItem("roast-resume");
    const savedReport = sessionStorage.getItem("roast-report");
    const savedToken = sessionStorage.getItem("roast-token") || "";
    if (savedResume) setResume(savedResume);
    if (savedReport) {
      try {
        setReport(JSON.parse(savedReport));
      } catch {
        sessionStorage.removeItem("roast-report");
      }
    }
    if (savedToken) {
      setToken(savedToken);
      loadAccount(savedToken);
    }
  }, []);

  useEffect(() => {
    if (!report) return;
    document.getElementById("verdict")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [report]);

  async function loadAccount(activeToken) {
    const headers = { Authorization: `Bearer ${activeToken}` };
    const meResponse = await fetch("/api/auth/me", { headers });
    if (!meResponse.ok) {
      sessionStorage.removeItem("roast-token");
      setToken("");
      setUser(null);
      setHistory([]);
      return;
    }

    const me = await meResponse.json();
    setUser(me.user);
    const historyResponse = await fetch("/api/roasts", { headers });
    if (!historyResponse.ok) return;
    const data = await historyResponse.json();
    setHistory(data.roasts || []);
  }

  function rememberSession(nextToken, nextUser) {
    sessionStorage.setItem("roast-token", nextToken);
    setToken(nextToken);
    setUser(nextUser);
    setShowAuth(false);
    setAuthError("");
    loadAccount(nextToken);
  }

  function signOut() {
    sessionStorage.removeItem("roast-token");
    setToken("");
    setUser(null);
    setHistory([]);
  }

  async function submitAuth(event) {
    event.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    const path = authMode === "register" ? "/api/auth/register" : "/api/auth/login";

    try {
      const response = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authForm)
      });
      const data = await response.json();
      if (!response.ok) {
        setAuthError(data.error || "That account request failed.");
        return;
      }
      rememberSession(data.token, data.user);
      setAuthForm({ name: "", email: "", password: "" });
    } catch {
      setAuthError("The account service is not responding.");
    } finally {
      setAuthLoading(false);
    }
  }

  function keepReport(nextReport) {
    setReport(nextReport);
    if (nextReport) {
      sessionStorage.setItem("roast-report", JSON.stringify(nextReport));
      return;
    }
    sessionStorage.removeItem("roast-report");
  }

  async function roastResume() {
    if (!resume.trim()) {
      setError("A blank resume? Bold strategy. Paste your resume first.");
      return;
    }

    setError("");
    setLoading(true);
    keepReport(null);
    sessionStorage.setItem("roast-resume", resume);

    try {
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;
      const response = await fetch("/api/roast", {
        method: "POST",
        headers,
        body: JSON.stringify({ resume })
      });

      if (!response.ok) {
        throw new Error("The roast service isn't available yet.");
      }

      const data = await response.json();
      keepReport(data);
      if (token) loadAccount(token);
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
    keepReport(demoReport);
  }

  function reset() {
    setResume("");
    keepReport(null);
    sessionStorage.removeItem("roast-resume");
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
        {user ? (
          <div className="account-bar">
            <span>{user.name}</span>
            <button className="ghost" onClick={signOut}>
              SIGN OUT
            </button>
          </div>
        ) : (
          <button className="ghost" onClick={() => setShowAuth((open) => !open)}>
            {showAuth ? "CLOSE" : "SIGN IN"}
          </button>
        )}
      </header>

      {showAuth && !user && (
        <form className="auth-panel" onSubmit={submitAuth}>
          <div>
            <p className="meta">{authMode === "register" ? "NEW ACCOUNT" : "RETURNING"}</p>
            <h2>{authMode === "register" ? "CREATE A RECORD" : "OPEN YOUR FILE"}</h2>
          </div>
          <div className="auth-fields">
            {authMode === "register" && (
              <label>
                NAME
                <input
                  value={authForm.name}
                  onChange={(event) =>
                    setAuthForm({ ...authForm, name: event.target.value })
                  }
                  required
                />
              </label>
            )}
            <label>
              EMAIL
              <input
                type="email"
                value={authForm.email}
                onChange={(event) =>
                  setAuthForm({ ...authForm, email: event.target.value })
                }
                required
              />
            </label>
            <label>
              PASSWORD
              <input
                type="password"
                value={authForm.password}
                onChange={(event) =>
                  setAuthForm({ ...authForm, password: event.target.value })
                }
                minLength={8}
                required
              />
            </label>
            {authError && <p className="error">{authError}</p>}
            <div className="actions">
              <button className="cta" disabled={authLoading}>
                {authLoading ? "CHECKING" : authMode === "register" ? "CREATE ACCOUNT" : "SIGN IN"}
              </button>
              <button
                className="ghost"
                type="button"
                onClick={() => {
                  setAuthMode(authMode === "register" ? "login" : "register");
                  setAuthError("");
                }}
              >
                {authMode === "register" ? "I ALREADY HAVE AN ACCOUNT" : "CREATE AN ACCOUNT"}
              </button>
            </div>
          </div>
        </form>
      )}

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
        <section className="report" id="verdict">
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

      {user && (
        <section className="history">
          <div>
            <p className="meta">ARCHIVE</p>
            <h2>PAST VERDICTS</h2>
          </div>
          {history.length === 0 ? (
            <p className="rail-copy">Nothing filed under your name yet. Run an analysis and it will stay here.</p>
          ) : (
            <div className="history-list">
              {history.map((item) => (
                <button
                  className="history-item"
                  key={item.id}
                  onClick={() => {
                    setResume(item.resumeText || "");
                    keepReport(item);
                  }}
                >
                  <span>{item.score}/100</span>
                  <p>{item.roast}</p>
                </button>
              ))}
            </div>
          )}
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

        .account-bar {
          display: flex;
          align-items: center;
          gap: 18px;
          color: #f4efe6;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .auth-panel {
          display: grid;
          grid-template-columns: 220px minmax(0, 1fr);
          gap: 28px;
          align-items: end;
          padding: 28px 0;
          border-bottom: 1px solid #2a2a2a;
        }

        .auth-fields {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          align-items: end;
        }

        .auth-fields .error,
        .auth-fields .actions,
        .auth-fields .rail-copy,
        .reset-code {
          grid-column: 1 / -1;
        }

        .reset-code {
          margin: 0;
          color: #b49a62;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.18em;
        }

        .auth-panel h2 {
          margin: 12px 0 0;
          font-size: 22px;
          letter-spacing: -0.04em;
        }

        .auth-panel label {
          display: grid;
          gap: 8px;
          color: #8a857c;
          font-size: 10px;
          letter-spacing: 0.18em;
        }

        .auth-panel input {
          width: 100%;
          padding: 12px;
          border: 1px solid #2a2a2a;
          background: #090909;
          color: #f4efe6;
          border-radius: 0;
          outline: none;
        }

        .auth-panel input:focus {
          border-color: #b49a62;
        }

        .history {
          padding: 48px 0 8px;
          border-top: 1px solid #2a2a2a;
        }

        .history h2 {
          margin: 14px 0 0;
          font-size: 28px;
          letter-spacing: -0.04em;
        }

        .history-list {
          margin-top: 28px;
        }

        .history-item {
          display: grid;
          grid-template-columns: 88px minmax(0, 1fr);
          gap: 24px;
          width: 100%;
          padding: 18px 0;
          border: none;
          border-bottom: 1px solid #222;
          background: transparent;
          color: #c8c2b6;
          text-align: left;
          cursor: pointer;
        }

        .history-item span {
          color: #b49a62;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.14em;
        }

        .history-item p {
          margin: 0;
          overflow: hidden;
          font-size: 14px;
          line-height: 1.6;
          white-space: nowrap;
          text-overflow: ellipsis;
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
          .verdict-grid,
          .auth-panel,
          .auth-fields,
          .history-item {
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
