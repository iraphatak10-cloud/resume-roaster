export default function UploadDropzone({ onFile, busy }) {
  return (
    <label className="file-control">
      {busy ? "READING" : "UPLOAD PDF OR TXT"}
      <input
        type="file"
        accept=".pdf,.txt,application/pdf,text/plain"
        onChange={onFile}
        disabled={busy}
      />
      <style jsx>{`
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
      `}</style>
    </label>
  );
}
