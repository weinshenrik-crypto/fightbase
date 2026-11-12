import { buildCalendar } from "@/lib/ics";
import { icsResponse, notFoundIcs, stripIcs } from "@/lib/icsResponse";
import { eventHeadline } from "@/lib/events";
import { getEvents, getEventBySlug } from "@/lib/eventsDb";

// Ein einzelnes Event als Kalenderdatei: GET /api/calendar/event/<slug>.ics
//
// Wie die Detailseite: erst die gecachte Liste, dann die Einzelabfrage, damit
// ein gerade eingetragenes Event sofort eintragbar ist.
export const revalidate = 3600;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const slug = stripIcs((await params).id);
  if (!slug) return notFoundIcs();

  const events = await getEvents();
  const event = events.find((e) => e.id === slug) ?? (await getEventBySlug(slug));
  if (!event) return notFoundIcs();

  // Einzeltermin: kein 7-Tage-Fenster — wer ein altes Event eintragen will,
  // soll es bekommen.
  const body = buildCalendar(
    [event],
    `Fightbase · ${eventHeadline(event).headline}`,
    new Date(),
    { allDates: true }
  );
  return icsResponse(body, { filename: `${event.id}.ics` });
}
