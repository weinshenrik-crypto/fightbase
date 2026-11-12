import { buildCalendar } from "./ics";
import { eventMatchesFavorite, type Fav } from "./favorites";
import type { FightEvent } from "./events";

// Die Logik des persoenlichen Feeds, ohne Datenbank — die Route reicht die
// Abfragen hinein, damit scripts/check-ics.ts die Fehlerfaelle pruefen kann.
//
// Wichtigste Regel: Bei einem Datenbankfehler 503, nie ein leerer 200-Feed.
// Kalender ersetzen ein Abo beim Abruf komplett; ein leerer Feed wuerde alle
// Termine des Nutzers loeschen, bis der naechste Abruf klappt — bei Google
// bis zu einem Tag spaeter. Auf 5xx behalten sie ihre letzte gute Fassung.

type Result<T> = { data: T | null; error: unknown };

export async function personalFeed({
  lookupToken,
  loadFavorites,
  events,
  now = new Date(),
}: {
  lookupToken: () => Promise<Result<{ user_id: string }>>;
  loadFavorites: (userId: string) => Promise<Result<Fav[]>>;
  events: FightEvent[];
  now?: Date;
}): Promise<{ status: 200 | 404 | 503; body?: string }> {
  const token = await lookupToken();
  if (token.error) return { status: 503 };
  if (!token.data) return { status: 404 };

  const favs = await loadFavorites(token.data.user_id);
  if (favs.error || !favs.data) return { status: 503 };

  const list = favs.data;
  const matching = events.filter((e) => list.some((f) => eventMatchesFavorite(e, f)));
  return { status: 200, body: buildCalendar(matching, "Fightbase · My favorites", now) };
}
