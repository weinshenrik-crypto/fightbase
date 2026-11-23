import { eventHeadline, formatDate, type FightEvent } from "./events";

// Was auf Instagram und TikTok geht: welche Events, in welchem Zeitraum, mit
// welchem Text. Reine Funktionen ohne Datenbank — die Bilder zeichnet
// lib/socialCard.tsx, die Uebersicht steht unter /admin/social.
//
// Zwei Formate, mit Absicht nicht mehr:
//
// - **Das Wochenende** als ein Bild mit allen Events von Freitag bis Sonntag.
//   Das ist der eigentliche Punkt von Fightbase — alle Sportarten an einer
//   Stelle — und es kommt jede Woche zuverlaessig etwas heraus.
// - **Einzelposts nur fuer Kaempfe mit angekuendigter Paarung.** An einem
//   starken Wochenende traegt der Import ein Dutzend IBJJF-Opens ein. Jedes
//   davon als eigener Post waere Spam, und die Plattformen strafen das ab.
//
// Kein Text behauptet etwas, das nicht in der Zeile steht: keine Uhrzeit ohne
// startsAt, keine Paarung ohne fighters. Dieselbe Linie wie auf der Seite.

export type Lang = "en" | "de";

/**
 * Ein Kampf mit Paarung — gross genug fuer einen eigenen Post.
 *
 * Entweder mit eingetragenem Kaempferpaar oder mit "vs" im Hauptkampf: Der
 * Matchroom-Import fuellt fighter_a/fighter_b nicht (siehe lib/eventSources),
 * "Walker vs Rocha" ist aber genauso ein Kampf. Ein Turnier ("Gi divisions")
 * hat beides nicht.
 */
export function isHighlight(e: FightEvent): boolean {
  if (Array.isArray(e.fighters) && e.fighters.length === 2) return true;
  return /\bvs\.?\s/i.test(e.main ?? "");
}

/** Nur mit eingetragenem Paar gibt es Figuren auf der Karte. */
export function pairOf(e: FightEvent): [string, string] | null {
  return Array.isArray(e.fighters) && e.fighters.length === 2 ? e.fighters : null;
}

const iso = (d: Date) => d.toISOString().slice(0, 10);

/**
 * Freitag bis Sonntag des kommenden Wochenendes, als ISO-Daten.
 *
 * Von Montag bis Donnerstag ist das das naechste, von Freitag bis Sonntag das
 * laufende — wer am Samstag postet, meint dieses Wochenende, nicht das
 * naechste.
 */
export function weekendRange(today: string): { from: string; to: string } {
  const d = new Date(today + "T00:00:00Z");
  const dow = d.getUTCDay(); // 0 = So, 5 = Fr, 6 = Sa
  const toFriday = dow === 0 ? -2 : dow === 6 ? -1 : 5 - dow;
  const fri = new Date(d);
  fri.setUTCDate(d.getUTCDate() + toFriday);
  const sun = new Date(fri);
  sun.setUTCDate(fri.getUTCDate() + 2);
  return { from: iso(fri), to: iso(sun) };
}

