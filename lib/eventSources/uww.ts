// Ringen: United World Wrestling.
//
// CLAUDE.md: uww.org/events, nicht /calendar (das gibt es nicht, 404).
//
// **Die Seite wurde im September 2026 neu gebaut und liefert ihre Termine nicht
// mehr im HTML aus.** Vorher stand dort eine serverseitig gerenderte Tabelle mit
// eigenen Spalten für Altersklasse, Turniertyp und Stil (`class="table-data
// category"` und Geschwister); daran hing der alte Parser. Jetzt kommt ein
// React-Gerüst: 16 leere `<tr>`, die der Browser nachträglich füllt. Ein Fetch
// sieht davon nichts — der erste echte Cron-Lauf am 14.09.2026 meldete deshalb
// "UWW: Eventtabelle nicht gefunden" und legte nichts an.
//
// Zwei Wege wurden geprüft und verworfen:
//
//   athena.uww.org/api/public/competitions[/<id>/schedules]  — die Seite nennt
//     diese API selbst, aber sie antwortet ohne Zugangsdaten mit HTTP 401.
//   Die Tabelle im Browser rendern (Chromium in der Cron-Route) — für eine
//     Handvoll Termine pro Jahr die falsche Größenordnung, und es macht den
//     Job von einer Browser-Installation abhängig.
//
// Übrig bleibt der strukturierte Datenblock, den die Seite für Suchmaschinen
// mitliefert: ein `application/ld+json` mit `@graph` -> `ItemList` ->
// `SportsEvent`. Der ist sauber typisiert (startDate, endDate, name, location,
// url) und steht im HTML. Sein Preis steht in `numberOfItems`: **drei** — die
// nächsten drei Termine, egal welche Filter oder Seitenzahlen man an die URL
// hängt (geprüft mit ?page=1, ?page=2, ?type=ranking-series).
//
// Diese Quelle deckt Ringen also nur noch dünn ab. Das ist bewusst so und steht
// auch auf der Sport-Landingpage (lib/sportGuides.ts, "Why this calendar is
// short") — lieber eine ehrliche Lücke als erfundene Termine.
//
// ---------------------------------------------------------------------------
// Was die Filter jetzt schwächer macht, und warum sie trotzdem so aussehen
// ---------------------------------------------------------------------------
//
// Der alte Parser filterte über zwei eigene Spalten der Tabelle: `category`
// musste "Senior" enthalten, `style` einen der vier Ringstile. Beides gibt es im
// JSON-LD nicht. Ersatz:
//
//   Altersklasse  Ausschlussliste über den Namen. UWW benennt Nachwuchs- und
//                 Veteranentermine ausdrücklich ("U23 World Championships"),
//                 die Senioren-WM heißt "Senior World Championships". Das ist
//                 schwächer als eine eigene Spalte: Ein unbenanntes
//                 Nachwuchsturnier käme durch.
//   Turniertyp    Positivliste über den Namen, gleiche Absicht wie vorher —
//                 nationale Opens sollen den Kalender nicht fluten. Sie fängt
//                 zugleich den Rest des Altersklassen-Risikos ab: Ein
//                 Jugendturnier ohne Marker im Namen müsste zusätzlich wie eine
//                 WM oder Ranking Series heißen, um durchzurutschen.
//   Disziplin     `sport` aus dem JSON-LD muss "Wrestling" sein, plus eine
//                 Ausschlussliste für die Nicht-Ring-Disziplinen, die die UWW
//                 ebenfalls regelt (Grappling, Pankration, Amateur-MMA,
//                 Gürtelringen). Deren WMs würden sonst unter sport =
//                 "Wrestling" falsch einsortiert.
//
// Nicht übernommen wird, was keine Altersklasse im Namen trägt und auch nicht
// zu den großen Turniertypen gehört — dann steht es als Hinweis im Protokoll
// und kann von Hand über /admin/events nachgetragen werden.
//
// Was im JSON-LD **nicht** steht: die Stile (Freestyle/Greco/Frauen). Deshalb
// nennt `main` nur noch die Disziplin, nicht mehr die Stilliste. Raten wäre hier
// dasselbe wie eine erfundene Paarung.

