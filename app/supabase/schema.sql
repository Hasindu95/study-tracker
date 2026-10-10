-- Study Tracker database schema
-- Run in the Supabase SQL Editor to set up a fresh project.

-- Table: one row per study session
create table study_sessions (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid()
    references auth.users on delete cascade,
  subject text not null,
  minutes int not null,
  created_at timestamptz default now()
);

-- Lock the table (your project does this automatically, but writing it
-- here makes sure a fresh project is safe too)
alter table study_sessions enable row level security;

-- Lock 1: only logged-in users may use the table
grant select, insert on study_sessions to authenticated;

-- Lock 2: each user may only see and add their OWN rows
create policy "Users read own sessions"
on study_sessions for select
to authenticated
using (auth.uid() = user_id);

create policy "Users insert own sessions"
on study_sessions for insert
to authenticated
with check (auth.uid() = user_id);