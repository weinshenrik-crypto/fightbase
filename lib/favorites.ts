import type { FightEvent } from "./events";

// Welche Events zu einem Favoriten passen. Eine Stelle fuer E-Mail-Erinnerungen
// (api/cron/notify) und den persoenlichen Kalender-Feed (api/calendar/u), damit
// Mail und Kalender nie verschieden entscheiden.

export type Fav = { type: string; value: string };

export function eventMatchesFavorite(e: FightEvent, fav: Fav): boolean {
  if (fav.type === "sport") return e.sport === fav.value;
  if (fav.type === "promotion") return e.promotion === fav.value;
  if (fav.type === "event") return e.id === fav.value;
  if (fav.type === "fighter") return !!e.fighters?.includes(fav.value);
  return false;
}
