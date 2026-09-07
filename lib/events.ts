// Typen und reine Helfer rund um Events.
//
// Die Events selbst liegen in Supabase, nicht mehr hier — siehe lib/eventsDb.ts.
// Funktionen, die eine Eventliste brauchen, bekommen sie als Parameter, damit
// dieses Modul ohne Datenzugriff auskommt und auch im Client nutzbar bleibt.
export type FightEvent = {
  id: string;
  date: string;
  sport: string;
  promotion: string;
  title: string;
  main: string;
  fighters?: [string, string];
  venue: string;
  broadcaster: string;
  note: string;
  // Absoluter Beginn der Hauptkarte als ISO-String, plus die IANA-Zone des
  // Austragungsorts. Beide fehlen, solange der Veranstalter keine Zeit
  // angekündigt hat — geraten wird hier nichts.
  startsAt?: string;
  timezone?: string;
  // Undercard bouts announced so far — only added once officially confirmed
  // by the promotion, never guessed. Most cards this far out aren't full yet.
  undercard?: string[];
};


export const SPORTS = [
  "All",
  "MMA",
  "Boxing",
  "Muay Thai",
  "Kickboxing",
  "Jiu-Jitsu",
  "Judo",
  "Wrestling",
  "Karate",
  "Taekwondo",
];

/**
 * Startzeit am Austragungsort, z.B. "19:00 JST".
 *
 * Ohne timezone wird die Zone des Betrachters benutzt — das ist nur dann
 * richtig, wenn beim Eintragen keine Ortszeit bekannt war, und deshalb der
 * seltene Fall.
 */
export function venueTime(startsAt: string, timezone?: string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: "short",
    ...(timezone ? { timeZone: timezone } : {}),
  }).format(new Date(startsAt));
}

/** Startzeit in der Zone des Betrachters, z.B. "11:00". */
export function localTime(startsAt: string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(startsAt));
}

/**
 * Ob sich Ortszeit und Betrachterzeit überhaupt unterscheiden. Wenn nicht,
 * wäre ein zweiter Zeitstempel nur Rauschen.
 */
export function timeDiffers(startsAt: string, timezone?: string) {
  if (!timezone) return false;
  const at = (tz?: string) =>
    new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      ...(tz ? { timeZone: tz } : {}),
    }).format(new Date(startsAt));
  return at(timezone) !== at();
}

export function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  const weekday = d.toLocaleDateString("en-GB", { weekday: "short" });
  const day = d.getDate();
  const month = d.toLocaleDateString("en-GB", { month: "short" });
  return { weekday, day, month };
}

export function daysUntil(iso: string) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(iso + "T00:00:00");
  return Math.round((target.getTime() - now.getTime()) / 86400000);
}

/**
 * Kalender-Reihenfolge: kommende Events zuerst (das nächste oben), vergangene
 * darunter, das zuletzt gelaufene zuerst.
 *
 * Reines Sortieren nach Datum stellt sonst ein abgeschlossenes Event an den
 * Anfang der Startseite — beim ersten Blick sieht ein Besucher dann eine Karte,
 * die schon gelaufen ist. Ausblenden wäre die Alternative, aber vergangene
 * Events behalten ihren Wert: ihre Detailseiten sind indexiert, und wer nach
 * einem Ergebnis sucht, landet genau dort.
 */
export function sortForCalendar<T extends { date: string }>(events: T[]): T[] {
  const upcoming: T[] = [];
  const past: T[] = [];
  events.forEach((e) => (daysUntil(e.date) >= 0 ? upcoming : past).push(e));
  upcoming.sort((a, b) => (a.date > b.date ? 1 : -1));
  past.sort((a, b) => (a.date > b.date ? -1 : 1));
  return [...upcoming, ...past];
}

