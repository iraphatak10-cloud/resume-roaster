# Roast / Office

An AI resume roaster. Paste a resume or upload a PDF, then get a score, a roast, and edits you can make today.

Live site: https://resume-roaster-opal.vercel.app

## What it does

- React homepage for the resume, the verdict, and the account panel
- `POST /api/roast` sends the text to Gemini. If Gemini is unavailable, a local analyzer writes the review.
- `POST /api/upload` extracts text from a PDF
- `POST /api/auth/signup` and `POST /api/auth/login` create and open accounts
- Saved roasts stay in Sequelize (SQLite on your computer, Postgres when `DATABASE_URL` is set)

## Run it

```bash
npm install
npm run dev
```

Open http://127.0.0.1:3000

Copy `.env.example` to `.env.local` and fill in `GEMINI_API_KEY` and `JWT_SECRET`. Reviews are written by Gemini.