/** ISO-Datum plus n Tage. */
export function addDays(date: string, n: number): string {
  const d = new Date(date + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return iso(d);
}

/** Heute als ISO-Datum (UTC). Ausserhalb der Komponenten, wegen react-hooks/purity. */
export function todayIso(): string {
  return iso(new Date());
}

export function eventsBetween(events: FightEvent[], from: string, to: string): FightEvent[] {
  return events.filter((e) => e.date >= from && e.date <= to);
}

/**
 * Reihenfolge fuer die Wochenend-Karte: Kaempfe mit Paarung zuerst, dann nach
 * Datum. Passen nicht alle auf die Karte, fallen die Turniere weg, nicht die
 * Hauptkaempfe.
 */
export function weekendOrder(events: FightEvent[]): FightEvent[] {
  return [...events].sort(
    (a, b) =>
      Number(isHighlight(b)) - Number(isHighlight(a)) || a.date.localeCompare(b.date)
  );
}

const SPORT_TAGS: Record<string, string[]> = {
  MMA: ["mma", "ufc"],
  Boxing: ["boxing", "boxen"],
  "Muay Thai": ["muaythai"],
  Kickboxing: ["kickboxing"],
  "Jiu-Jitsu": ["bjj", "jiujitsu"],
  Judo: ["judo"],
  Wrestling: ["wrestling", "ringen"],
  Karate: ["karate"],
  Taekwondo: ["taekwondo"],
};

// Wo der Name allein ein nutzloser Tag waere: #one und #glory finden alles
// Moegliche, nur keinen Kampfsport.
const PROMOTION_TAGS: Record<string, string> = {
  ONE: "onechampionship",
  GLORY: "glorykickboxing",
};

/** "Matchroom Boxing" → "matchroomboxing"; leere oder zu lange Tags fallen weg. */
export function promotionTag(promotion: string): string | null {
  if (PROMOTION_TAGS[promotion]) return PROMOTION_TAGS[promotion];
  const t = promotion
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  return t.length >= 2 && t.length <= 30 ? t : null;
}

export function hashtags(events: FightEvent[]): string {
  const tags = new Set<string>(["combatsports", "fightbase"]);
  for (const e of events) {
    for (const t of SPORT_TAGS[e.sport] ?? []) tags.add(t);
    const p = promotionTag(e.promotion);
    if (p) tags.add(p);
  }
  // Instagram nimmt bis zu 30; mehr als ein Dutzend wirkt wie Spam.
  return [...tags].slice(0, 12).map((t) => `#${t}`).join(" ");
}

function dayLabel(date: string, lang: Lang): string {
  if (lang === "en") {
    const { weekday, day, month } = formatDate(date);
    return `${weekday} ${day} ${month}`;
  }
  const d = new Date(date + "T00:00:00Z");
  return d.toLocaleDateString("de-DE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

/** Startzeit am Austragungsort, nur wenn die Quelle eine nennt. */
function startLine(e: FightEvent, lang: Lang): string | null {
  if (!e.startsAt) return null;
  const tz = e.timezone || "UTC";
  const time = new Date(e.startsAt).toLocaleTimeString(lang === "de" ? "de-DE" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: tz,
    timeZoneName: "short",
  });
  return lang === "de" ? `Beginn: ${time} (Ortszeit)` : `Starts: ${time} (local time)`;
}

export function eventCaption(e: FightEvent, lang: Lang): string {
  const { headline, sub } = eventHeadline(e);
  const lines = [
    `${headline}`,
    sub ? sub : null,
    `📅 ${dayLabel(e.date, lang)}${e.venue ? ` · ${e.venue}` : ""}`,
    startLine(e, lang),
    "",
    lang === "de"
      ? "Alle Termine aus 9 Kampfsportarten in einem Kalender — kostenlos auf fightbase.io (Link in Bio)."
      : "Every event across 9 combat sports in one calendar — free at fightbase.io (link in bio).",
    "",
    hashtags([e]),
  ];
  return lines.filter((l) => l !== null).join("\n");
}

export function weekendCaption(events: FightEvent[], lang: Lang): string {
  const head =
    lang === "de" ? "Dieses Wochenende im Kampfsport 🥊" : "This weekend in combat sports 🥊";
  const list = weekendOrder(events).map((e) => {
    const { headline } = eventHeadline(e);
    return `• ${dayLabel(e.date, lang)} — ${headline} (${e.promotion})`;
  });
  return [
    head,
    "",
    ...list,
    "",
    lang === "de"
      ? "Alle Termine, Zeiten in deiner Zeitzone und Kalender-Abos: fightbase.io (Link in Bio)."
      : "All dates, start times in your timezone and calendar subscriptions: fightbase.io (link in bio).",
    "",
    hashtags(events),
  ].join("\n");
}
