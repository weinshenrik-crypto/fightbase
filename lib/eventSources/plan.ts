// Aus Quell-Events und dem aktuellen Datenbankstand einen Schreibplan bauen.
//
// Getrennt vom Cron-Job, damit der Trockenlauf (scripts/import-dry-run.ts)
// exakt dieselbe Entscheidung trifft wie der echte Lauf — ein Trockenlauf, der
// eine andere Logik durchrechnet als der Ernstfall, ist wertlos.
//
// Abgeglichen wird über (source, source_key), **nicht** über den Slug. Grund:
// Der Slug wird aus dem Turniernamen gebaut. Benennt ein Verband sein Turnier
// um ("… Open 2026" -> "… International Open 2026"), änderte sich der Slug und
// derselbe Termin landete ein zweites Mal in der Tabelle. Über die stabile ID
// der Quelle bleibt es dieselbe Zeile — und ihre URL bleibt erhalten, was für
// eine schon indexierte Seite wichtiger ist als ein hübscherer Slug.
//
// Zeilen ohne `source` fasst der Importer nie an. Das sind die von Hand
// gepflegten Events, inklusive aller Korrekturen, die jemand an ihnen
// vorgenommen hat.

import type { SourceEvent } from "./types";

/** Die Spalten, die der Importer schreibt. */
export type ImportRow = {
  slug: string;
  date: string;
  sport: string;
  promotion: string;
  title: string;
  main: string;
  venue: string;
  broadcaster: string;
  note: string;
  source: string;
  source_key: string;
  source_url: string;
  /** Nur gesetzt, wenn die Quelle selbst eine Anfangszeit nennt (ONE). */
  starts_at?: string;
  timezone?: string;
};

/** Was schon in der Tabelle steht, soweit der Abgleich es braucht. */
export type ExistingRow = {
  slug: string;
  date: string;
  sport: string;
  promotion: string;
  title: string;
  main: string;
  venue: string;
  broadcaster: string;
  note: string;
  source: string | null;
  source_key: string | null;
  source_url: string | null;
  starts_at?: string | null;
  timezone?: string | null;
};

export type PlannedInsert = { kind: "insert"; row: ImportRow };
export type PlannedUpdate = {
  kind: "update";
  row: ImportRow;
  changes: { field: string; from: string; to: string }[];
};
export type PlannedNote = { kind: "note"; title: string; reason: string };
export type Plan = {
  inserts: PlannedInsert[];
  updates: PlannedUpdate[];
  notes: PlannedNote[];
  unchanged: number;
};

// Felder, die der Importer pflegt. `date` steht bewusst dabei: Verlegungen sind
// bei diesen Turnieren der häufigste Grund für einen zweiten Lauf.
const MANAGED = [
  "date",
  "sport",
  "promotion",
  "title",
  "main",
  "venue",
  "broadcaster",
  "note",
  "source_url",
] as const;

function toRow(e: SourceEvent, source: string): ImportRow {
  return {
    slug: e.slug,
    date: e.date,
    sport: e.sport,
    promotion: e.promotion,
    title: e.title,
    main: e.main,
    venue: e.venue,
    broadcaster: e.broadcaster,
    note: e.note,
    source,
    source_key: e.sourceKey,
    source_url: e.sourceUrl,
    ...(e.startsAt ? { starts_at: e.startsAt } : {}),
    ...(e.timezone ? { timezone: e.timezone } : {}),
  };
}

// Wörter, die in diesen Kalendern in fast jedem Turniernamen vorkommen und
// deshalb nichts unterscheiden. Übrig bleiben Orts- und Regionsnamen — genau
// das, woran zwei Einträge derselben Veranstaltung sich erkennen lassen.
const GENERIC = new Set([
  "ibjjf", "ijf", "wkf", "uww", "adcc",
  "jiu", "jitsu", "judo", "karate", "wrestling", "grappling",
  "championship", "championships", "tournament", "international", "open",
  "world", "senior", "elite", "adult", "cup", "series", "league",
  "grand", "slam", "prix", "premier", "masters", "master", "pro", "bjj",
  "kata", "kumite", "individuals", "teams", "mixed", "games", "national",
  "nationals", "gi", "nogi", "no", "one", "the", "and", "de", "da", "do",
  "fall", "spring", "summer", "winter", "autumn",
]);

