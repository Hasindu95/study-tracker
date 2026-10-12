# Study Tracker

A web app for Sri Lankan A/L students to log study sessions, see how their time is split across subjects each week, and get personalised advice from an AI study coach.

**Live demo:** https://study-tracker-gamma-teal.vercel.app/

## Features

- Log study sessions by subject and duration
- See total study time, plus a weekly breakdown per subject (biggest first)
- AI study coach: personalised weekly advice powered by Claude
- Sign up, log in and log out with email and password
- Private accounts: each user only ever sees their own sessions
- Weekly totals update instantly after logging a session

## Tech stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
- **Backend & database:** Supabase (PostgreSQL, Auth), Next.js route handlers
- **AI:** Claude API (Anthropic SDK), called from a Next.js route handler
- **Testing:** Vitest
- **Hosting:** Vercel (auto-deploys from GitHub)

## Security

Data privacy is enforced in the **database**, not just the UI:

- **Row Level Security (RLS)** is enabled on the `study_sessions` table. Policies use `auth.uid()` so users can only read and insert rows they own. This holds even if someone calls the API directly.
- Each row's `user_id` defaults to `auth.uid()`, so the app can't save a session under someone else's account.
- The `weekly_totals` view uses `security_invoker = true`, so it respects RLS instead of running with owner privileges and leaking other users' totals.
- Only the Supabase **publishable** key is used in the browser. No secret keys are in the codebase, and `.env.local` is git-ignored.

The full database schema is in [`supabase/schema.sql`](supabase/schema.sql).

## AI Study Coach

Click **Get advice** and the app sends your weekly totals to Claude (Anthropic's AI), which replies with short, personalised study advice. For example, it points out a subject that needs more time and suggests a plan. It even notices likely typos, like "Physcis" vs "Physics".

**How it works**

```
Browser  →  /api/coach (Next.js route handler, server-side)  →  Claude API
         ←                 plain-text advice                 ←
```

- The browser never talks to Claude directly. It calls my own server route, `/api/coach`, which calls the Claude API (`claude-opus-5-5`, low effort for fast, cheap responses).
- A system prompt sets the coach's tone, length (under 100 words) and output format (plain text, no Markdown).
- If the model declines a request, a server-side fallback answers instead, and the user gets a friendly message rather than an error.

**How it's protected**

- **The API key stays on the server.** `ANTHROPIC_API_KEY` has no `NEXT_PUBLIC_` prefix, so Next.js never sends it to the browser. In production it's stored as a Vercel environment variable, never in the code.
- **Only logged-in users can call the route.** The browser sends the user's Supabase access token (`Authorization: Bearer ...`). The route verifies it with Supabase *before* calling Claude, and returns `401` otherwise. So strangers can't use the endpoint to spend API credits, and rejected requests cost nothing.
- A monthly spending limit is set in the Anthropic Console as a final safety net.

## What I learned

- How React state and `useEffect` work, and why data fetching belongs in an effect rather than in the component body
- Why database-level security (RLS) matters: when I logged in, my anon-only policies blocked me, which taught me the difference between table grants and row policies
- Letting the database aggregate data (`GROUP BY` in a view) instead of downloading every row to the browser
- Debugging a real environment issue: a test runner failing because of an outdated Node.js version, despite a misleading error message
- Integrating an LLM safely: keeping the API key server-side, and proving my route was open to strangers before locking it with token verification
- Prompt engineering by reading the output critically, e.g. fixing unwanted Markdown formatting by changing the prompt, not the code

## Run locally

1. Clone the repo and install dependencies:
   ```bash
   pnpm install
   ```
2. Create a Supabase project and run `supabase/schema.sql` in its SQL Editor.
3. Get an API key from the [Anthropic Console](https://console.anthropic.com).
4. Create `.env.local` in the project root:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ANTHROPIC_API_KEY=your-anthropic-api-key
   ```
5. Start the dev server:
   ```bash
   pnpm dev
   ```
6. Run the tests:
   ```bash
   pnpm test
   ```