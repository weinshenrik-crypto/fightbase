// Muay Thai und Kickboxen: ONE Championship.
//
// Diese Quelle widerlegt, was hier lange als geprueft galt — naemlich dass
// ONE "seine Karten erst kurzfristig ankuendigt" und die Bangkoker
// Stadionprogramme "tagesaktuell angesetzt" wuerden. Beides stimmt nicht:
// ONE Friday Fights laufen woechentlich im Lumpinee und stehen drei Monate im
// Voraus fest, mit Datum, Uhrzeit und Ort. Geprueft wurde damals
// rank.rajadamnern.com — das ist die Ranglisten-Subdomain, nicht ein Kalender.
//
// Warum zweistufig: onefc.com/events ist JS-gerendert, ein simpler Fetch sieht
// dort nichts. Lesbar ist stattdessen
//
//   1. die Sitemap (https://www.onefc.com/sitemap_index.xml) — sie fuehrt alle
//      Event-URLs, die neuesten zuerst, und
//   2. jede Einzelseite, die einen vollstaendigen schema.org/Event-Block
//      mitbringt:
//
//        {"@type":"Event","name":"ONE Friday Fights 172 …",
//         "startDate":"2026-09-25T18:30:00+07:00",
//         "location":{"@type":"Place","name":"Lumpinee Stadium", …}}
//
// robots.txt erlaubt beide Pfade ausdruecklich (gesperrt ist nur /wp-admin/)
// und bewirbt die Sitemap selbst. Der ehrliche Bot-User-Agent aus types.ts
// kommt durch Cloudflare — gemessen byte-gleich mit einer Browser-Kennung.
//
// Laufzeit: Die Import-Route hat maxDuration = 60 fuer *alle* Quellen
// zusammen; die vier Verbandskalender brauchen davon rund acht Sekunden. Eine
// Einzelseite kostet gemessen 0,6 s, die Sitemap 2,1 s. MAX_PAGES = 30 bleibt
// damit bei rund 20 s und laesst Luft. Greift die Grenze, steht das im
// Protokoll — sonst fehlten still Termine.

import {
  type EventSource,
  type SourceEvent,
  type SourceResult,
  SkipLog,
  fetchText,
  slugify,
  textOf,
  today,
} from "./types";

const BASE = "https://www.onefc.com";
const SITEMAP = `${BASE}/sitemap_index.xml`;

/** Obergrenze der Einzelabrufe, siehe Laufzeit-Absatz oben. */
const MAX_PAGES = 30;

/**
 * Pause zwischen zwei Einzelseiten.
 *
 * Ohne sie fielen im Trockenlauf reproduzierbar 7 bis 11 von 30 Abrufen aus,
 * waehrend dieselben Seiten einzeln sofort mit 200 antworteten — ONE sitzt
 * hinter Cloudflare, und schnelle Serien werden gedrosselt. 200 ms kosten bei
 * 30 Seiten sechs Sekunden und bleiben im Zeitbudget der Route.
 */
const PAUSE_MS = 200;

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Eine Seite holen, bei Fehlschlag genau einmal nachfassen.
 *
 * Die Drosselung trifft einzelne Abrufe, nicht die ganze Serie; ein zweiter
 * Versuch nach kurzer Pause reicht erfahrungsgemaess. Mehr als einmal zu
 * wiederholen wuerde das Zeitbudget gefaehrden, ohne viel zu gewinnen.
 */
async function fetchPage(url: string) {
  const first = await fetchText(url);
  if (!("error" in first)) return first;
  await pause(PAUSE_MS * 3);
  return fetchText(url);
}

/**
 * Die Sportart steckt im Titel, nicht in den Daten.
 *
 * ONE Friday Fights sind die woechentlichen Lumpinee-Karten und ueberwiegend
 * Muay Thai — genau die Luecke, wegen der es diese Quelle gibt. Alles andere
 * laeuft als MMA: ONE ist formal eine MMA-Promotion, das ist der belegbare
 * Standard und keine Schaetzung.
 */
const SPORT_BY_TITLE: [RegExp, string][] = [
  [/friday\s*fights/i, "Muay Thai"],
  [/muay\s*thai/i, "Muay Thai"],
  [/kickbox/i, "Kickboxing"],
];

function sportOf(title: string): string {
  for (const [pattern, sport] of SPORT_BY_TITLE) {
    if (pattern.test(title)) return sport;
  }
  return "MMA";
}

/** Die Zone aus dem Offset eines ISO-Datums ableiten, soweit eindeutig. */
const OFFSET_ZONES: Record<string, string> = {
  "+07:00": "Asia/Bangkok",
  "+09:00": "Asia/Tokyo",
  "+08:00": "Asia/Singapore",
};

type ParsedEvent = { name: string; startDate: string; venue: string | null };

/**
 * Den Event-Block aus einer Einzelseite holen.
 *
 * Der erste ld+json-Block ist bei ONE immer Seiten-Metadaten (WebPage,
 * Organization, BreadcrumbList). Gesucht ist der zweite mit @type "Event" —
 * wer nur den ersten liest, findet nichts und meldet trotzdem Erfolg.
 */