/** Unterscheidende Wörter eines Namens — Zahlen und Allerweltswörter raus. */
function distinctive(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length >= 3 && !/^\d+$/.test(w) && !GENERIC.has(w))
  );
}

function overlaps(a: Set<string>, b: Set<string>): boolean {
  for (const w of a) if (b.has(w)) return true;
  return false;
}

/**
 * Steht dieselbe Veranstaltung schon von Hand in der Tabelle?
 *
 * Der Anlass ist konkret: Im Kalender liegen kuratierte Zeilen wie
 * "uww-worlds-2026" (World Wrestling Championships, 24.10.2026, Astana) oder
 * "karate1-salzburg" (02.10.2026, Salzburg). Genau diese Termine stehen auch in
 * den Verbandskalendern, dort nur unter anderem Namen ("Senior World
 * Championships", "2026 Karate One Series A Salzburg"). Über (source,
 * source_key) fällt das nicht auf — die Handzeile hat beides nicht —, und der
 * Importer legte den Termin ein zweites Mal an.
 *
 * Sportart und Datum allein reichen als Erkennung **nicht**: Die IBJJF trägt an
 * einem Wochenende regelmäßig mehrere Turniere in verschiedenen Städten aus.
 * Ein reiner Datumsvergleich hat im Trockenlauf das Open in Manaus verworfen,
 * weil am selben Tag Kuala Lumpur im Kalender stand.
 *
 * Deshalb zusätzlich ein Namens- oder Ortsbezug: gleicher Tag, gleiche
 * Sportart, und mindestens ein unterscheidendes Wort gemeinsam — praktisch
 * immer der Austragungsort. Bleibt nach dem Aussortieren der Allerweltswörter
 * auf beiden Seiten nichts übrig (UWW nennt seine WM schlicht "Senior World
 * Championships"), zählt der Tag allein: dann lieber nichts anlegen und melden.
 *
 * Verglichen wird nur gegen handgepflegte Zeilen (source IS NULL). Importierte
 * Zeilen findet der Abgleich exakt über (source, source_key).
 */
function manualTwin(event: SourceEvent, existing: ExistingRow[]): ExistingRow | null {
  const sameDay = existing.filter(
    (r) => !r.source && r.sport === event.sport && r.date === event.date
  );
  if (sameDay.length === 0) return null;

  const mine = distinctive(`${event.title} ${event.venue}`);
  for (const row of sameDay) {
    const theirs = distinctive(`${row.title} ${row.main} ${row.venue}`);
    if (mine.size === 0 || theirs.size === 0) return row;
    if (overlaps(mine, theirs)) return row;
  }
  return null;
}

/**
 * Freien Slug finden. Der Basis-Slug kann schon von einem anderen Event belegt
 * sein (zwei Verbände mit ähnlichem Turniernamen, oder ein von Hand
 * eingetragenes Event) — dann wird das Jahr angehängt, danach durchnummeriert.
 * Gibt null zurück, wenn auch das nicht reicht.
 */
function freeSlug(base: string, date: string, taken: Set<string>): string | null {
  if (!taken.has(base)) return base;
  const withYear = `${base}-${date.slice(0, 4)}`;
  if (!taken.has(withYear)) return withYear;
  for (let i = 2; i <= 9; i++) {
    const numbered = `${withYear}-${i}`;
    if (!taken.has(numbered)) return numbered;
  }
  return null;
}