// Deterministic hue per fighter name — original illustration, not a photo.
export function nameHue(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

// Official homepages for broadcasters we know — never guessed, only real domains.
export const BROADCASTER_LINKS: Record<string, string> = {
  DAZN: "https://www.dazn.com",
  "RTL+": "https://plus.rtl.de",
  "RTL (Free-TV)": "https://www.rtl.de",
  FloGrappling: "https://www.flograppling.com",
  "IJF TV": "https://www.ijf.org",
  "ESPN+/PPV": "https://plus.espn.com",
};

// Official promotion homepages we're confident about — never guessed.
export const PROMOTION_LINKS: Record<string, string> = {
  ADCC: "https://adcombat.com",
  GLORY: "https://glorykickboxing.com",
  IJF: "https://www.ijf.org",
  OKTAGON: "https://oktagonmma.com",
  UFC: "https://www.ufc.com",
  UWW: "https://uww.org",
  WKF: "https://www.wkf.net",
  "World Taekwondo": "https://www.worldtaekwondo.org",
  "Queensberry Promotions": "https://queensberry.co.uk",
  "Riyadh Season": "https://riyadhseason.sa",
  "ONE Championship": "https://www.onefc.com",
  IBJJF: "https://ibjjf.com",
};

// Best-effort city/locality extracted from a "Venue, City" style string,
// used for optional structured-data address fields.
export function venueLocality(venue: string) {
  const parts = venue.split(",").map((p) => p.trim());
  return parts.length > 1 ? parts[parts.length - 1] : null;
}

export function watchLinks(broadcaster: string) {
  if (broadcaster === "-" || broadcaster === "TBA") return [];
  return broadcaster
    .split("/")
    .map((b) => b.trim())
    .filter(Boolean)
    .map((label) => ({ label, url: BROADCASTER_LINKS[label] }));
}

export function fighterSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function sportSlug(sport: string) {
  return sport.toLowerCase().replace(/\s+/g, "-");
}

export function sportBySlug(slug: string) {
  return SPORTS.find((s) => s !== "All" && sportSlug(s) === slug) ?? null;
}

export function promotionSlug(promotion: string) {
  return promotion
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function allPromotionNames(events: FightEvent[]) {
  return Array.from(new Set(events.map((e) => e.promotion)));
}

export function promotionBySlug(events: FightEvent[], slug: string) {
  return allPromotionNames(events).find((p) => promotionSlug(p) === slug) ?? null;
}

// Promotions with too few events would just duplicate their one event
// page's content with no real added value, so only list ones with enough
// events to justify a standalone calendar page.
export function promotionsWithPage(events: FightEvent[], minEvents = 2) {
  const counts = new Map<string, number>();
  events.forEach((e) =>
    counts.set(e.promotion, (counts.get(e.promotion) ?? 0) + 1)
  );
  return Array.from(counts.entries())
    .filter(([, count]) => count >= minEvents)
    .map(([promotion]) => promotion)
    .sort();
}

export const SPORT_DESCRIPTIONS: Record<string, string> = {
  MMA: "Every upcoming UFC, ONE Championship, OKTAGON and other major MMA card in one place — dates, fight cards and where to watch.",
  Boxing:
    "Every upcoming world title fight and major boxing card — dates, matchups and where to watch, with no fabricated fights or fake ticket links.",
  "Muay Thai":
    "Upcoming Muay Thai events from the world's top promotions, with fight cards and streaming info.",
  Kickboxing:
    "Every upcoming GLORY, ONE Championship and K-1 kickboxing card, including title fights and Grand Prix events.",
  "Jiu-Jitsu":
    "Upcoming IBJJF, ADCC and other major Brazilian Jiu-Jitsu tournaments and no-gi grappling events.",
  Judo: "Upcoming IJF Judo Grand Slam, Grand Prix and World Championship events.",
  Wrestling:
    "Upcoming United World Wrestling (UWW) Ranking Series events and major freestyle, Greco-Roman and women's wrestling tournaments.",
  Karate:
    "Upcoming WKF Karate 1 Premier League and Series A events feeding the world karate rankings.",
  Taekwondo:
    "Upcoming World Taekwondo Grand Prix events and the season-ending Grand Prix Final.",
};

export function allFighterNames(events: FightEvent[]) {
  return Array.from(
    new Set(events.flatMap((e) => e.fighters ?? []))
  ).sort();
}

export function fighterBySlug(events: FightEvent[], slug: string) {
  return allFighterNames(events).find((n) => fighterSlug(n) === slug) ?? null;
}

export function upcomingFightsFor(events: FightEvent[], name: string) {
  return events
    .filter((e) => e.fighters?.includes(name) && daysUntil(e.date) >= 0)
    .sort((a, b) => (a.date > b.date ? 1 : -1));
}
