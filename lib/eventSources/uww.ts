// Ringen: United World Wrestling.
//
// CLAUDE.md: uww.org/events, nicht /calendar (das gibt es nicht, 404). Die
// Seite ist serverseitig gerendert; die Tabelle trägt Monatsüberschriften und
// pro Event eine Zeile mit eigenen Spalten:
//
//   <h3 class="table-title">January 2026</h3>
//   <a href="/event/zagreb-open" class="table-row …">
//     <div class="table-data date">08-11</div>
//     <div class="table-data series"><span class="text">Zagreb Open</span></div>
//     <div class="table-data place">… Zagreb, Croatia</div>
//     <div class="table-data event"><span class="text">Ranking Series</span></div>
//     <div class="table-data category"><span class="text">Senior</span></div>
//     <div class="table-data style"><span class="text">FS, GR, WW</span></div>
//
// Zwei Filter, beide aus den Spalten der Quelle und nicht geraten:
//
//   category  muss "Senior" enthalten. Die Spalte listet Altersklassen auf
//             ("Senior, U17"), reine U15/U17/U20/Veteran-Turniere fallen raus.
//   event     nur die bedeutenden Turniertypen. Im Abruf standen 33 Senior-
//             Einträge auf "International Tournament" — nationale Opens, die
//             den Kalender fluten würden. "Im Zweifel lieber weggelassen."
//
// Das Jahr steht in der Monatsüberschrift, nicht in der Zeile — deshalb wird
// die Tabelle in Dokumentreihenfolge durchlaufen und die zuletzt gesehene
// Überschrift mitgeführt.

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

const BASE = "https://uww.org";
const URL = `${BASE}/events`;

// Was aufgenommen wird. Alles andere gilt als zu klein für den Kalender.
const KEEP_TYPES = new Set([
  "ranking series",
  "world championships",
  "continental championships",
  "championships",
  "games",
]);

// Die Stilspalte fuehrt alles, was UWW als Verband regelt — nicht nur Ringen.
// Im Abruf kamen vor: FS, GR, WW, BW, GP, GP_GI, PK, AMMA, AL_FS, AL_CS, KARA,
// KK. Nur die vier Ringstile gehoeren unter sport = "Wrestling"; die
// Grappling-, Pankration- und Amateur-MMA-Weltmeisterschaften der UWW sind
// eigene Disziplinen und wuerden unter diesem Etikett falsch einsortiert.
const WRESTLING_STYLES: Record<string, string> = {
  FS: "freestyle",
  GR: "Greco-Roman",
  WW: "women's wrestling",
  BW: "beach wrestling",
};

function wrestlingStyles(styleRaw: string): string[] {
  return styleRaw
    .split(",")
    .map((s) => WRESTLING_STYLES[s.trim().toUpperCase()])
    .filter(Boolean);
}

function mainFor(names: string[]): string {
  const list =
    names.length === 1
      ? names[0]
      : `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}`;
  return list.charAt(0).toUpperCase() + list.slice(1);
}

function cell(row: string, name: string): string {
  const m = row.match(new RegExp(`class="table-data ${name}"[^>]*>([\\s\\S]*?)</div>`));
  return m ? textOf(m[1]) : "";
}

export const uww: EventSource = {
  id: "uww",
  label: "UWW (Ringen)",
  home: BASE,

  async load(): Promise<SourceResult> {
    const base = { id: "uww", label: "UWW (Ringen)" };
    const res = await fetchText(URL);
    if ("error" in res) return { ...base, events: [], skipped: [], error: res.error };

    const start = res.text.indexOf("table-responsive");
    if (start < 0) {
      return { ...base, events: [], skipped: [], error: "UWW: Eventtabelle nicht gefunden" };
    }
    const body = res.text.slice(start);

    // Überschriften und Zeilen zusammen, damit die Reihenfolge erhalten bleibt.
    const token = /<h3 class="table-title">([^<]+)<\/h3>|<a href="(\/event\/[^"]+)"[^>]*class="table-row[^"]*">([\s\S]*?)<\/a>/g;

    const skip = new SkipLog();
    const now = today();
    const events: SourceEvent[] = [];
    let year: number | null = null;
    let month: number | null = null;

    for (const m of body.matchAll(token)) {
      if (m[1]) {
        // "January 2026"
        const [name, y] = m[1].trim().split(/\s+/);
        month = monthNumber(name);
        year = Number(y);
        continue;
      }
      const href = m[2];
      const row = m[3];
      const title = cell(row, "series");
      if (!title) {
        skip.add("Zeile ohne Turniernamen", href);
        continue;
      }
      if (year == null || month == null) {
        skip.add("keine Monatsüberschrift vor der Zeile", title);
        continue;
      }

      const category = cell(row, "category");
      if (!/\bsenior\b/i.test(category)) {
        skip.add("keine Senior-Klasse", `${title} (${category || "ohne Angabe"})`);
        continue;
      }

      const type = cell(row, "event");
      if (!KEEP_TYPES.has(type.toLowerCase())) {
        skip.add("Turniertyp zu klein für den Kalender", `${title} (${type || "ohne Angabe"})`);
        continue;
      }

      const styleRaw = cell(row, "style");
      const styles = wrestlingStyles(styleRaw);
      if (styles.length === 0) {
        skip.add(
          "keine Ringer-Disziplin (Grappling, Pankration, Amateur-MMA)",
          `${title} (${styleRaw || "ohne Angabe"})`
        );
        continue;
      }

      // "08-11" — der erste Tag ist der Starttag. Bei "25-01" läuft das Event
      // in den Folgemonat, der Start bleibt trotzdem im Überschrift-Monat.
      const day = Number(cell(row, "date").match(/\d+/)?.[0]);
      const date = day ? isoDate(year, month, day) : null;
      if (!date) {
        skip.add("Datum nicht lesbar", `${title} (${cell(row, "date")})`);
        continue;
      }
      if (date < now) {
        skip.add("liegt in der Vergangenheit", title);
        continue;
      }

      const place = cell(row, "place");
      if (!place) {
        skip.add("kein Austragungsort angegeben", title);
        continue;
      }

      events.push({
        // Die UWW-Titel sind generisch ("Asian Games", "Senior World
        // Championships") und taugen so nicht als URL in einem Kalender mit
        // neun Sportarten. Verband und Jahr davor bzw. dahinter machen sie
        // eindeutig — dieselbe Form, die im Kalender schon steht
        // ("uww-worlds-2026", "uww-zagreb-open-2027").
        slug: slugify(`uww-${title}-${date.slice(0, 4)}`),
        date,
        sport: "Wrestling",
        promotion: "UWW",
        title,
        main: mainFor(styles),
        venue: place,
        broadcaster: "-",
        note: `United World Wrestling ${type}. Senior event; dates from the official UWW calendar.`,
        sourceKey: href.replace(/^\/event\//, "").replace(/\/.*$/, ""),
        sourceUrl: `${BASE}${href}`,
      });
    }

    return { ...base, events, skipped: skip.list(), error: null };
  },
};
