// Prueft die UWW-Quelle gegen ein gestubbtes fetch.
//
//   npx tsx scripts/check-uww-source.ts
//
// Warum gerade diese Quelle einen eigenen Test hat: Sie liest nicht mehr die
// Eventtabelle der Seite, sondern den ld+json-Block fuer Suchmaschinen — ein
// verschachteltes @graph, in dem die Events unter ItemList -> item haengen. Ein
// Parser, der nur die oberste Ebene anschaut, findet dort nichts und meldet
// trotzdem brav "0 neue Events". Genau dieser stille Fall soll auffallen.
//
// Ausserdem sind zwei Filter seit dem Umbau der Seite schwaecher als vorher:
// Altersklasse und Turniertyp kommen nur noch aus dem Turniernamen, weil der
// Block keine eigenen Spalten dafuer hat. Was sie trennen sollen, steht hier
// als Beispiel und nicht nur als Kommentar.

import { uww } from "../lib/eventSources/uww";
import type { SourceEvent } from "../lib/eventSources/types";

let failures = 0;
const check = (label: string, ok: boolean) => {
  if (!ok) { failures++; console.error(`FEHLGESCHLAGEN: ${label}`); }
};

type Item = {
  name: string;
  slug: string;
  sport?: string;
  start: string;
  place?: string | null;
  status?: string;
};

function item(i: Item) {
  return {
    "@type": "ListItem",
    position: 1,
    item: {
      "@type": "SportsEvent",
      "@id": `https://uww.org/events/${i.slug}`,
      url: `https://uww.org/events/${i.slug}`,
      name: i.name,
      sport: i.sport ?? "Wrestling",
      eventStatus: i.status ?? "https://schema.org/EventScheduled",
      startDate: `${i.start}T00:00:00.000Z`,
      endDate: `${i.start}T00:00:00.000Z`,
      ...(i.place === null
        ? {}
        : { location: { "@type": "Place", name: i.place ?? "Astana, Kazakhstan" } }),
    },
  };
}

/** Seite im Aufbau der echten: ld+json mit @graph, Events unter ItemList. */
function page(items: Item[], extraBlocks: string[] = []) {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "CollectionPage", "@id": "https://uww.org/events#webpage" },
      { "@type": "BreadcrumbList", itemListElement: [] },
      {
        "@type": "ItemList",
        name: "Events",
        numberOfItems: items.length,
        itemListElement: items.map(item),
      },
    ],
  };
  return [
    "<html><head>",
    ...extraBlocks.map((b) => `<script type="application/ld+json">${b}</script>`),
    `<script type="application/ld+json">${JSON.stringify(graph)}</script>`,
    // Das leere Tabellengeruest, das die Seite heute ausliefert. Es darf den
    // Parser weder stoeren noch als Datenquelle durchgehen.
    "</head><body><table data-slot=\"table\"><tbody><tr></tr><tr></tr></tbody></table></body></html>",
  ].join("");
}

function serve(html: string, ok = true) {
  globalThis.fetch = (async () => ({
    ok,
    status: ok ? 200 : 500,
    text: async () => html,
  })) as unknown as typeof fetch;
}

const FUTURE = "2099-10-24";
const PAST = "2000-01-01";

