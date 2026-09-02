-- Fightbase schema: profiles (with roles), fighters, forum, synced favorites
-- Run this once in Supabase Dashboard -> SQL Editor -> New query -> Run

-- 1. Profiles (role lives here, not in auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  username text unique,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

-- if the table already existed before this column was added:
alter table profiles add column if not exists username text unique;

alter table profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can update their own profile (not role)"
  on profiles for update using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from profiles where id = auth.uid()));

-- auto-create a profile row whenever someone signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Fighters (admin-editable info cards)
create table if not exists fighters (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  nickname text,
  sport text,
  record text,
  bio text,
  career text,
  photo_url text,
  updated_by uuid references profiles(id),
  updated_at timestamptz not null default now()
);

alter table fighters enable row level security;

create policy "Fighters are viewable by everyone"
  on fighters for select using (true);

create policy "Only admins can insert fighters"
  on fighters for insert with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Only admins can update fighters"
  on fighters for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Only admins can delete fighters"
  on fighters for delete using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- 3. Forum
create table if not exists forum_threads (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists forum_posts (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references forum_threads(id) on delete cascade,
  user_id uuid references profiles(id),
  content text not null,
  created_at timestamptz not null default now()
);

alter table forum_threads enable row level security;
alter table forum_posts enable row level security;

create policy "Threads are viewable by everyone"
  on forum_threads for select using (true);
create policy "Logged-in users can create threads"
  on forum_threads for insert with check (auth.uid() = created_by);
create policy "Users can delete their own threads, admins any"
  on forum_threads for delete using (
    auth.uid() = created_by
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Posts are viewable by everyone"
  on forum_posts for select using (true);
create policy "Logged-in users can create posts"
  on forum_posts for insert with check (auth.uid() = user_id);
create policy "Users can delete their own posts, admins any"
  on forum_posts for delete using (
    auth.uid() = user_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- 4. Synced favorites (replaces localStorage once a user is logged in)
create table if not exists favorites (
  user_id uuid not null references profiles(id) on delete cascade,
  promotion text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, promotion)
);

alter table favorites enable row level security;

create policy "Users manage their own favorites"
  on favorites for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 5. Make yourself admin after signing up once on the live site:
-- update profiles set role = 'admin' where email = 'YOUR_EMAIL_HERE';
