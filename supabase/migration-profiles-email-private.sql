-- E-Mail-Adressen aus der oeffentlichen Lesbarkeit von profiles herausnehmen.
--
-- Einmal im Supabase-Dashboard ausfuehren: SQL Editor -> New query -> Run.
--
-- DAS PROBLEM
--
-- schema.sql legt an:
--
--   create policy "Profiles are viewable by everyone"
--     on profiles for select using (true);
--
-- Row Level Security arbeitet zeilenweise, nicht spaltenweise. Die Regel
-- erlaubt damit *jede Spalte jeder Zeile* — einschliesslich `email`. Und zwar
-- nicht nur angemeldeten Nutzern, sondern der Rolle `anon`: Das ist der
-- NEXT_PUBLIC_SUPABASE_ANON_KEY, der bauartbedingt in jedem Browser-Bundle
-- steht. Am 6. November 2026 liessen sich so die Adressen aller elf Konten
-- mit einem einzigen Aufruf abrufen.
--
-- Die Oberflaeche verspricht in app/HomeClient.tsx das Gegenteil:
-- "Choose a forum username (your email stays private)".
--
-- WARUM DIE REGEL TROTZDEM BLEIBT
--
-- Das Forum zeigt Autorennamen ueber einen Join:
--
--   .select("id, title, created_at, created_by, profiles(username)")
--
-- Dafuer muss `username` in *fremden* Zeilen lesbar bleiben. Die Regel auf
-- "nur die eigene Zeile" umzustellen wuerde die Namen im Forum leeren und
-- eine Code-Aenderung erzwingen.
--
-- DIE LOESUNG
--
-- Spaltenrechte statt Zeilenregeln. Postgres kann SELECT pro Spalte vergeben,
-- und PostgREST haelt sich daran: Eine Abfrage, die `email` anfordert,
-- scheitert dann mit einem Berechtigungsfehler, waehrend `username` weiter
-- geht. Geprueft wurde vorher jeder Zugriff der Anwendung — `profiles.email`
-- wird nirgends im Browser gelesen:
--
--   HomeClient  select("role, username, email_notifications, notif_prompt_seen")
--               select("id, title, …, profiles(username)")
--   Admin       select("role")
--   angezeigte Adresse im Konto-Bereich: session.user.email (aus der
--               Auth-Sitzung, nicht aus dieser Tabelle)
--   api/cron/notify: nutzt den Service-Role-Key und ist von Spaltenrechten
--               der Rollen anon/authenticated nicht betroffen
--
-- Die Erinnerungs-Mails funktionieren also unveraendert weiter.

-- 1. Pauschales SELECT fuer die beiden oeffentlichen Rollen zuruecknehmen.
--    service_role und postgres bleiben unberuehrt.
revoke select on public.profiles from anon, authenticated;

-- 2. Alles ausser `email` wieder freigeben.
--
--    Bewusst nicht enger: `role` ist nur 'user' oder 'admin', die beiden
--    Benachrichtigungs-Schalter sind Einstellungen ohne Personenbezug. Sie
--    zeilenweise auf den Eigentuemer zu beschraenken ginge nur ueber eine
--    zweite Tabelle oder eine View fuer das Forum — Aufwand, der in keinem
--    Verhaeltnis steht. Die Adresse ist das, was hier nicht hingehoerte.
grant select (
  id,
  username,
  role,
  created_at,
  email_notifications,
  notif_prompt_seen
) on public.profiles to anon, authenticated;

-- 3. Gegenprobe. Beide Zeilen sollen ausgegeben werden:
--
--      has_column_privilege('anon', 'public.profiles', 'email',    'SELECT')  -> false
--      has_column_privilege('anon', 'public.profiles', 'username', 'SELECT')  -> true
--
select
  has_column_privilege('anon', 'public.profiles', 'email', 'SELECT')    as anon_sieht_email,
  has_column_privilege('anon', 'public.profiles', 'username', 'SELECT') as anon_sieht_username,
  has_column_privilege('authenticated', 'public.profiles', 'email', 'SELECT') as user_sieht_email;
