export default function Header({ user, onSignOut, onToggleAuth, authOpen }) {
  return (
    <header className="nav">
      <a href="/" className="wordmark">
        ROAST <span>/</span> OFFICE
      </a>
      {user ? (
        <div className="account-bar">
          <span>{user.name}</span>
          <button className="ghost" onClick={onSignOut} type="button">
            SIGN OUT
          </button>
        </div>
      ) : (
        <button className="ghost" onClick={onToggleAuth} type="button">
          {authOpen ? "CLOSE" : "SIGN IN"}
        </button>
      )}
      <style jsx>{`
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
        .ghost {
          padding: 0;
          background: transparent;
          border: none;
          color: #b49a62;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.22em;
          cursor: pointer;
        }
      `}</style>
    </header>
  );
}