async function main() {
  // 1. Der Normalfall: Senioren-WM aus dem @graph lesen.
  serve(page([{ name: "Senior World Championships", slug: "senior-world-championships-0", start: FUTURE }]));
  const one = await uww.load();
  check("kein Fehler bei lesbarer Seite", one.error === null);
  check("genau ein Event", one.events.length === 1);
  const e = one.events[0] as SourceEvent | undefined;
  check("Datum aus startDate", e?.date === FUTURE);
  check("Ort aus location.name", e?.venue === "Astana, Kazakhstan");
  check("Sportart fest auf Wrestling", e?.sport === "Wrestling" && e?.promotion === "UWW");
  check("stabile ID ist das Pfadsegment", e?.sourceKey === "senior-world-championships-0");
  check("Slug traegt Verband und Jahr", e?.slug === "uww-senior-world-championships-2099");
  check("Belegseite zeigt auf uww.org", e?.sourceUrl === "https://uww.org/events/senior-world-championships-0");
  // "no fabricated fights": Die Quelle darf gar keine Paarung liefern koennen.
  const keys = Object.keys(e ?? {}).sort().join(",");
  check(
    "keine Kampf- oder Zeitfelder im Ergebnis",
    !/fighter|starts_at|undercard/.test(keys)
  );

  // 2. Nachwuchs faellt raus — der Filter haengt jetzt am Namen.
  serve(page([
    { name: "U23 World Championships", slug: "u23", start: FUTURE },
    { name: "U17 World Championships", slug: "u17", start: FUTURE },
    { name: "Veterans World Championships", slug: "vet", start: FUTURE },
    { name: "Junior World Championships", slug: "jun", start: FUTURE },
  ]));
  const youth = await uww.load();
  check("Nachwuchs und Veteranen fallen raus", youth.events.length === 0);
  check(
    "und werden als Senior-Filter protokolliert",
    youth.skipped.some((s) => s.reason.includes("Senior") && s.count === 4)
  );

  // 3. Beach Wrestling ist Ringen und kommt durch, mit eigener Disziplin.
  serve(page([{ name: "Katerini Beach Wrestling World Series - FINAL", slug: "kat", start: FUTURE, place: "Katerini, Greece" }]));
  const beach = await uww.load();
  check("Beach Wrestling kommt durch", beach.events.length === 1);
  check("Disziplin statt erfundener Stilliste", beach.events[0]?.main === "Beach wrestling");

  // 4. Die anderen UWW-Disziplinen gehoeren nicht unter sport = "Wrestling".
  serve(page([
    { name: "Grappling World Championships", slug: "gr", start: FUTURE },
    { name: "Pankration World Championships", slug: "pk", start: FUTURE },
    { name: "Amateur MMA World Championships", slug: "mma", start: FUTURE },
    { name: "Beach Games", slug: "bg", start: FUTURE, sport: "Beach Games" },
  ]));
  const disc = await uww.load();
  check("Grappling, Pankration, Amateur-MMA fallen raus", disc.events.length === 0);

  // 5. Kleine Turniere fluten den Kalender nicht.
  serve(page([
    { name: "Zagreb Open", slug: "zag", start: FUTURE },
    { name: "Dan Kolov - Nikola Petrov Tournament", slug: "dk", start: FUTURE },
    { name: "Ranking Series Budapest", slug: "rs", start: FUTURE },
  ]));
  const small = await uww.load();
  check("nur die grossen Turniertypen bleiben", small.events.length === 1);
  check("und zwar die Ranking Series", small.events[0]?.title === "Ranking Series Budapest");

  // 6. Abgesagt, vergangen, ohne Ort — jeweils raus, jeweils protokolliert.
  serve(page([
    { name: "World Championships Cancelled", slug: "c", start: FUTURE, status: "https://schema.org/EventCancelled" },
    { name: "World Championships Past", slug: "p", start: PAST },
    { name: "World Championships Nowhere", slug: "n", start: FUTURE, place: null },
  ]));
  const edge = await uww.load();
  check("abgesagt, vergangen und ortlos fallen raus", edge.events.length === 0);
  check("mit drei verschiedenen Gruenden", edge.skipped.length === 3);

  // 7. Der Kernpunkt: Findet der Parser nichts, ist das ein Fehler und keine
  //    stille Null. Genau so ist der Umbau der Seite im September 2026
  //    aufgefallen.
  serve("<html><body><table data-slot=\"table\"><tbody><tr></tr></tbody></table></body></html>");
  const empty = await uww.load();
  check("leere Seite meldet einen Fehler", empty.error !== null);
  check("Fehlertext nennt den Datenblock", /ld\+json/.test(empty.error ?? ""));

  // 8. Ein kaputter ld+json-Block darf die anderen nicht mitnehmen.
  serve(page([{ name: "Senior World Championships", slug: "s", start: FUTURE }], ["{ das ist kein json"]));
  const broken = await uww.load();
  check("kaputter Block wird uebersprungen", broken.error === null && broken.events.length === 1);

  // 9. Netzwerkfehler kommen als error zurueck, nicht als Ausnahme.
  serve("", false);
  const down = await uww.load();
  check("HTTP-Fehler wird gemeldet", down.error !== null && down.events.length === 0);

  if (failures > 0) { console.error(`\n${failures} Pruefung(en) fehlgeschlagen`); process.exit(1); }
  console.log("ok — alle Pruefungen bestanden");
}
main();
