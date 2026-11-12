// Kalenderdateien (RFC 5545) aus Events bauen.
//
// Bewusst ohne Bibliothek: Das Format ist klein, und die Stellen, an denen
// selbstgebaute Ausgaben typischerweise brechen — Escaping, Faltung nach
// Bytes statt Zeichen, CRLF — prueft scripts/check-ics.ts.
//
// Zwei Regeln aus dem Projekt gelten auch hier:
// - Keine geratene Uhrzeit. Ohne startsAt ist der Termin ganztaegig.
// - Die eine Schaetzung ist das Ende (Start + 3 h), weil kein Veranstalter
//   eine Dauer nennt und ein Termin ohne Ende in manchen Kalendern als
//   Strich von null Minuten erscheint. Sie steht deshalb im Termin selbst.
//
// Laeuft auch im Browser (TextEncoder statt Buffer): HomeClient baut den
// Google-Link fuer die Event-Karte selbst.

import { eventHeadline, type FightEvent } from "./events";

const SITE = "https://fightbase.io";
const ESTIMATED_DURATION_MS = 3 * 60 * 60 * 1000;
/** So weit reicht ein Feed zurueck, damit ein gerade gelaufenes Event nicht sofort verschwindet. */
const PAST_DAYS = 7;

const encoder = new TextEncoder();

export function eventUrl(e: FightEvent): string {
  return `${SITE}/events/${e.id}`;
}

/** TEXT-Wert nach RFC 5545 §3.3.11. */
export function escapeText(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Zeile nach RFC 5545 §3.1 falten: hoechstens 75 Oktette je Zeile, die
 * Fortsetzung beginnt mit einem Leerzeichen (das mitzaehlt). Getrennt wird
 * zwischen Code-Points, nie innerhalb einer UTF-8-Sequenz.
 */
export function foldLine(line: string): string {
  const parts: string[] = [];
  let current = "";
  let bytes = 0;
  for (const ch of Array.from(line)) {
    const size = encoder.encode(ch).length;
    const limit = parts.length === 0 ? 75 : 74; // Folgezeilen tragen das Leerzeichen
    if (bytes + size > limit) {
      parts.push(current);
      current = "";
      bytes = 0;
    }
    current += ch;
    bytes += size;
  }
  parts.push(current);
  return parts.join("\r\n ");
}

/** 2026-12-06T23:30:00.000Z -> 20261206T233000Z */
function utcStamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** 2026-12-31 -> 20261231 */
function dateStamp(iso: string): string {
  return iso.replace(/-/g, "");
}

/** Folgetag eines YYYY-MM-DD, kalendarisch (UTC, ohne Zeitzonenspruenge). */
function nextDay(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

type Timing =
  | { allDay: true; start: string; end: string }
  | { allDay: false; start: Date; end: Date };

function timing(e: FightEvent): Timing {
  if (e.startsAt) {
    const start = new Date(e.startsAt);
    return { allDay: false, start, end: new Date(start.getTime() + ESTIMATED_DURATION_MS) };
  }
  return { allDay: true, start: e.date, end: nextDay(e.date) };
}

/** Beschreibungstext, ungeescapt; beide Kalenderwege benutzen ihn. */
function description(e: FightEvent, t: Timing): string {
  const { sub } = eventHeadline(e);
  return [
    sub,
    e.promotion,
    // "-" und "TBA" sind Platzhalter der Tabelle, kein Sender (wie in watchLinks).
    e.broadcaster === "-" || e.broadcaster === "TBA" ? "" : e.broadcaster,
    t.allDay ? "" : "End time estimated",
    eventUrl(e),
  ]
    .map((s) => s.trim())
    .filter(Boolean)
    .join("\n");
}

/** Ein VEVENT als Zeilen, ungefaltet und ohne CRLF. */
export function eventToVevent(e: FightEvent, now: Date = new Date()): string[] {
  const t = timing(e);
  const lines = [
    "BEGIN:VEVENT",
    `UID:${e.id}@fightbase.io`,
    `DTSTAMP:${utcStamp(now)}`,
    ...(t.allDay
      ? [`DTSTART;VALUE=DATE:${dateStamp(t.start)}`, `DTEND;VALUE=DATE:${dateStamp(t.end)}`]
      : [`DTSTART:${utcStamp(t.start)}`, `DTEND:${utcStamp(t.end)}`]),
    `SUMMARY:${escapeText(eventHeadline(e).headline)}`,
    ...(e.venue.trim() ? [`LOCATION:${escapeText(e.venue.trim())}`] : []),
    `DESCRIPTION:${escapeText(description(e, t))}`,
    `URL:${eventUrl(e)}`,
    `CATEGORIES:${escapeText(e.sport)}`,
  ];
  if (!t.allDay) {
    lines.push(
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeText(eventHeadline(e).headline)}`,
      "TRIGGER:-PT1H",
      "END:VALARM"
    );
  }
  lines.push("END:VEVENT");
  return lines;
}

/** Tage von `now` bis `iso` (YYYY-MM-DD), kalendarisch in UTC. */
function daysFrom(now: Date, iso: string): number {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((new Date(iso + "T00:00:00Z").getTime() - today) / 86400000);
}

/**
 * Ein vollstaendiger Kalender mit CRLF-Zeilenenden.
 *
 * Abos zeigen nur Events ab sieben Tagen in der Vergangenheit. `allDates`
 * schaltet das ab — fuer den Einzeltermin, den man auch nachtraeglich
 * eintragen koennen soll.
 */
export function buildCalendar(
  events: FightEvent[],
  name: string,
  now: Date = new Date(),
  { allDates = false }: { allDates?: boolean } = {}
): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Fightbase//Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(name)}`,
    "REFRESH-INTERVAL;VALUE=DURATION:PT6H",
    "X-PUBLISHED-TTL:PT6H",
    ...events
      .filter((e) => allDates || daysFrom(now, e.date) >= -PAST_DAYS)
      .flatMap((e) => eventToVevent(e, now)),
    "END:VCALENDAR",
  ];
  return lines.map(foldLine).join("\r\n") + "\r\n";
}

/** Link, der Google Kalender mit dem fertigen Termin oeffnet. */
export function googleEventUrl(e: FightEvent): string {
  const t = timing(e);
  const dates = t.allDay
    ? `${dateStamp(t.start)}/${dateStamp(t.end)}`
    : `${utcStamp(t.start)}/${utcStamp(t.end)}`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: eventHeadline(e).headline,
    dates,
    details: description(e, t),
  });
  if (e.venue.trim()) params.set("location", e.venue.trim());
  return `https://calendar.google.com/calendar/render?${params}`;
}

/** Abo-Link fuer Apple-Kalender und Outlook. Nur fuer oeffentliche Feeds. */
export function webcalUrl(path: string): string {
  return `webcal://fightbase.io${path}`;
}

/**
 * Abo-Link fuer Google Kalender — immer mit der https-Adresse.
 *
 * Mit webcal:// ruft Google den Feed per http:// ab, Vercel antwortet mit 308
 * auf https, und Googles Abrufdienst folgt der Umleitung nicht: Google meldet
 * dann "URL ueberpruefen". Fuer den persoenlichen Feed kommt hinzu, dass der
 * Token bei http:// im Klartext unterwegs waere.
 */
export function googleSubscribeUrl(path: string): string {
  return `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(`https://fightbase.io${path}`)}`;
}
