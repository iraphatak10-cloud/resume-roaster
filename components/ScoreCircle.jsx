export default function ScoreCircle({ score }) {
  const value = Number.isFinite(Number(score)) ? Math.round(Number(score)) : null;
  return (
    <div className="score-col">
      <p className="meta">SCORE</p>
      <p className="score">
        {value ?? "—"}
        <span>/100</span>
      </p>
      <div className="rule" />
      <p className="score-note">Measured against evidence, not ambition.</p>
      <style jsx>{`
        .meta {
          margin: 0;
          color: #b49a62;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.28em;
          text-transform: uppercase;
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
      `}</style>
    </div>
  );
}
