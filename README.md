# Clozly

Clozly is a mobile-first decision helper for choosing clothing. It is not a "search app"—the UI stays minimal so users can decide quickly with a curated set of four items.

## ✨ What This Project Is
- A lightweight app that curates **4 items** from Amazon / ZOZO
- Focused on **reducing hesitation** rather than showing endless lists
- Designed for **small, private usage** (not public scale)

## ✅ Key UX Principles
- No long explanations or onboarding walls
- Inputs are simple and quick
- Users choose from only **four options**

## 🧭 Pages & Navigation
The UI is split into pages using App Router:

- `/search` — Main page for input and 4-card results
- `/quiz` — Preference questions (save anytime)
- `/basic` — Profile basics (height, weight, size, body type)
- `/account` — Login + full-body image + Gemini prompt

A sticky top bar includes:
- Logo (left)
- Tabs (left-aligned, fixed width)
- Account icon (right)

## 🧠 Search Logic (High Level)
1. Generate multiple search queries from user input
2. Scrape candidates from Amazon / ZOZO (Workers)
3. Exclude NG items + out-of-budget items
4. Score candidates and choose top 4 with variation

## 🧩 Feature Summary
- Google Login (NextAuth)
- Multi-query search plan
- Amazon / ZOZO scraping (Cloudflare Workers)
- Cache with Supabase (TTL-based)
- Full-body image saved in browser (IndexedDB)
- Gemini/Nano Banana prompt generator

## 🧱 Tech Stack
- Next.js (App Router)
- NextAuth (Google login)
- Supabase (cache + user data)
- Cloudflare Workers (scraping)

## 📁 Project Structure (Main)
```
app/
  search/        # Main search page
  quiz/          # Preference quiz
  basic/         # Profile basics
  account/       # Login + full-body image + prompt
components/
  SearchClient.tsx
  QuizClient.tsx
  BasicClient.tsx
  AccountClient.tsx
  TopNav.tsx
  AuthBar.tsx
lib/
  query.ts       # Build multiple queries
  scoring.ts     # Score + diversify
  cache.ts       # Supabase cache
  localImage.ts  # IndexedDB storage
workers/
  scrape/        # Cloudflare Workers scraper
```

## ⚙️ Setup (Local)
```bash
npm install
npm run dev
```

Copy environment variables:
```bash
cp .env.example .env.local
```

## 🔐 Environment Variables
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `WORKER_SCRAPE_URL`

## 🗃 Supabase Schema
```
# supabase/schema.sql
create table if not exists cache (
  key text primary key,
  payload jsonb not null,
  expires_at timestamptz
);
```

## ⚠️ Notes
- Scraping selectors may need adjustments over time
- Google login will not work without env vars
- Workers URL missing → mock data will be used
- Budget max (¥20,000) can be treated as "no limit"

## 📝 Ongoing Rule
All implementation notes and context are kept in `AGENTS.md`. Please read it first when starting a new session.

---

If you'd like, I can add screenshots or a short demo section later. 😌
