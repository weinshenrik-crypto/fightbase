-- Events aus lib/events.ts in die Datenbank holen.
--
-- Grund: Events lagen als hartkodiertes Array im Code, jedes neue Event brauchte
-- also einen Deploy. Als Tabelle können sie ohne Deploy gepflegt werden; die
-- Seiten holen sie per ISR (stündliche Revalidierung) nach.
--
-- Spalten spiegeln den FightEvent-Typ. `slug` ist die bisherige `id` aus dem
-- Array (z.B. "oktagon-93") und bleibt der öffentliche URL-Teil unter /events/.

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  date date not null,
  sport text not null,
  promotion text not null,
  title text not null,
  main text not null,
  fighter_a text,
  fighter_b text,
  venue text not null default '',
  broadcaster text not null default '-',
  note text not null default '',
  -- Nur offiziell von der Promotion bestätigte Kämpfe, nie geraten.
  undercard text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_by uuid references profiles(id),
  updated_at timestamptz not null default now()
);

-- Die Kalenderabfragen filtern und sortieren fast immer nach Datum, und die
-- Sport-/Promotion-Landingpages filtern auf genau diese zwei Spalten.
create index if not exists events_date_idx on events (date);
create index if not exists events_sport_date_idx on events (sport, date);
create index if not exists events_promotion_date_idx on events (promotion, date);

alter table events enable row level security;

create policy "Events are viewable by everyone"
  on events for select using (true);

create policy "Only admins can insert events"
  on events for insert with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Only admins can update events"
  on events for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Only admins can delete events"
  on events for delete using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
