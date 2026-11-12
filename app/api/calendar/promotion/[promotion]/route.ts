import { buildCalendar } from "@/lib/ics";
import { icsResponse, notFoundIcs, stripIcs } from "@/lib/icsResponse";
import { promotionBySlug, promotionsWithPage } from "@/lib/events";
import { getEvents } from "@/lib/eventsDb";

// Oeffentliches Abo je Promotion: GET /api/calendar/promotion/<slug>.ics
//
// Nur fuer Promotions mit eigener Landingpage, nach derselben Regel wie
// app/promotion/[promotion]/page.tsx — sonst gaebe es Abos fuer Namen, zu
// denen die Seite 404 sagt.
export const revalidate = 3600;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ promotion: string }> }
) {
  const slug = stripIcs((await params).promotion);
  if (!slug) return notFoundIcs();

  const all = await getEvents();
  const promotion = promotionBySlug(all, slug);
  if (!promotion || !promotionsWithPage(all).includes(promotion)) return notFoundIcs();

  const events = all.filter((e) => e.promotion === promotion);
  return icsResponse(buildCalendar(events, `Fightbase · ${promotion}`));
}
