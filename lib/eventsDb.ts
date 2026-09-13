import type { FightEvent } from "./events";

// Events liegen in Supabase statt im Code, damit neue Termine ohne Deploy
// reingehen. Die Seiten holen sie per ISR nach — eine Stunde ist für einen
// Kampfkalender reichlich frisch und hält die Zahl der Requests klein.
export const EVENTS_REVALIDATE = 3600;

// Die Einzelabfrage nach einem Slug wird kürzer gecacht als die Liste: Sie
// existiert nur, um ein gerade eingetragenes Event sofort erreichbar zu machen,
// und soll ein "gibt es nicht" nicht lange festhalten. 60 Sekunden entspricht
// dem `revalidate` der Detailseite selbst.
export const EVENT_LOOKUP_REVALIDATE = 60;

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
  starts_at: string | null;
  timezone: string | null;
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
    ...(row.starts_at ? { startsAt: row.starts_at } : {}),
    ...(row.timezone ? { timezone: row.timezone } : {}),
    venue: row.venue,
    broadcaster: row.broadcaster,
    note: row.note,
    ...(row.undercard && row.undercard.length > 0
      ? { undercard: row.undercard }
      : {}),
  };
}

function restConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY fehlen — Events können nicht geladen werden."
    );
  }
  return { url, headers: { apikey: key, Authorization: `Bearer ${key}` } };
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
  const { url, headers } = restConfig();

  const res = await fetch(
    `${url}/rest/v1/events?select=*&order=date.asc`,
    {
      headers,
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

/**
 * Ein einzelnes Event per Slug, direkt aus der Datenbank.
 *
 * Nur für den Fall gedacht, dass ein Slug in der gecachten Liste fehlt: Ein
 * gerade eingetragenes Event beantwortet `/events/<slug>` sonst bis zur
 * nächsten Revalidierung mit 404, obwohl die Zeile längst in der Datenbank
 * steht — der Slug fehlt dann sowohl in `generateStaticParams` als auch in der
 * gecachten Liste, und die Seite ruft `notFound()` auf.
 *
 * Holt bewusst nur die eine Zeile statt der ganzen Liste: Wer zufällige Slugs
 * durchprobiert, löst damit keine teuren Vollabfragen aus, sondern nur je
 * einen Treffer ins Leere über den eindeutigen Index auf `slug`.
 *
 * **Hier darf kein `cache: "no-store"` stehen.** Die Detailseite ist über
 * `export const revalidate = 60` statisch. Ein ungecachter Fetch macht sie beim
 * On-demand-Rendern zur Laufzeit dynamisch, und Next bricht das mit
 * "Page changed from static to dynamic at runtime" ab — jeder unbekannte Slug
 * antwortet dann mit 500 statt mit 404. Der kurze ISR-Cache erfüllt denselben
 * Zweck, ohne die Seite aus der statischen Generierung zu kippen.
 *
 * Der Tag `events` hängt die Abfrage an `/api/revalidate` mit an, damit eine
 * manuelle Revalidierung auch diese Einträge verwirft.
 *
 * Wirft nicht. Der Aufrufer ist bereits im Fehlerfall und soll dann 404
 * ausliefern statt die Seite mit einem Serverfehler abzubrechen.
 */
export async function getEventBySlug(slug: string): Promise<FightEvent | null> {
  try {
    const { url, headers } = restConfig();
    const res = await fetch(
      `${url}/rest/v1/events?select=*&slug=eq.${encodeURIComponent(slug)}&limit=1`,
      {
        headers,
        next: { revalidate: EVENT_LOOKUP_REVALIDATE, tags: ["events"] },
      }
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as EventRow[];
    return rows.length > 0 ? toFightEvent(rows[0]) : null;
  } catch {
    return null;
  }
}
