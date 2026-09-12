// Judo: IJF World Judo Tour.
//
// Die Kalenderseite ist zwar JS-lastig, die Tabelle steht aber serverseitig im
// HTML — ein einfacher Fetch reicht.
//
// CLAUDE.md verlangt "nur Senior/Elite eintragen". Der naheliegende Filter
// ?age=world_tour ist dafür **falsch**: Er enthält für 2026 sieben Nachwuchs-
// Termine (Cadets, Juniors, Youth Olympic Games). Sie als Senior-Event
// einzutragen wäre genau die Art erfundener Angabe, die das Projekt nicht
// macht.
//
// Richtig ist ?age=sen — 98 Zeilen für 2026, keine davon Nachwuchs. Darunter
// sind allerdings 82 kleinere Termine (Kata World Series, nationale Opens), die
// den Kalender fluten würden. Die 16 Zeilen des eigentlichen World Judo Tour
// tragen als einzige ein Wettkampftyp-Icon im Markup:
//
//   competition_types/gs.png   Grand Slam
//   competition_types/gp.png   Grand Prix
//   competition_types/wc.png   World Championships
//   competition_types/mas.png  World Masters
//
// Das Icon ist deshalb der zweite Filter: senior laut Quelle, und bedeutend
// genug laut Quelle. Nichts davon ist geraten.
//
// Das Jahr steht nicht in der Zeile, sondern im Seitenfilter — deshalb wird pro
// Jahr einmal abgerufen.

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

const BASE = "https://www.ijf.org";
const page = (year: number) => `${BASE}/calendar?year=${year}&age=sen`;

// Nur diese Wettkampftypen. Eine Zeile ohne Icon ist ein kleinerer Termin und
// wird bewusst nicht übernommen.
const TYPES: Record<string, string> = {
  gs: "Grand Slam",
  gp: "Grand Prix",
  wc: "World Championships",
  mas: "World Masters",
};

/**
 * Starttag und -monat aus einer Zeile.
 *
 * Zwei Schreibweisen im selben Kalender:
 *   normal            <div class="calendar-date--short__month">February</div>
 *                     <div class="calendar-date--short__days">7 - 8</div>
 *   über Monatswechsel <div class="date__month">Feb</div><div class="date__day">27</div>
 *                      <div class="sep">-</div>
 *                      <div class="date__month">Mar</div><div class="date__day">1</div>
 *
 * In beiden Fällen zählt der erste Tag. Ohne die zweite Variante fiel z.B. der
 * Tashkent Grand Slam (27. Feb – 1. Mär) stillschweigend aus dem Import.
 */
function startOf(row: string): { month: number; day: number } | null {
  const shortMonth = row.match(/calendar-date--short__month">([\s\S]*?)<\/div>/);
  const shortDays = row.match(/calendar-date--short__days">([\s\S]*?)<\/div>/);
  if (shortMonth && shortDays) {
    const month = monthNumber(textOf(shortMonth[1]));
    const day = Number(textOf(shortDays[1]).match(/\d+/)?.[0]);
    if (month && day) return { month, day };
  }

  const month = monthNumber(textOf(row.match(/date__month">([\s\S]*?)<\/div>/)?.[1] ?? ""));
  const day = Number(textOf(row.match(/date__day">([\s\S]*?)<\/div>/)?.[1] ?? "").match(/\d+/)?.[0]);
  if (month && day) return { month, day };

  return null;
}

function parseRows(html: string, year: number, skip: SkipLog): SourceEvent[] {
  const out: SourceEvent[] = [];
  const now = today();
  const rows = html.match(/<tr[^>]*data-event-row-link=[\s\S]*?<\/tr>/g) ?? [];

  for (const row of rows) {
    const link = row.match(/data-event-row-link="([^"]+)"/)?.[1] ?? "";
    const title = textOf(row.match(/class="event-link-title">([\s\S]*?)<\/a>/)?.[1] ?? "");
    if (!title || !link) {
      skip.add("Zeile ohne Titel oder Link", link || "?");
      continue;
    }

    const typeKey = row.match(/competition_types\/([a-z0-9_]+)\.png/)?.[1] ?? "";
    const type = TYPES[typeKey];
    if (!type) {
      skip.add("kein World-Tour-Wettkampftyp", title);
      continue;
    }

    const start = startOf(row);
    const date = start ? isoDate(year, start.month, start.day) : null;
    if (!date) {
      skip.add("Datum nicht lesbar", title);
      continue;
    }
    if (date < now) {
      skip.add("liegt in der Vergangenheit", title);
      continue;
    }

    const location = textOf(row.match(/class="calendar-location"[\s\S]*?>([\s\S]*?)<\/td>/)?.[1] ?? "");
    if (!location) {
      skip.add("kein Austragungsort angegeben", title);
      continue;
    }

    out.push({
      slug: slugify(title),
      date,
      sport: "Judo",
      promotion: "IJF",
      title,
      // Der World Judo Tour wird über alle Gewichtsklassen ausgetragen. Eine
      // Paarung gibt es Monate im Voraus nicht und wird auch nicht erfunden.
      main: "Senior elite, all weight classes",
      venue: location,
      broadcaster: "IJF TV",
      note: `IJF World Judo Tour ${type}. Senior event; dates from the official IJF calendar.`,
      sourceKey: link.replace(/^\/+/, ""),
      sourceUrl: `${BASE}${link}`,
    });
  }
  return out;
}

export const ijf: EventSource = {
  id: "ijf",
  label: "IJF (Judo)",
  home: BASE,

  async load(): Promise<SourceResult> {
    const base = { id: "ijf", label: "IJF (Judo)" };
    const skip = new SkipLog();
    const events: SourceEvent[] = [];
    const errors: string[] = [];

    // Laufendes und kommendes Jahr. Weiter voraus plant die IJF nicht.
    const thisYear = new Date().getUTCFullYear();
    for (const year of [thisYear, thisYear + 1]) {
      const res = await fetchText(page(year));
      if ("error" in res) {
        errors.push(res.error);
        continue;
      }
      events.push(...parseRows(res.text, year, skip));
    }

    // Nur wenn kein einziges Jahr durchkam, ist es ein echter Fehler.
    const error = events.length === 0 && errors.length > 0 ? errors.join("; ") : null;
    return { ...base, events, skipped: skip.list(), error };
  },
};
