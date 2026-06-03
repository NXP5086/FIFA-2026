# World Cup '26 Prediction Pool

A private-group prediction pool for FIFA World Cup 2026. Participants sign in via magic link, make score picks for every match, predict tournament awards, and compete on a shared leaderboard.

## Features

- **Schedule** — Group stage (72 matches) and knockouts (32 matches) with filters, auto-save drafts, and submit-to-lock picks
- **Awards** — Five tournament-end bonus picks (+5 pts each)
- **Leaderboard** — Live standings, podium, streaks, and per-round pick reveal
- **Rules** — Full scoring reference
- **Auth** — Magic link sign-in (no passwords) via Supabase
- **Shared backend** — Predictions stored in Supabase Postgres, visible across all devices

## Setup

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a new project, and note your **Project URL** and **Anon Key** from Settings → API.

### 2. Run the schema

In the Supabase SQL Editor, paste and run the contents of [`supabase/schema.sql`](supabase/schema.sql).

### 3. Configure participants

Edit [`src/lib/participants.js`](src/lib/participants.js) and replace the placeholder emails with each participant's real email address. The names and colours are already set — just update the `email` field for each person.

### 4. Configure Supabase auth

In the Supabase dashboard → Authentication → URL Configuration, add your deployed URL (e.g. `https://your-app.vercel.app`) to **Site URL** and **Redirect URLs**.

### 5. Set environment variables

```bash
cp .env.example .env
```

Fill in your values:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 6. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Enter your email to get a magic link.

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import it in [vercel.com](https://vercel.com).
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as Environment Variables in Vercel.
4. Deploy — share the URL with your 9 participants.

## How predictions work

- Each participant signs in with their email (magic link, no password).
- Picks are stored in Supabase and are shared across all devices — log in from any browser.
- The "Playing as" dropdown is gone; your identity comes from your login.
- Auto-lock windows (2h before each round's first match) are enforced client-side; picks can't be submitted after the lock.

## Build

```bash
npm run build
npm run preview
```
