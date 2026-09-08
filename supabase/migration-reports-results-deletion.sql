-- Drei Dinge auf einmal, weil sie zusammengehören: zwei Store-Anforderungen
-- (Meldefunktion, Kontolöschung) und die Ergebnisse für vergangene Events.

-- ---------------------------------------------------------------------------
-- 1. Meldungen
-- ---------------------------------------------------------------------------
-- Google Play und der App Store verlangen für nutzergenerierte Inhalte eine
-- Meldemöglichkeit direkt am Beitrag. Bisher stand in den Nutzungsbedingungen
-- nur "schreib uns eine E-Mail" — das erfüllt die Anforderung nicht.
--
-- Absichtlich schlank: wer meldet, was gemeldet wird, warum, und ob es schon
-- bearbeitet wurde. Kein Workflow-System für ein Forum dieser Größe.

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references profiles(id) on delete set null,
  -- Auf was sich die Meldung bezieht. Kein Fremdschlüssel, weil der gemeldete
  -- Beitrag gelöscht werden darf, ohne die Meldung mitzureißen — sonst
  -- verschwindet der Vorgang genau dann, wenn er erledigt wird.
  target_type text not null check (target_type in ('post', 'thread')),
  target_id uuid not null,
  reason text not null check (
    reason in ('spam', 'harassment', 'illegal', 'personal_data', 'other')
  ),
  detail text not null default '',
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now()
);

create index if not exists reports_status_idx on reports (status, created_at desc);
-- Verhindert, dass dieselbe Person denselben Beitrag mehrfach meldet.
create unique index if not exists reports_one_per_user_idx
  on reports (reporter_id, target_type, target_id);

alter table reports enable row level security;

-- Melden darf, wer angemeldet ist.
create policy "Signed-in users can report"
  on reports for insert with check (auth.uid() = reporter_id);

-- Lesen dürfen nur Admins — eine Meldung ist keine öffentliche Information.
create policy "Only admins can read reports"
  on reports for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Only admins can update reports"
  on reports for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ---------------------------------------------------------------------------
-- 2. Ergebnisse vergangener Events
-- ---------------------------------------------------------------------------
-- Eine Kampfkarte wird von unten nach oben abgearbeitet, deshalb `position`:
-- 1 ist das Main Event, höhere Zahlen liegen weiter unten auf der Karte. So
-- lässt sich die Karte in gewohnter Reihenfolge anzeigen, ohne sich auf die
-- Einfügereihenfolge zu verlassen.
--
-- `winner` darf leer sein — Unentschieden und No Contest sind reguläre
-- Ausgänge, kein fehlender Wert.

create table if not exists event_results (
  id uuid primary key default gen_random_uuid(),
  event_slug text not null references events(slug) on delete cascade,
  position int not null,
  bout text not null,
  winner text,
  -- "KO (right hand)", "Submission (rear-naked choke)", "Decision (unanimous)"
  method text,
  round int,
  -- Als Text, nicht als Interval: auf den offiziellen Bögen steht "3:24",
  -- und genau so soll es wieder herauskommen.
  end_time text,
  note text not null default '',
  created_at timestamptz not null default now()
);

create unique index if not exists event_results_slot_idx
  on event_results (event_slug, position);
create index if not exists event_results_event_idx on event_results (event_slug);

alter table event_results enable row level security;

create policy "Results are viewable by everyone"
  on event_results for select using (true);

create policy "Only admins can write results"
  on event_results for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ---------------------------------------------------------------------------
-- 3. Kontolöschung möglich machen
-- ---------------------------------------------------------------------------
-- profiles hängt bereits per "on delete cascade" an auth.users, favorites und
-- sent_notifications hängen genauso an profiles. Die Forentabellen aber nicht:
-- dort steht nur "references profiles(id)", also NO ACTION. Ein Löschversuch
-- eines Kontos mit Forenbeiträgen scheitert damit an einer
-- Fremdschlüsselverletzung — die Löschung wäre schlicht nicht durchführbar.
--
-- Beiträge werden mitgelöscht, nicht anonymisiert: die Datenschutzerklärung
-- sagt Löschung zu (Art. 17 DSGVO), und ein stehengelassener Beitrag unter
-- "[gelöscht]" ist keine Löschung des Inhalts.

alter table forum_posts
  drop constraint if exists forum_posts_user_id_fkey;
alter table forum_posts
  add constraint forum_posts_user_id_fkey
  foreign key (user_id) references profiles(id) on delete cascade;

alter table forum_threads
  drop constraint if exists forum_threads_created_by_fkey;
alter table forum_threads
  add constraint forum_threads_created_by_fkey
  foreign key (created_by) references profiles(id) on delete cascade;

-- fighters.updated_by verweist ebenfalls auf profiles. Hier wird bewusst nur
-- der Verweis geleert statt das Kämpferprofil zu löschen: der Datensatz gehört
-- zum Kämpfer, nicht zu dem Konto, das ihn zuletzt bearbeitet hat.
alter table fighters
  drop constraint if exists fighters_updated_by_fkey;
alter table fighters
  add constraint fighters_updated_by_fkey
  foreign key (updated_by) references profiles(id) on delete set null;

alter table events
  drop constraint if exists events_updated_by_fkey;
alter table events
  add constraint events_updated_by_fkey
  foreign key (updated_by) references profiles(id) on delete set null;

-- Beiträge dürfen von ihren Verfassern gelöscht werden. Ohne diese Regeln
-- könnte jemand zwar sein ganzes Konto löschen, aber keinen einzelnen Beitrag.
drop policy if exists "Users can delete their own posts" on forum_posts;
create policy "Users can delete their own posts"
  on forum_posts for delete using (auth.uid() = user_id);

drop policy if exists "Users can delete their own threads" on forum_threads;
create policy "Users can delete their own threads"
  on forum_threads for delete using (auth.uid() = created_by);
