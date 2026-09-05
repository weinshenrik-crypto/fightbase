import type { FightEvent } from "./events";

// Events liegen in Supabase statt im Code, damit neue Termine ohne Deploy
// reingehen. Die Seiten holen sie per ISR nach — eine Stunde ist für einen
// Kampfkalender reichlich frisch und hält die Zahl der Requests klein.
export const EVENTS_REVALIDATE = 3600;

type EventRow = {
  slug: string;
  date: string;
  sport: string;
  promotion: string;
  title: string;
  main: string;
  fighter_a: string | null;
  fighter_b: string | null;
  venue: string;
  broadcaster: string;
  note: string;
  undercard: string[] | null;
};

// Zurück in die FightEvent-Form, damit der gesamte bestehende Code
// (Slugs, Filter, JSON-LD, Benachrichtigungen) unverändert weiterläuft.
function toFightEvent(row: EventRow): FightEvent {
  return {
    id: row.slug,
    date: row.date,
    sport: row.sport,
    promotion: row.promotion,
    title: row.title,
    main: row.main,
    ...(row.fighter_a && row.fighter_b
      ? { fighters: [row.fighter_a, row.fighter_b] as [string, string] }
      : {}),
    venue: row.venue,
    broadcaster: row.broadcaster,
    note: row.note,
    ...(row.undercard && row.undercard.length > 0
      ? { undercard: row.undercard }
      : {}),
  };
}

/**
 * Alle Events, nach Datum aufsteigend. Vergangene sind enthalten — das Filtern
 * übernehmen die Aufrufer, genau wie vorher beim hartkodierten Array.
 *
 * `fresh` umgeht den ISR-Cache. Der Cron-Job braucht das: Er verschickt
 * "neues Event"-Mails und dürfte ein gerade eingetragenes Event sonst bis zu
 * eine Stunde lang nicht sehen.
 */
export async function getEvents(
  { fresh = false }: { fresh?: boolean } = {}
): Promise<FightEvent[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY fehlen — Events können nicht geladen werden."
    );
  }

  const res = await fetch(
    `${url}/rest/v1/events?select=*&order=date.asc`,
    {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      ...(fresh
        ? { cache: "no-store" as const }
        : { next: { revalidate: EVENTS_REVALIDATE, tags: ["events"] } }),
    }
  );

  if (!res.ok) {
    throw new Error(
      `Events konnten nicht geladen werden (${res.status}): ${await res.text()}`
    );
  }

  const rows = (await res.json()) as EventRow[];
  return rows.map(toFightEvent);
}