import {
  type EventSource,
  type SourceEvent,
  type SourceResult,
  SkipLog,
  fetchText,
  isoDate,
  slugify,
  today,
} from "./types";

const BASE = "https://uww.org";
const URL = `${BASE}/events`;

/** Nachwuchs und Veteranen. UWW schreibt die Klasse in den Turniernamen. */
const NON_SENIOR =
  /\b(u-?\s?1[0-9]|u-?\s?2[0-3]|cadets?|juniors?|youth|schoolboys?|schoolgirls?|veterans?|masters?)\b/i;

/**
 * Disziplinen, die die UWW ebenfalls regelt, die aber kein Ringen sind. Die
 * Stilspalte der alten Tabelle führte sie als PK, AMMA, GP, AL_FS, KK — im
 * JSON-LD bleibt nur der Name.
 */
const NOT_WRESTLING =
  /\b(grappling|pankration|amateur\s*mma|\bmma\b|belt\s*wrestling|alysh|kurash|sambo)\b/i;

/**
 * Turniertypen, die in den Kalender gehören. Gleiche Grenze wie vorher: Im
 * alten Abruf standen 33 Senior-Einträge auf "International Tournament" —
 * nationale Opens, die den Kalender fluten würden. "Im Zweifel lieber
 * weggelassen."
 */
const KEEP_TYPES: { label: string; test: RegExp }[] = [
  { label: "World Championships", test: /\bworld\s+championships?\b/i },
  { label: "World Series", test: /\bworld\s+series\b/i },
  { label: "Ranking Series", test: /\branking\s+series\b/i },
  { label: "World Cup", test: /\bworld\s+cup\b/i },
  {
    label: "Continental Championships",
    test: /\b(european|asian|african|oceania|pan[-\s]?american|american)\s+championships?\b/i,
  },
  {
    label: "Games",
    test: /\b(olympic|asian|european|african|pan[-\s]?american|commonwealth|mediterranean)\s+games\b/i,
  },
];

function keepType(name: string): string | null {
  return KEEP_TYPES.find((t) => t.test.test(name))?.label ?? null;
}

/**
 * Was ausgetragen wird. Ohne die Stilspalte bleibt nur die Disziplin — und die
 * nur, wenn der Name sie nennt. Nie eine erfundene Paarung, nie geraten.
 */
function mainFor(name: string): string {
  return /\bbeach\s*wrestling\b/i.test(name) ? "Beach wrestling" : "Wrestling";
}

/** "2026-10-24T00:00:00.000Z" -> "2026-10-24", sonst null. */
function dayOf(startDate: unknown): string | null {
  if (typeof startDate !== "string") return null;
  const m = startDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  return isoDate(Number(m[1]), Number(m[2]), Number(m[3]));
}

/** Letztes Pfadsegment der Event-URL — die stabile ID der Quelle. */
function keyOf(url: string): string {
  return url.replace(/[?#].*$/, "").replace(/\/+$/, "").split("/").pop() ?? "";
}

type LdEvent = {
  name?: unknown;
  url?: unknown;
  "@id"?: unknown;
  sport?: unknown;
  startDate?: unknown;
  eventStatus?: unknown;
  location?: { name?: unknown } | unknown;
};

/**
 * Alle SportsEvent-Einträge aus den ld+json-Blöcken der Seite.
 *
 * Die Blöcke liegen als `@graph` vor, nicht als einzelnes Objekt — ein Parser,
 * der nur auf `@type` der obersten Ebene schaut, findet die Liste nicht.
 */
function sportsEvents(html: string): LdEvent[] {
  const out: LdEvent[] = [];
  const blocks = html.matchAll(
    /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi
  );
  for (const block of blocks) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(block[1]);
    } catch {
      continue; // Ein kaputter Block darf die anderen nicht mitnehmen.
    }
    const nodes: unknown[] = [];
    const push = (v: unknown) => {
      if (Array.isArray(v)) nodes.push(...v);
      else if (v && typeof v === "object") nodes.push(v);
    };
    push(parsed);
    if (parsed && typeof parsed === "object" && "@graph" in parsed) {
      push((parsed as { "@graph": unknown })["@graph"]);
    }
    for (const node of nodes) {
      const n = node as { "@type"?: unknown; itemListElement?: unknown };
      if (n["@type"] !== "ItemList" || !Array.isArray(n.itemListElement)) continue;
      for (const entry of n.itemListElement) {
        const item = (entry as { item?: unknown })?.item as
          | { "@type"?: unknown }
          | undefined;
        if (item && item["@type"] === "SportsEvent") out.push(item as LdEvent);
      }
    }
  }
  return out;
}

