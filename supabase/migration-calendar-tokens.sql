-- Geheime Links fuer den persoenlichen Kalender-Feed (Favoriten als Abo).
--
-- Einmal im Supabase-Dashboard ausfuehren: SQL Editor -> New query -> Run.
--
-- WARUM EINE EIGENE TABELLE UND KEINE SPALTE IN profiles
--
-- profiles ist per Zeilenregel fuer alle lesbar ("Profiles are viewable by
-- everyone"), weil das Forum Autorennamen fremder Zeilen braucht. Jede neue
-- Spalte dort stuende damit der Rolle anon offen und muesste wie `email`
-- ueber Spaltenrechte zurueckgenommen werden (migration-profiles-email-
-- private.sql). Wer den Token kennt, liest die Favoriten eines Kontos mit —
-- er gehoert also zu dem, was niemanden angeht. Eine eigene Tabelle mit
-- einer Regel "nur die eigene Zeile" ist von vornherein privat.
--
-- Den Token erzeugt der Server (app/api/calendar/token), nicht der Browser.
-- Gelesen wird er im Feed (app/api/calendar/u/[token]) mit dem
-- Service-Role-Schluessel, der RLS umgeht.

create table if not exists calendar_tokens (
  user_id uuid primary key references profiles(id) on delete cascade,
  token text not null unique,
  created_at timestamptz not null default now()
);

alter table calendar_tokens enable row level security;

drop policy if exists "Users manage their own calendar token" on calendar_tokens;
create policy "Users manage their own calendar token"
  on calendar_tokens for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Gegenprobe: anon darf hier nichts sehen. Erwartet: 0.
set role anon;
select count(*) as anon_sieht_tokens from calendar_tokens;
reset role;
