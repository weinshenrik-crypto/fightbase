// Gemeinsame Form für alle Event-Quellen.
//
// Jede Quelle liefert fertige Kandidaten in genau dieser Form; der Cron-Job
// kennt danach keine Quelle mehr einzeln. Neue Quelle heißt: eine Datei hier
// anlegen und in index.ts eintragen, sonst ändert sich nichts.

/**
 * Ein Event, wie es aus einer Quelle kommt — schon auf die Spalten der
 * `events`-Tabelle gemappt.
 *
 * Bewusst ohne `fighter_a`/`fighter_b`, `starts_at` und `undercard`: Die
 * Verbandskalender sind Turnierkalender. Sie nennen keine Paarungen und keine
 * Anfangszeiten, und beides zu erfinden verbietet CLAUDE.md ausdrücklich
 * ("no fabricated fights"). Diese Spalten bleiben NULL bzw. leer, bis sie
 * jemand von Hand mit einer Quelle belegt.
 */
export type SourceEvent = {
  slug: string;
  date: string; // YYYY-MM-DD, Kalendertag am Austragungsort
  sport: string;
  promotion: string;
  title: string;
  /** Was ausgetragen wird — nie eine erfundene Paarung. */
  main: string;
  venue: string;
  broadcaster: string;
  note: string;
  /** Stabile ID der Quelle. Danach wird abgeglichen, nicht nach slug. */
  sourceKey: string;
  /** Belegseite beim Verband selbst. */
  sourceUrl: string;
};

/** Warum ein Eintrag der Quelle nicht übernommen wurde. */
export type Skip = { reason: string; sample: string[]; count: number };

export type SourceResult = {
  id: string;
  label: string;
  events: SourceEvent[];
  skipped: Skip[];
  /** Quelle nicht erreichbar / Format unerwartet. Dann bleibt events leer. */
  error: string | null;
};

export type EventSource = {
  id: string;
  label: string;
  /** Homepage des Verbands, für die Fehlermeldung und die Doku. */
  home: string;
  load: () => Promise<SourceResult>;
};

// ---------------------------------------------------------------------------
// Helfer, die sich alle Quellen teilen
// ---------------------------------------------------------------------------

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

/** "February" / "Feb" / "Sep" -> 1..12, sonst null. */
export function monthNumber(name: string): number | null {
  return MONTHS[name.trim().slice(0, 3).toLowerCase()] ?? null;
}

/**
 * YYYY-MM-DD aus Einzelteilen, oder null wenn das Datum nicht existiert.
 *
 * Prüft bewusst nach, ob der zusammengebaute Tag auch der ist, den man
 * hineingegeben hat: Ein "31. Februar" aus einem kaputten Parse würde sonst
 * still zum 3. März werden und als belegter Termin in der Datenbank landen.
 */
export function isoDate(
  year: number,
  month: number,
  day: number
): string | null {
  if (!Number.isInteger(year) || year < 2000 || year > 2100) return null;
  if (!Number.isInteger(month) || month < 1 || month > 12) return null;
  if (!Number.isInteger(day) || day < 1 || day > 31) return null;
  const d = new Date(Date.UTC(year, month - 1, day));
  if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) {
    return null;
  }
  return d.toISOString().slice(0, 10);
}

/** Heute als YYYY-MM-DD (UTC). */
export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

const ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  rsquo: "’", lsquo: "‘", ldquo: "“", rdquo: "”",
  ndash: "–", mdash: "—", hellip: "…",
};

/** Tags raus, Entities auf, Whitespace zusammen. */
export function textOf(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m)
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * URL-tauglicher Slug. Gleiche Regeln wie fighterSlug/promotionSlug in
 * lib/events.ts, damit die Slugs im Kalender einheitlich aussehen.
 *
 * `maxLength` schneidet an einer Wortgrenze ab — Turniernamen der Verbände
 * sind teils über 70 Zeichen lang und ergäben sonst unbrauchbare URLs.
 */
export function slugify(input: string, maxLength = 60): string {
  const base = input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  if (base.length <= maxLength) return base;
  const cut = base.slice(0, maxLength);
  const lastDash = cut.lastIndexOf("-");
  return (lastDash > maxLength * 0.6 ? cut.slice(0, lastDash) : cut).replace(/-$/, "");
}

/** Sammelt Skip-Gründe ein, inklusive ein paar Beispielen fürs Protokoll. */
export class SkipLog {
  private map = new Map<string, { count: number; sample: string[] }>();

  add(reason: string, sample: string) {
    const entry = this.map.get(reason) ?? { count: 0, sample: [] };
    entry.count++;
    if (entry.sample.length < 3) entry.sample.push(sample);
    this.map.set(reason, entry);
  }

  list(): Skip[] {
    return [...this.map.entries()]
      .map(([reason, v]) => ({ reason, count: v.count, sample: v.sample }))
      .sort((a, b) => b.count - a.count);
  }
}

/** Einheitlicher User-Agent — wie in lib/resultsSource.ts, mit Kontakt. */
export const UA = "Fightbase/1.0 (https://fightbase.io; weinshenrik@gmail.com)";

/** Holt eine Seite als Text. Wirft nie — Fehler werden zum error-Feld. */
export async function fetchText(
  url: string,
  extraHeaders: Record<string, string> = {}
): Promise<{ text: string } | { error: string }> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, ...extraHeaders },
      cache: "no-store",
    });
    if (!res.ok) return { error: `${url} antwortete mit HTTP ${res.status}` };
    return { text: await res.text() };
  } catch (e) {
    return { error: `${url} nicht erreichbar: ${(e as Error).message}` };
  }
}
