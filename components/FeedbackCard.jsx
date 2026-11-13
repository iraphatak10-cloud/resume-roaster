export default function FeedbackCard({ index, text }) {
  return (
    <article className="rec">
      <span className="rec-num">0{index + 1}</span>
      <p>{text}</p>
      <style jsx>{`
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
      `}</style>
    </article>
  );
}
