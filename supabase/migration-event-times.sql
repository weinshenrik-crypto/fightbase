-- Startzeiten für Events.
--
-- Warum nicht einfach eine Uhrzeit-Spalte: Kampfsport ist weltweit. Eine Karte,
-- die in Tokio um 19:00 beginnt, startet in Deutschland um 11:00 desselben Tages
-- und in Las Vegas am Abend zuvor. Eine nackte "19:00" wäre also für die meisten
-- Besucher schlicht falsch.
--
-- Deshalb zwei Spalten:
--   starts_at  der absolute Zeitpunkt (timestamptz). Daraus lässt sich jede
--              beliebige lokale Zeit ableiten.
--   timezone   die IANA-Zone des Austragungsorts ("Asia/Tokyo"), damit wir
--              zusätzlich die Ortszeit anzeigen können — die steht so auch auf
--              den Tickets und in den Ankündigungen der Veranstalter.
--
-- `date` bleibt bestehen und ist weiterhin der Kalendertag am Austragungsort.
-- Es aus starts_at abzuleiten würde eine Karte, die um 22:00 in Las Vegas
-- startet, im Kalender auf den Folgetag schieben.
--
-- Beide Spalten sind bewusst nullable: für die meisten Termine ist die Startzeit
-- Monate im Voraus schlicht noch nicht angekündigt. Kein Wert ist besser als ein
-- geschätzter — die Seite wirbt mit "no fabricated fights", und das gilt für
-- Uhrzeiten genauso.

alter table events
  add column if not exists starts_at timestamptz,
  add column if not exists timezone text;

comment on column events.starts_at is
  'Absoluter Beginn der Hauptkarte. NULL, solange der Veranstalter keine Zeit angekündigt hat.';
comment on column events.timezone is
  'IANA-Zeitzone des Austragungsorts, z.B. Asia/Tokyo. Nur gesetzt, wenn starts_at gesetzt ist.';
