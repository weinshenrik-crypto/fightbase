// Karate: WKF Karate 1.
//
// Die Übersichtsseite liefert alle drei Serien auf einmal, zwei Jahre im
// Voraus — genau wie in CLAUDE.md beschrieben. Serverseitig gerendert:
//
//   <article class="championship-item …">
//     <header class="h4 two-lines">2026 Karate One-Premier League Istanbul</header>
//     <span class="one-line">23 - 25 January 2026</span>
//     <a href="/karate-one/championship/!/421/2026-karate-one-premier-league-istanbul">
//
// Im Abruf: 28 Karten, davon 12 Youth League. Die fliegen raus — Nachwuchs
// gehört nicht in den Erwachsenenkalender, dieselbe Linie wie bei Judo und
// IBJJF. Bleiben 16 Senior-Events (Premier League und Series A).
//
// Der Ort steckt nur im Namen ("… Premier League Istanbul"), eine eigene Spalte
// dafür gibt es nicht. Er wird deshalb aus dem Namen abgeleitet — und wenn das
// nicht geht, wird der Eintrag übersprungen statt geraten.

import {
  type EventSource,
  type SourceEvent,
  type SourceResult,
  SkipLog,
  fetchText,
  isoDate,
  monthNumber,
  slugify,
  textOf,
  today,
} from "./types";

const BASE = "https://www.wkf.net";
const URL = `${BASE}/karate-one`;

const YOUTH = /youth\s*league/i;

// "2026 Karate One - Premier League Istanbul" -> { serie, ort }
// Die Schreibweise schwankt zwischen "Karate One-Premier League",
// "Karate One - Premier League" und "Karate One Premier League".
const NAME = /^(\d{4})\s+Karate\s*One\s*[-–]?\s*(Premier League|Series A|Youth League)\s+(.+)$/i;

export const wkf: EventSource = {
  id: "wkf",
  label: "WKF (Karate)",
  home: BASE,

  async load(): Promise<SourceResult> {
    const base = { id: "wkf", label: "WKF (Karate)" };
    const res = await fetchText(URL);
    if ("error" in res) return { ...base, events: [], skipped: [], error: res.error };

    const cards = res.text.match(/<article class="championship-item[\s\S]*?<\/article>/g) ?? [];
    if (cards.length === 0) {
      return { ...base, events: [], skipped: [], error: "WKF: keine championship-item-Karten gefunden" };
    }

    const skip = new SkipLog();
    const now = today();
    const events: SourceEvent[] = [];

    for (const card of cards) {
      const title = textOf(card.match(/<header class="h4 two-lines">([\s\S]*?)<\/header>/)?.[1] ?? "");
      const when = textOf(card.match(/<span class="one-line">([\s\S]*?)<\/span>/)?.[1] ?? "");
      const href = card.match(/href="([^"]+)"/)?.[1] ?? "";
      if (!title || !when) {
        skip.add("Karte ohne Titel oder Datum", title || href || "?");
        continue;
      }
      if (YOUTH.test(title)) {
        skip.add("Youth League", title);
        continue;
      }

      // "23 - 25 January 2026" bzw. "7 - 9 May 2027": erster Tag zählt.
      const m = when.match(/^(\d{1,2})\s*[-–]\s*\d{1,2}\s+([A-Za-z]+)\s+(\d{4})$/);
      const month = m ? monthNumber(m[2]) : null;
      const date = m && month ? isoDate(Number(m[3]), month, Number(m[1])) : null;
      if (!date) {
        skip.add("Datum nicht lesbar", `${title} (${when})`);
        continue;
      }
      if (date < now) {
        skip.add("liegt in der Vergangenheit", title);
        continue;
      }

      const parsed = title.match(NAME);
      if (!parsed) {
        skip.add("Name folgt nicht dem Karate-One-Schema", title);
        continue;
      }
      const [, , series, city] = parsed;

      events.push({
        slug: slugify(title),
        date,
        sport: "Karate",
        promotion: "WKF",
        title,
        // Karate 1 ist immer Kumite und Kata über alle Klassen — gleiche
        // Formulierung, die im Kalender schon für Karate-1-Events steht.
        main: "Kumite & kata across all weight classes",
        venue: city.trim(),
        broadcaster: "-",
        note: `WKF Karate 1 ${series} leg. Senior event feeding the WKF world rankings; dates from wkf.net.`,
        // Die ID aus dem Pfad (/!/421/…) ist stabil, der Name-Teil nicht.
        sourceKey: href.match(/!\/(\d+)\//)?.[1] ?? slugify(title),
        sourceUrl: href.startsWith("http") ? href : `${BASE}${href}`,
      });
    }

    return { ...base, events, skipped: skip.list(), error: null };
  },
};
