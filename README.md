# Study Tracker

A web app for Sri Lankan A/L students to log study sessions and see how their time is split across subjects each week.

**Live demo:** https://study-tracker-gamma-teal.vercel.app/

## Features

- Log study sessions by subject and duration
- See total study time, plus a weekly breakdown per subject (biggest first)
- Sign up, log in and log out with email and password
- Private accounts: each user only ever sees their own sessions
- Weekly totals update instantly after logging a session

## Tech stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
- **Backend & database:** Supabase (PostgreSQL, Auth)
- **Testing:** Vitest
- **Hosting:** Vercel (auto-deploys from GitHub)

## Security

Data privacy is enforced in the **database**, not just the UI:

- **Row Level Security (RLS)** is enabled on the `study_sessions` table. Policies use `auth.uid()` so users can only read and insert rows they own. This holds even if someone calls the API directly.
- Each row's `user_id` defaults to `auth.uid()`, so the app can't save a session under someone else's account.
- The `weekly_totals` view uses `security_invoker = true`, so it respects RLS instead of running with owner privileges and leaking other users' totals.
- Only the Supabase **publishable** key is used in the browser. No secret keys are in the codebase, and `.env.local` is git-ignored.

The full database schema is in [`supabase/schema.sql`](supabase/schema.sql).

## What I learned

- How React state and `useEffect` work, and why data fetching belongs in an effect rather than in the component body
- Why database-level security (RLS) matters: when I logged in, my anon-only policies blocked me, which taught me the difference between table grants and row policies
- Letting the database aggregate data (`GROUP BY` in a view) instead of downloading every row to the browser
- Debugging a real environment issue: a test runner failing because of an outdated Node.js version, despite a misleading error message

## Run locally

1. Clone the repo and install dependencies:
   ```bash
   pnpm install
   ```
2. Create a Supabase project and run `supabase/schema.sql` in its SQL Editor.
3. Create `.env.local` in the project root:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://qksqqryaujgzkdeahapf.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_yZTEbgTzDa9zAo3DqXN7yg_EeJ0mo33
   ```
4. Start the dev server:
   ```bash
   pnpm dev
   ```
5. Run the tests:
   ```bash
   pnpm test
   ```