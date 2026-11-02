// Prueft buildPlan() gegen die Faelle, die sich nur mit einem echten
// Datenbankstand zeigen — vor allem den Vergleich der Anfangszeit.
//
// Anlass: Postgres gibt starts_at als timestamptz in UTC zurueck
// ("2026-11-06T11:30:00+00:00"), die Quelle nennt dieselbe Zeit mit
// Ortsoffset ("2026-11-06T18:30:00+07:00"). Ein Textvergleich hielt das fuer
// eine Aenderung und schrieb dieselben zehn ONE-Zeilen in jedem Lauf neu.
//
//   npx tsx scripts/check-import-plan.ts

import { buildPlan, type ExistingRow } from "../lib/eventSources/plan";
import type { SourceEvent } from "../lib/eventSources/types";

let failures = 0;
const check = (label: string, ok: boolean) => {
  if (!ok) { failures++; console.error(`FEHLGESCHLAGEN: ${label}`); }
};

const SOURCE_EVENT: SourceEvent = {
  slug: "one-friday-fights-178",
  date: "2026-11-13",
  sport: "Muay Thai",
  promotion: "ONE",
  title: "ONE Friday Fights 178",
  main: "Muay Thai card",
  venue: "Lumpinee Stadium",
  broadcaster: "-",
  note: "ONE Championship event; date, start time and venue from onefc.com.",
  sourceKey: "one-friday-fights-178",
  sourceUrl: "https://www.onefc.com/events/one-friday-fights-178/",
  startsAt: "2026-11-13T18:30:00+07:00",
  timezone: "Asia/Bangkok",
};

/** Dieselbe Zeile, wie die Datenbank sie zurueckgibt: starts_at in UTC. */
const EXISTING: ExistingRow = {
  slug: "one-friday-fights-178",
  date: "2026-11-13",
  sport: "Muay Thai",
  promotion: "ONE",
  title: "ONE Friday Fights 178",
  main: "Muay Thai card",
  venue: "Lumpinee Stadium",
  broadcaster: "-",
  note: "ONE Championship event; date, start time and venue from onefc.com.",
  source: "one",
  source_key: "one-friday-fights-178",
  source_url: "https://www.onefc.com/events/one-friday-fights-178/",
  starts_at: "2026-11-13T11:30:00+00:00",
  timezone: "Asia/Bangkok",
};

const fieldsOf = (changes: { field: string }[]) => changes.map((c) => c.field).sort();

// 1. Der Kern: gleicher Zeitpunkt, andere Schreibweise -> keine Aenderung.
{
  const plan = buildPlan("one", [SOURCE_EVENT], [EXISTING]);
  check(
    "gleicher Zeitpunkt in UTC-Schreibweise gilt als unveraendert",
    plan.unchanged === 1 && plan.updates.length === 0
  );
}

// 2. Eine echte Verlegung muss trotzdem ankommen.
{
  const moved = { ...SOURCE_EVENT, startsAt: "2026-11-13T19:30:00+07:00" };
  const plan = buildPlan("one", [moved], [EXISTING]);
  check(
    "echte Verlegung wird erkannt",
    plan.updates.length === 1 && fieldsOf(plan.updates[0].changes).includes("starts_at")
  );
}

// 3. Erste Zeit ueberhaupt: Spalte war leer.
{
  const plan = buildPlan("one", [SOURCE_EVENT], [{ ...EXISTING, starts_at: null, timezone: null }]);
  check(
    "erstmalige Anfangszeit wird geschrieben",
    plan.updates.length === 1 &&
      JSON.stringify(fieldsOf(plan.updates[0].changes)) === '["starts_at","timezone"]'
  );
}

// 4. Eine andere Zone bei gleichem Zeitpunkt ist eine Aenderung — die Zone
//    steuert die Anzeige am Austragungsort, nicht den Zeitpunkt.
{
  const plan = buildPlan("one", [{ ...SOURCE_EVENT, timezone: "Asia/Singapore" }], [EXISTING]);
  check(
    "abweichende Zeitzone wird erkannt",
    plan.updates.length === 1 &&
      JSON.stringify(fieldsOf(plan.updates[0].changes)) === '["timezone"]'
  );
}

// 5. Quelle ohne Zeit darf eine vorhandene Zeit nicht loeschen — das ist die
//    Regel "Handzeilen sind tabu" fuer die vier Verbandskalender.
{
  const bare: SourceEvent = { ...SOURCE_EVENT };
  delete (bare as { startsAt?: string }).startsAt;
  delete (bare as { timezone?: string }).timezone;
  const plan = buildPlan("one", [bare], [EXISTING]);
  check(
    "Quelle ohne Zeit laesst die vorhandene Zeit stehen",
    plan.unchanged === 1 && plan.updates.length === 0
  );
}

// 6. Unlesbare Zeit in der Datenbank darf nicht stillschweigend durchgehen.
{
  const plan = buildPlan("one", [SOURCE_EVENT], [{ ...EXISTING, starts_at: "kaputt" }]);
  check(
    "unlesbarer Bestandswert gilt als Aenderung",
    plan.updates.length === 1 && fieldsOf(plan.updates[0].changes).includes("starts_at")
  );
}

if (failures > 0) {
  console.error(`\n${failures} Pruefung(en) fehlgeschlagen`);
  process.exit(1);
}
console.log("ok — alle Pruefungen bestanden");
