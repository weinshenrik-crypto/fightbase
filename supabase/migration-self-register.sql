-- Allow logged-in users to register their own fighter profile, not just admins.
-- Run this once in Supabase Dashboard -> SQL Editor -> New query -> Run.

-- 1. Add a stable slug and an "owner" column
alter table fighters add column if not exists slug text unique;
alter table fighters add column if not exists claimed_by uuid references profiles(id);

-- backfill slugs for existing rows (simple slugify: lowercase, non-alnum -> hyphen)
update fighters
set slug = trim(both '-' from regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g'))
where slug is null;

-- 2. Replace admin-only write policies with owner-or-admin policies
drop policy if exists "Only admins can insert fighters" on fighters;
drop policy if exists "Only admins can update fighters" on fighters;
drop policy if exists "Only admins can delete fighters" on fighters;

create policy "Users can register their own fighter profile"
  on fighters for insert with check (
    claimed_by = auth.uid()
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Owners and admins can update a fighter profile"
  on fighters for update using (
    claimed_by = auth.uid()
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Owners and admins can delete a fighter profile"
  on fighters for delete using (
    claimed_by = auth.uid()
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
