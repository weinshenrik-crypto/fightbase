-- Zwei Namen fuer dieselbe Organisation zusammenlegen.
--
-- In der Tabelle standen nebeneinander:
--   "ONE"               14 Zeilen, vom Import (lib/eventSources/one.ts)
--   "ONE Championship"   5 Zeilen, von Hand eingetragen
--
-- Folge: zwei duenne Promotion-Seiten fuer denselben Veranstalter
-- (/promotion/one und /promotion/one-championship), und in PROMOTION_LINKS
-- musste jede Schreibweise einzeln gepflegt werden. Genau derselbe Fall wie
-- frueher bei "IJF" / "IJF Judo Grand Slam" und "WKF" / "WKF Karate 1", die
-- aus demselben Grund zusammengelegt wurden.
--
-- "ONE" gewinnt, und zwar nicht aus Geschmack: Der Import schreibt diesen
-- Namen (lib/eventSources/one.ts, promotion: "ONE"). Waehlte man die andere
-- Schreibweise, legte der naechste taegliche Lauf die Spaltung sofort wieder
-- an.
--
-- Betroffen sind ausschliesslich Handzeilen (source IS NULL) — der Import
-- fasst die nie an, hier passiert das also einmalig und bleibt so.
--
-- Ausfuehren im Supabase-SQL-Editor. Laeuft mehrfach ohne Schaden: Beim
-- zweiten Mal findet das UPDATE nichts mehr.

begin;

update public.events
   set promotion = 'ONE'
 where promotion = 'ONE Championship';

commit;

-- Kontrolle. Erwartet: eine Zeile, "ONE" mit 19 Terminen, und keine Zeile
-- mehr mit "ONE Championship".
select promotion, count(*) as events
  from public.events
 where promotion ilike 'ONE%'
 group by promotion
 order by promotion;

-- Danach den Cache wegwerfen, sonst zeigen die Listen bis zu eine Stunde
-- lang den alten Stand:
--
--   curl -X POST https://fightbase.io/api/revalidate \
--        -H "Authorization: Bearer $CRON_SECRET"
--
-- Die Weiterleitung von /promotion/one-championship auf /promotion/one steht
-- in next.config.js und ist ab dem Deploy aktiv.