export const uww: EventSource = {
  id: "uww",
  label: "UWW (Ringen)",
  home: BASE,

  async load(): Promise<SourceResult> {
    const base = { id: "uww", label: "UWW (Ringen)" };
    const res = await fetchText(URL);
    if ("error" in res) return { ...base, events: [], skipped: [], error: res.error };

    const found = sportsEvents(res.text);
    if (found.length === 0) {
      // Lautstark scheitern statt still nichts anzulegen: Wenn die UWW auch
      // diesen Block umbaut, soll das im Protokoll stehen und nicht als
      // "0 neue Events" durchgehen.
      return {
        ...base,
        events: [],
        skipped: [],
        error: "UWW: kein SportsEvent im strukturierten Datenblock (ld+json)",
      };
    }

    const skip = new SkipLog();
    const now = today();
    const events: SourceEvent[] = [];

    for (const item of found) {
      const title = typeof item.name === "string" ? item.name.trim() : "";
      const url =
        typeof item.url === "string"
          ? item.url
          : typeof item["@id"] === "string"
            ? (item["@id"] as string)
            : "";
      if (!title) {
        skip.add("Eintrag ohne Turniernamen", url || "ohne URL");
        continue;
      }

      const status = typeof item.eventStatus === "string" ? item.eventStatus : "";
      if (status && !/EventScheduled/i.test(status)) {
        skip.add("nicht angesetzt (abgesagt oder verlegt)", `${title} (${status})`);
        continue;
      }

      const sport = typeof item.sport === "string" ? item.sport.trim() : "";
      if (sport.toLowerCase() !== "wrestling" || NOT_WRESTLING.test(title)) {
        skip.add(
          "keine Ringer-Disziplin (Grappling, Pankration, Amateur-MMA)",
          `${title} (${sport || "ohne Angabe"})`
        );
        continue;
      }

      if (NON_SENIOR.test(title)) {
        skip.add("keine Senior-Klasse", title);
        continue;
      }

      const type = keepType(title);
      if (!type) {
        skip.add("Turniertyp zu klein für den Kalender", title);
        continue;
      }

      const date = dayOf(item.startDate);
      if (!date) {
        skip.add("Datum nicht lesbar", `${title} (${String(item.startDate)})`);
        continue;
      }
      if (date < now) {
        skip.add("liegt in der Vergangenheit", title);
        continue;
      }

      const loc = item.location as { name?: unknown } | undefined;
      const venue = typeof loc?.name === "string" ? loc.name.trim() : "";
      if (!venue) {
        skip.add("kein Austragungsort angegeben", title);
        continue;
      }

      const sourceKey = keyOf(url);
      if (!sourceKey) {
        skip.add("keine Event-URL, also keine stabile ID", title);
        continue;
      }

      events.push({
        // Die UWW-Titel sind generisch ("Senior World Championships") und taugen
        // so nicht als URL in einem Kalender mit neun Sportarten. Verband und
        // Jahr machen sie eindeutig — dieselbe Form, die im Kalender schon steht
        // ("uww-worlds-2026", "uww-zagreb-open-2027").
        slug: slugify(`uww-${title}-${date.slice(0, 4)}`),
        date,
        sport: "Wrestling",
        promotion: "UWW",
        title,
        main: mainFor(title),
        venue,
        broadcaster: "-",
        note: `United World Wrestling ${type}. Dates from the official UWW calendar.`,
        sourceKey,
        sourceUrl: url.startsWith("http") ? url : `${BASE}${url}`,
      });
    }

    return { ...base, events, skipped: skip.list(), error: null };
  },
};
