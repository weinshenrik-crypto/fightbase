import { getEvents } from "@/lib/eventsDb";
import { eventsBetween, weekendRange } from "@/lib/socialPosts";
import { weekendCard } from "@/lib/socialCard";

// Das kommende Wochenende (Fr–So) als ein Bild fuer Feed und Karussell
// (1080 x 1350).
//
//   /api/social/weekend                  englisch, ab heute gerechnet
//   /api/social/weekend?lang=de
//   /api/social/weekend?date=2026-11-27  das Wochenende um diesen Tag

export const revalidate = 3600;

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const lang = q.get("lang") === "de" ? "de" : "en";
  const date = q.get("date");
  const today = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : new Date().toISOString().slice(0, 10);
  const range = weekendRange(today);
  const events = eventsBetween(await getEvents(), range.from, range.to);

  const res = await weekendCard(events, range, lang);
  res.headers.set(
    "Content-Disposition",
    `inline; filename="fightbase-weekend-${range.from}${lang === "de" ? "-de" : ""}.png"`
  );
  return res;
}
