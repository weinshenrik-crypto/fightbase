import { buildCalendar } from "@/lib/ics";
import { icsResponse, notFoundIcs, stripIcs } from "@/lib/icsResponse";
import { sportBySlug } from "@/lib/events";
import { getEvents } from "@/lib/eventsDb";

// Oeffentliches Abo je Sportart: GET /api/calendar/sport/<slug>.ics
// Dieselben Slugs wie die Landingpages unter /sport/.
export const revalidate = 3600;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sport: string }> }
) {
  const slug = stripIcs((await params).sport);
  const sport = slug ? sportBySlug(slug) : null;
  if (!sport) return notFoundIcs();

  const events = (await getEvents()).filter((e) => e.sport === sport);
  return icsResponse(buildCalendar(events, `Fightbase · ${sport}`));
}