function parseEventPage(html: string): ParsedEvent | null {
  const blocks = html.match(
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g
  );
  if (!blocks) return null;

  for (const block of blocks) {
    const body = block.replace(/^<script[^>]*>/, "").replace(/<\/script>$/, "");
    let data: unknown;
    try {
      data = JSON.parse(body.trim());
    } catch {
      continue;
    }
    const candidates = Array.isArray(data) ? data : [data];
    for (const c of candidates) {
      const node = c as Record<string, unknown>;
      if (node?.["@type"] !== "Event") continue;
      const name = typeof node.name === "string" ? textOf(node.name) : "";
      const startDate = typeof node.startDate === "string" ? node.startDate : "";
      if (!name || !startDate) continue;
      const loc = node.location as { name?: unknown } | undefined;
      const venue = typeof loc?.name === "string" ? textOf(loc.name) : null;
      return { name, startDate, venue };
    }
  }
  return null;
}

export const one: EventSource = {
  id: "one",
  label: "ONE Championship (Muay Thai, Kickboxen, MMA)",
  home: BASE,

  async load(): Promise<SourceResult> {
    const base = { id: "one", label: "ONE Championship (Muay Thai, Kickboxen, MMA)" };

    const map = await fetchText(SITEMAP);
    if ("error" in map) {
      return { ...base, events: [], skipped: [], error: map.error };
    }

    // Reihenfolge der Sitemap beibehalten: Die neuesten Termine stehen oben,
    // und genau die sind die kommenden.
    const urls: string[] = [];
    const seen = new Set<string>();
    for (const m of map.text.matchAll(
      /https:\/\/www\.onefc\.com\/events\/([a-z0-9-]+)\//g
    )) {
      if (seen.has(m[1])) continue;
      seen.add(m[1]);
      urls.push(m[0]);
    }
    if (urls.length === 0) {
      return { ...base, events: [], skipped: [], error: "ONE: keine Event-URLs in der Sitemap" };
    }

    const skip = new SkipLog();
    if (urls.length > MAX_PAGES) {
      skip.add(
        `auf ${MAX_PAGES} Einzelseiten begrenzt (Obergrenze fuer die Laufzeit)`,
        `${urls.length} Event-URLs in der Sitemap`
      );
    }

    const now = today();
    const events: SourceEvent[] = [];

    let first = true;
    for (const url of urls.slice(0, MAX_PAGES)) {
      // Nicht vor dem ersten Abruf warten — die Pause soll die Serie
      // entzerren, nicht den Start verzoegern.
      if (!first) await pause(PAUSE_MS);
      first = false;

      const slug = url.match(/\/events\/([^/]+)\//)?.[1] ?? "";
      const page = await fetchPage(url);
      if ("error" in page) {
        skip.add("Einzelseite nicht erreichbar", slug);
        continue;
      }
      const parsed = parseEventPage(page.text);
      if (!parsed) {
        skip.add("kein Event-Block auf der Seite", slug);
        continue;
      }

      const date = parsed.startDate.slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        skip.add("Datum nicht lesbar", `${parsed.name} (${parsed.startDate})`);
        continue;
      }
      if (date < now) {
        skip.add("liegt in der Vergangenheit", parsed.name);
        continue;
      }
      if (!parsed.venue) {
        // Ein Termin ohne Austragungsort ist im Kalender wertlos, und den Ort
        // zu raten verbietet sich — lieber gar nicht uebernehmen.
        skip.add("kein Austragungsort angegeben", parsed.name);
        continue;
      }

      const sport = sportOf(parsed.name);
      const offset = parsed.startDate.slice(-6);
      const timezone = OFFSET_ZONES[offset];

      events.push({
        // Kein "one-"-Praefix: Die Titel fangen bereits mit "ONE" an, sonst
        // entstuenden Slugs wie "one-one-friday-fights-183".
        slug: slugify(parsed.name),
        date,
        sport,
        promotion: "ONE",
        title: parsed.name,
        // Keine Paarung: Die Einzelseite nennt die Karte erst kurz vorher, und
        // "no fabricated fights" gilt hier wie ueberall.
        main:
          sport === "Muay Thai"
            ? "Muay Thai card"
            : sport === "Kickboxing"
              ? "Kickboxing card"
              : "Mixed martial arts card",
        venue: parsed.venue,
        broadcaster: "-",
        note: `ONE Championship event; date, start time and venue from onefc.com.`,
        sourceKey: slug,
        sourceUrl: url,
        // Nur setzen, wenn die Quelle wirklich eine Zeit nennt. Ein reines
        // Datum ohne Uhrzeit darf kein "00:00" erfinden.
        ...(parsed.startDate.length > 10 ? { startsAt: parsed.startDate } : {}),
        ...(timezone ? { timezone } : {}),
      });
    }

    return { ...base, events, skipped: skip.list(), error: null };
  },
};
