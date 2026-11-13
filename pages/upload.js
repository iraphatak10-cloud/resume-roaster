import { useState } from "react";
import UploadDropzone from "../components/UploadDropzone";

export default function UploadPage() {
  const [status, setStatus] = useState("Choose a PDF. The text is extracted here, then sent to the review.");
  const [busy, setBusy] = useState(false);

  async function onFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setStatus("This page reads PDFs. Plain text can be pasted on the home page.");
      return;
    }
    setBusy(true);
    setStatus("Extracting the text.");
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      let binary = "";
      for (let i = 0; i < bytes.length; i += 0x8000) {
        binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      }
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, data: btoa(binary) })
      });
      const payload = await response.json();
      if (!response.ok) {
        setStatus(payload.error || "That PDF could not be read.");
        return;
      }
      sessionStorage.setItem("roast-resume", payload.text || "");
      window.location.href = "/";
    } catch {
      setStatus("That PDF could not be read.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page">
      <p className="meta">PDF</p>
      <h1>Extract the resume</h1>
      <p>{status}</p>
      <UploadDropzone onFile={onFile} busy={busy} />
      <p>
        <a href="/">Back to the review</a>
      </p>
      <style jsx>{`
        .page {
          max-width: 720px;
          margin: 0 auto;
          padding: 72px 24px;
          color: #f4efe6;
          background: #090909;
          min-height: 100vh;
        }
        .meta {
          color: #b49a62;
          letter-spacing: 0.28em;
          font-size: 10px;
          font-weight: 700;
        }
        h1 {
          font-size: 48px;
          letter-spacing: -0.04em;
        }
        a {
          color: #b49a62;
        }
      `}</style>
    </main>
  );
}
