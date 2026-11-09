-- E-Mail-Adresse in profiles gegen Aenderung durch den Nutzer sperren.
--
-- Einmal im Supabase-Dashboard ausfuehren: SQL Editor -> New query -> Run.
-- Unabhaengig von migration-profiles-email-private.sql; die Reihenfolge ist egal.
--
-- DAS PROBLEM
--
-- Die Regel aus schema.sql schuetzt beim Aendern nur `id` und `role`:
--
--   create policy "Users can update their own profile (not role)"
--     on profiles for update using (auth.uid() = id)
--     with check (auth.uid() = id
--                 and role = (select role from profiles where id = auth.uid()));
--
-- `email` steht damit frei. Ein angemeldeter Nutzer konnte die Spalte auf eine
-- beliebige fremde Adresse setzen — und api/cron/notify verschickt genau
-- dorthin:
--
--   .from("profiles").select("id, email").eq("email_notifications", true)
--
-- Damit liess sich die Erinnerungsfunktion als Versandweg fuer unverlangte
-- Mails an Dritte benutzen, abgesendet ueber die Resend-Domain dieses
-- Projekts. Der Schaden ist weniger der Inhalt als der Ruf der Domain:
-- Beschwerden treffen den Absender, nicht den Verursacher.
--
-- DIE LOESUNG
--
-- Dieselbe Technik wie bei `role`: Der neue Wert muss dem alten entsprechen.
-- Die Adresse setzt damit nur noch der Trigger handle_new_user beim Anlegen
-- (SECURITY DEFINER, von der Regel nicht betroffen) und der Service-Role-Key.
--
-- Gewollt ist das auch fachlich: Die Adresse gehoert zur Anmeldung und wird
-- ueber Supabase Auth geaendert, nicht durch Schreiben in eine Tabelle. Dort
-- gibt es eine Bestaetigungsmail — genau den Schritt, der hier fehlte.

drop policy if exists "Users can update their own profile (not role)" on profiles;

create policy "Users can update their own profile (not role, not email)"
  on profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role  = (select role  from profiles where id = auth.uid())
    and email is not distinct from (select email from profiles where id = auth.uid())
  );

-- Gegenprobe: Es darf genau eine UPDATE-Regel auf profiles geben, und ihre
-- Bedingung muss `email` nennen.
select policyname, cmd, with_check
from pg_policies
where schemaname = 'public' and tablename = 'profiles' and cmd = 'UPDATE';