export function buildPlan(
  source: string,
  events: SourceEvent[],
  existing: ExistingRow[]
): Plan {
  const byKey = new Map<string, ExistingRow>();
  const slugOwner = new Map<string, ExistingRow>();
  for (const row of existing) {
    if (row.source && row.source_key) {
      byKey.set(`${row.source} ${row.source_key}`, row);
    }
    slugOwner.set(row.slug, row);
  }

  const plan: Plan = { inserts: [], updates: [], notes: [], unchanged: 0 };
  const claimed = new Set<string>();
  const seenKeys = new Set<string>();

  for (const event of events) {
    const key = `${source} ${event.sourceKey}`;

    // Dieselbe ID zweimal in einem Lauf — die Quelle widerspricht sich.
    if (seenKeys.has(key)) {
      plan.notes.push({
        kind: "note",
        title: event.title,
        reason: `übersprungen: doppelte Quell-ID ${event.sourceKey} im selben Abruf`,
      });
      continue;
    }
    seenKeys.add(key);

    const row = toRow(event, source);
    const match = byKey.get(key);

    if (match) {
      // Slug bleibt, wie er ist — die Seite ist womöglich schon indexiert.
      row.slug = match.slug;
      const before = match as unknown as Record<string, unknown>;
      const after = row as unknown as Record<string, unknown>;
      // Der Typ steht hier ausdrücklich, weil unten zwei Felder dazukommen,
      // die nicht in MANAGED stehen — sonst erbte `changes` deren engen
      // Union-Typ und ließe sie nicht zu.
      const changes: { field: string; from: string; to: string }[] = MANAGED.map(
        (field) => ({
          field: field as string,
          from: String(before[field] ?? ""),
          to: String(after[field] ?? ""),
        })
      ).filter((c) => c.from !== c.to);

      // Anfangszeit gesondert, und nur wenn die Quelle sie wirklich mitbringt.
      //
      // starts_at gehoert bewusst NICHT in MANAGED: Die vier Verbandskalender
      // liefern keine Zeiten. Stuende das Feld in der Liste, wuerde jeder Lauf
      // bei deren Zeilen "" gegen eine von Hand eingetragene Uhrzeit
      // vergleichen und sie ueberschreiben — genau der Schaden, den die Regel
      // "Handzeilen sind tabu" verhindern soll. So bleibt eine fremde Zeit
      // unangetastet, waehrend eine Verlegung bei ONE trotzdem ankommt.
      for (const field of ["starts_at", "timezone"] as const) {
        if (after[field] == null) continue;
        const from = String(before[field] ?? "");
        const to = String(after[field]);
        if (from !== to) changes.push({ field, from, to });
      }

      if (changes.length === 0) plan.unchanged++;
      else plan.updates.push({ kind: "update", row, changes });
      continue;
    }

    // Steht der Termin schon von Hand drin? Dann nichts anlegen, nur melden.
    const twin = manualTwin(event, existing);
    if (twin) {
      plan.notes.push({
        kind: "note",
        title: event.title,
        reason:
          `uebersprungen: "${twin.slug}" (${twin.title}) steht am selben Tag ` +
          `in derselben Sportart und wurde von Hand gepflegt`,
      });
      continue;
    }

    // Neu. Kollidiert der Slug mit einer fremden Zeile, weichen wir aus —
    // aber niemals auf Kosten eines bestehenden Events.
    const taken = new Set([...slugOwner.keys(), ...claimed]);
    const slug = freeSlug(event.slug, event.date, taken);
    if (!slug) {
      plan.notes.push({
        kind: "note",
        title: event.title,
        reason: `übersprungen: kein freier Slug für "${event.slug}"`,
      });
      continue;
    }
    if (slug !== event.slug) {
      const owner = slugOwner.get(event.slug);
      plan.notes.push({
        kind: "note",
        title: event.title,
        reason:
          `Slug "${event.slug}" ist belegt` +
          (owner?.source ? ` (von ${owner.source})` : " (von Hand gepflegt)") +
          `, angelegt als "${slug}"`,
      });
    }
    row.slug = slug;
    claimed.add(slug);
    plan.inserts.push({ kind: "insert", row });
  }

  return plan;
}
