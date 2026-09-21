// Prueft die ONE-Quelle gegen ein gestubbtes fetch.
//
//   npx tsx scripts/check-one-source.ts
//
// Warum gerade diese Quelle einen eigenen Test hat, gleich drei Gruende:
//
// 1. Sie ist die erste **zweistufige** Quelle. Die Events-Seite von ONE ist
//    JS-gerendert und liefert einem simplen Fetch nichts; gelesen wird deshalb
//    die Sitemap und danach jede Einzelseite. Bricht Stufe zwei still, meldet
//    die Quelle brav "0 neue Events" statt eines Fehlers — genau das soll hier
//    auffallen.
//
// 2. Sie ist die erste Quelle mit **Anfangszeit**. Die vier Verbandskalender
//    liefern keine, deshalb schliesst SourceEvent starts_at bisher aus. ONE
//    nennt sie ("2026-09-25T18:30:00+07:00"), und sie muss samt Zeitzone
//    ankommen, ohne dass sie bei den anderen Quellen ploetzlich auftaucht.
//
// 3. Sie ist die erste Quelle, bei der die **Sportart aus dem Titel** kommt.
//    ONE Friday Fights sind Muay-Thai-Karten aus dem Lumpinee, die uebrigen
//    Formate laufen als MMA. Verrutscht diese Zuordnung, landen Muay-Thai-
//    Termine unter MMA und die Luecke, wegen der es die Quelle gibt, bleibt.

import { one } from "../lib/eventSources/one";
import type { SourceEvent } from "../lib/eventSources/types";

let failures = 0;
const check = (label: string, ok: boolean) => {
  if (!ok) { failures++; console.error(`FEHLGESCHLAGEN: ${label}`); }
};

const FUTURE = "2099-09-25";
const PAST = "2000-01-01";

type Ev = {
  slug: string;
  name: string;
  start?: string;      // YYYY-MM-DD
  time?: string;       // "18:30:00+07:00"
  place?: string | null;
  /** Seite ohne brauchbaren ld+json-Block. */
  broken?: boolean;
};

/** Einzelseite im Aufbau der echten: ld+json mit @type Event. */
function eventPage(e: Ev): string {
  if (e.broken) {
    return '<html><head><script type="application/ld+json">{"@type":"WebPage"}</script></head><body></body></html>';
  }
  const block = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: e.name,
    startDate: `${e.start ?? FUTURE}T${e.time ?? "18:30:00+07:00"}`,
    endDate: `${e.start ?? FUTURE}T23:59:59+07:00`,
    ...(e.place === null
      ? {}
      : {
          location: {
            "@type": "Place",
            name: e.place ?? "Lumpinee Stadium",
            address: { "@type": "PostalAddress", addressLocality: "Bangkok" },
          },
        }),
  };
  return [
    "<html><head>",
    // Der erste Block ist bei ONE immer Seiten-Metadaten und darf nicht
    // faelschlich als Event durchgehen.
    '<script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"WebPage"},{"@type":"Organization"}]}</script>',
    `<script type="application/ld+json">${JSON.stringify(block)}</script>`,
    "</head><body></body></html>",
  ].join("");
}

function sitemap(slugs: string[]): string {
  const urls = slugs
    .map((s) => `<url><loc>https://www.onefc.com/events/${s}/</loc></url>`)
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?><urlset>${urls}<url><loc>https://www.onefc.com/latest/</loc></url></urlset>`;
}

/**
 * Stub, der je nach URL antwortet: Sitemap oder Einzelseite. Zaehlt mit, wie
 * viele Einzelseiten geholt wurden — daran haengt die Laufzeit im Cron-Job.
 */
