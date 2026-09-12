-- Herkunftsspalten für den automatischen Event-Import.
--
-- Der Cron-Job /api/cron/import holt Termine aus den Verbandskalendern (IBJJF,
-- IJF, WKF, UWW). Damit er idempotent laufen kann, ohne von Hand gepflegte
-- Events zu überschreiben, braucht die Tabelle drei Spalten:
--
--   source      welche Quelle die Zeile angelegt hat ("ibjjf", "ijf", …).
--               NULL heißt: von Hand eingetragen. Solche Zeilen fasst der
--               Importer nie an — auch dann nicht, wenn dieselbe
--               Veranstaltung in seiner Quelle auftaucht.
--   source_key  die stabile ID der Veranstaltung *bei der Quelle*
--               (IBJJF-Event-ID, IJF-Competition-Pfad, WKF-Championship-ID,
--               UWW-Event-Slug).
--   source_url  die Belegseite beim Verband selbst.
--
-- Warum nicht einfach ein Upsert auf `slug`: Der Slug wird aus dem
-- Turniernamen gebaut. Benennt ein Verband sein Turnier zwischen zwei Läufen um
-- — bei diesen Kalendern häufig, weil Sponsorennamen wechseln —, ergäbe das
-- einen neuen Slug und denselben Termin ein zweites Mal in der Tabelle.
-- Abgeglichen wird deshalb über (source, source_key); der Slug einer
-- bestehenden Zeile bleibt dann unverändert, was für eine schon indexierte
-- Detailseite ohnehin das richtige Verhalten ist.

alter table events
  add column if not exists source text,
  add column if not exists source_key text,
  add column if not exists source_url text;

comment on column events.source is
  'Quelle des automatischen Imports (ibjjf, ijf, wkf, uww). NULL = von Hand eingetragen, wird vom Importer nie angefasst.';
comment on column events.source_key is
  'Stabile ID der Veranstaltung bei der Quelle. Zusammen mit source der Schlüssel, über den der Importer abgleicht.';
comment on column events.source_url is
  'Belegseite beim Verband selbst.';

-- Ein Quell-Event darf nur einmal in der Tabelle stehen. Der Teilindex lässt
-- beliebig viele handgepflegte Zeilen (source IS NULL) daneben zu.
create unique index if not exists events_source_key_idx
  on events (source, source_key)
  where source is not null;

-- Der Importer sucht seine eigenen Zeilen über source.
create index if not exists events_source_idx
  on events (source)
  where source is not null;

-- Schreibrechte: Der Cron-Job läuft mit dem Service-Role-Key und umgeht RLS
-- ohnehin. Die bestehenden Policies ("Only admins can insert/update events")
-- bleiben also unverändert gültig und werden hier bewusst nicht angefasst.
