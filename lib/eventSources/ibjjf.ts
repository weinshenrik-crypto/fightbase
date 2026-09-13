// Jiu-Jitsu: IBJJF-Kalender.
//
// Die einzige Quelle im Projekt, die fertiges JSON liefert — laut CLAUDE.md die
// beste überhaupt. Ohne den Header X-Requested-With: XMLHttpRequest antwortet
// sie mit {"error":"Denied"}, die Seite selbst ist JS-gerendert.
//
// Ein Eintrag sieht so aus:
//   { "id": 2379, "name": "Rio Summer International Open ...",
//     "championshipType": "International Open", "region": "South America",
//     "startDay": 12, "endDay": 13, "month": "Jan", "year": 2024,
//     "local": "Arena Cel. Wenceslau Malta", "city": "Rio de Janeiro",
//     "status": "finished", "eventGroups": [{ "name": "No-Gi" }] }
//
// `status` taugt nicht als Filter für "kommt noch": im Abruf standen 96
// Einträge auf "published", darunter Termine aus Juni 2024. Gefiltert wird
// deshalb über das zusammengebaute Datum.

import {
  type EventSource,
  type SourceEvent,
  type SourceResult,
  SkipLog,
  fetchText,
  isoDate,
  monthNumber,
  slugify,
  today,
} from "./types";

const URL = "https://ibjjf.com/api/v1/events/calendar.json";

type ApiEvent = {
  id: number;
  name: string;
  championshipType: string | null;
  region: string | null;
  startDay: number | null;
  month: string | null;
  year: number | null;
  local: string | null;
  city: string | null;
  eventGroups?: { id: number; name: string }[] | null;
};

// Nachwuchsturniere gehören nicht in einen Erwachsenen-Kampfkalender — dieselbe
// Linie, die CLAUDE.md für Judo zieht ("nur Senior/Elite eintragen").
//
// Zwei Stellen sagen etwas darüber, und geprüft werden beide: der Name
// ("Pan Kids", "idade 04 a 15") und championshipType, wo die IBJJF eigene
// Kids-Kategorien führt ("Euro KIDS", "American National kids", "Pan Kids").
// Der Typ allein reicht nicht, der Name allein auch nicht.
const YOUTH = /\b(kids?|juvenile|teen)\b|idade\s*\d/i;

function venueOf(e: ApiEvent): string {
  const parts = [e.local, e.city].map((p) => (p ?? "").trim()).filter(Boolean);
  // Doppelung vermeiden, wenn local schon die Stadt ist.
  return parts.length === 2 && parts[0] === parts[1] ? parts[0] : parts.join(", ");
}

export const ibjjf: EventSource = {
  id: "ibjjf",
  label: "IBJJF (Jiu-Jitsu)",
  home: "https://ibjjf.com",

  async load(): Promise<SourceResult> {
    const base = { id: "ibjjf", label: "IBJJF (Jiu-Jitsu)" };
    const res = await fetchText(URL, { "X-Requested-With": "XMLHttpRequest" });
    if ("error" in res) return { ...base, events: [], skipped: [], error: res.error };

    let raw: { infosite_events?: ApiEvent[] };
    try {
      raw = JSON.parse(res.text);
    } catch {
      return { ...base, events: [], skipped: [], error: "IBJJF: Antwort ist kein JSON" };
    }
    const items = raw.infosite_events;
    if (!Array.isArray(items)) {
      return { ...base, events: [], skipped: [], error: "IBJJF: Feld infosite_events fehlt" };
    }

    const skip = new SkipLog();
    const now = today();
    const events: SourceEvent[] = [];

    for (const e of items) {
      const name = (e.name ?? "").trim();
      if (!name || e.year == null || !e.month || e.startDay == null) {
        skip.add("unvollständiger Eintrag", name || `#${e.id}`);
        continue;
      }

      const month = monthNumber(e.month);
      const date = month ? isoDate(e.year, month, e.startDay) : null;
      if (!date) {
        skip.add("Datum nicht lesbar", `${name} (${e.month} ${e.startDay} ${e.year})`);
        continue;
      }
      if (date < now) {
        skip.add("liegt in der Vergangenheit", name);
        continue;
      }
      const type = (e.championshipType ?? "").trim();
      if (YOUTH.test(name) || YOUTH.test(type)) {
        skip.add("Nachwuchsturnier", name);
        continue;
      }

      const venue = venueOf(e);
      if (!venue) {
        skip.add("kein Austragungsort angegeben", name);
        continue;
      }

      const groups = (e.eventGroups ?? []).map((g) => g.name).filter(Boolean);

      // Gi oder No-Gi ist die eine Angabe, die bei jedem IBJJF-Turnier
      // eindeutig aus Name und eventGroups hervorgeht — und das Einzige, was
      // sich ueber die ausgetragenen Klassen sagen laesst, ohne etwas zu
      // behaupten. championshipType taugt dafuer nicht: die API fuehrt dort
      // interne Kategorien mit Platzhaltern und Tippfehlern
      // ("Nationals [exept American]", "[city name] International Open").
      const noGi = /no[-\s]?gi/i.test(name) || groups.some((g) => /no[-\s]?gi/i.test(g));

      events.push({
        slug: slugify(name),
        date,
        sport: "Jiu-Jitsu",
        promotion: "IBJJF",
        title: name,
        // Was ausgetragen wird — keine Paarung erfunden.
        main: noGi ? "No-gi divisions" : "Gi divisions",
        venue,
        broadcaster: "-",
        note:
          `Official IBJJF ${noGi ? "no-gi" : "gi"} tournament` +
          (e.region ? ` (${e.region})` : "") +
          `. Dates from the IBJJF calendar; check ibjjf.com for registration deadlines.`,
        sourceKey: String(e.id),
        sourceUrl: "https://ibjjf.com/events/calendar",
      });
    }

    return { ...base, events, skipped: skip.list(), error: null };
  },
};