let fetched: string[] = [];
function serve(events: Ev[], opts: { sitemapOk?: boolean; pageOk?: boolean } = {}) {
  const { sitemapOk = true, pageOk = true } = opts;
  fetched = [];
  const bySlug = new Map(events.map((e) => [e.slug, e]));
  globalThis.fetch = (async (url: string) => {
    const u = String(url);
    if (u.includes("sitemap")) {
      return { ok: sitemapOk, status: sitemapOk ? 200 : 503, text: async () => sitemap(events.map((e) => e.slug)) };
    }
    const slug = u.match(/\/events\/([^/]+)\//)?.[1] ?? "";
    fetched.push(slug);
    const e = bySlug.get(slug);
    return {
      ok: pageOk,
      status: pageOk ? 200 : 500,
      text: async () => (e ? eventPage(e) : "<html></html>"),
    };
  }) as unknown as typeof fetch;
}

async function main() {
  // 1. Normalfall: eine Friday-Fights-Karte wird vollstaendig gelesen.
  serve([{ slug: "one-friday-fights-172", name: "ONE Friday Fights 172 &amp; The Inner Circle 32" }]);
  const r1 = await one.load();
  check("kein Fehler bei lesbarer Sitemap", r1.error === null);
  check("genau ein Event", r1.events.length === 1);
  const e = r1.events[0] as SourceEvent | undefined;
  check("Datum aus startDate", e?.date === FUTURE);
  check("Ort aus location.name", e?.venue === "Lumpinee Stadium");
  check("Promotion ist ONE", e?.promotion === "ONE");
  check("Belegseite zeigt auf onefc.com", e?.sourceUrl === "https://www.onefc.com/events/one-friday-fights-172/");
  check("stabile ID ist der Slug der Quelle", e?.sourceKey === "one-friday-fights-172");
  check("HTML-Entity im Titel ist aufgeloest", (e?.title ?? "").includes("&") && !(e?.title ?? "").includes("&amp;"));

  // 2. Die Anfangszeit kommt samt Zeitzone an — der Grund fuer die
  //    Typerweiterung. Ohne sie waere die halbe Auskunft weg.
  check("Anfangszeit uebernommen", e?.startsAt === `${FUTURE}T18:30:00+07:00`);
  check("Zeitzone uebernommen", typeof e?.timezone === "string" && (e?.timezone ?? "").length > 0);

  // 3. "no fabricated fights": Paarungen darf die Quelle nicht liefern.
  const keys = Object.keys(e ?? {}).sort().join(",");
  check("keine Kampffelder im Ergebnis", !/fighter|undercard/.test(keys));

  // 4. Sportart aus dem Titel. Friday Fights sind Muay Thai, der Rest MMA.
  serve([
    { slug: "one-friday-fights-173", name: "ONE Friday Fights 173" },
    { slug: "one-samurai-4", name: "ONE SAMURAI 4" },
    { slug: "onefightnight49", name: "ONE Fight Night 49" },
  ]);
  const r2 = await one.load();
  const sportOf = (slug: string) =>
    r2.events.find((x) => x.sourceKey === slug)?.sport;
  check("Friday Fights laufen als Muay Thai", sportOf("one-friday-fights-173") === "Muay Thai");
  check("SAMURAI laeuft nicht als Muay Thai", sportOf("one-samurai-4") === "MMA");
  check("Fight Night laeuft nicht als Muay Thai", sportOf("onefightnight49") === "MMA");

  // 5. Vergangene Termine fallen raus und werden protokolliert.
  serve([
    { slug: "alt", name: "ONE Friday Fights 1", start: PAST },
    { slug: "neu", name: "ONE Friday Fights 2", start: FUTURE },
  ]);
  const r3 = await one.load();
  check("nur der kommende Termin bleibt", r3.events.length === 1 && r3.events[0]?.sourceKey === "neu");
  check("der vergangene wird protokolliert", r3.skipped.some((s) => /Vergangenheit/i.test(s.reason)));

  // 6. Seite ohne Event-Block wird uebersprungen, nicht geraten. Das ist der
  //    stille Fall, der eine zweistufige Quelle gefaehrlich macht.
  serve([
    { slug: "kaputt", name: "ONE Friday Fights 9", broken: true },
    { slug: "heil", name: "ONE Friday Fights 10" },
  ]);
  const r4 = await one.load();
  check("nur die lesbare Seite ergibt ein Event", r4.events.length === 1 && r4.events[0]?.sourceKey === "heil");
  check("die unlesbare wird protokolliert statt geraten", r4.skipped.some((s) => s.count === 1));

  // 7. Seite ohne Ort wird uebersprungen — ein Termin ohne Austragungsort ist
  //    im Kalender wertlos, und raten ist verboten.
  serve([{ slug: "ohne-ort", name: "ONE Friday Fights 11", place: null }]);
  const r5 = await one.load();
  check("Termin ohne Ort kommt nicht durch", r5.events.length === 0);

  // 8. Die Obergrenze begrenzt die Laufzeit — und muss sichtbar sein, wenn sie
  //    greift, sonst fehlen still Termine.
  const viele: Ev[] = Array.from({ length: 40 }, (_, i) => ({
    slug: `one-friday-fights-${100 + i}`,
    name: `ONE Friday Fights ${100 + i}`,
  }));
  serve(viele);
  const r6 = await one.load();
  check("hoechstens 30 Einzelseiten geholt", fetched.length <= 30);
  check("die Obergrenze wird protokolliert", r6.skipped.some((s) => /Obergrenze|begrenzt/i.test(s.reason)));

  // 9. Sitemap nicht erreichbar: Fehler melden, nicht stillschweigend leer sein.
  serve([{ slug: "x", name: "ONE Friday Fights 12" }], { sitemapOk: false });
  const r7 = await one.load();
  check("unerreichbare Sitemap ergibt einen Fehler", typeof r7.error === "string" && r7.error.length > 0);
  check("und keine Events", r7.events.length === 0);

  if (failures > 0) {
    console.error(`\n${failures} Pruefung(en) fehlgeschlagen`);
    process.exit(1);
  }
  console.log("ok — alle Pruefungen bestanden");
}

main();
