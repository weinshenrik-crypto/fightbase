-- Generalizes favorites from "promotion only" to (type, value) pairs so
-- sports, fighters, promotions and individual events can all be favorited,
-- and adds the tables needed to email users about their favorites.
-- Run this once in Supabase Dashboard -> SQL Editor -> New query -> Run.

drop table if exists favorites;
create table favorites (
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null check (type in ('sport', 'fighter', 'promotion', 'event')),
  value text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, type, value)
);

alter table favorites enable row level security;

create policy "Users manage their own favorites"
  on favorites for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Opt-in flag: only users who enable this get notification emails.
alter table profiles add column if not exists email_notifications boolean not null default false;

-- Tracks which event ids the notification cron has already seen, so only
-- events added after this migration trigger a "new event" email (the cron
-- bootstraps this table with all current events on its first run).
create table if not exists known_events (
  id text primary key,
  first_seen_at timestamptz not null default now()
);

-- Prevents duplicate emails for the same user/event/notification kind.
create table if not exists sent_notifications (
  user_id uuid not null references profiles(id) on delete cascade,
  event_id text not null,
  kind text not null check (kind in ('new_event', 'reminder')),
  sent_at timestamptz not null default now(),
  primary key (user_id, event_id, kind)
);

-- Both tables are only ever read/written by the server-side cron job using
-- the service-role key (which bypasses RLS) — enable RLS with no public
-- policies so they stay inaccessible via the anon/public API.
alter table known_events enable row level security;
alter table sent_notifications enable row level security;
