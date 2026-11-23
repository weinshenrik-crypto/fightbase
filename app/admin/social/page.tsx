import type { Metadata } from "next";
import { getEvents } from "@/lib/eventsDb";
import { eventHeadline } from "@/lib/events";
import {
  addDays,
  eventCaption,
  eventsBetween,
  isHighlight,
  todayIso,
  weekendCaption,
  weekendRange,
} from "@/lib/socialPosts";
import AdminSocialClient, { type SocialPost } from "./AdminSocialClient";

// Alles fuer Instagram und TikTok an einer Stelle: das Wochenend-Bild und die
// Einzelbilder der Kaempfe mit Paarung, jeweils mit fertiger Bildunterschrift.
// Bilder herunterladen, Text kopieren, posten.
//
// Die Seite zeigt nur, was ohnehin oeffentlich ist — sie braucht deshalb keine
// Rechte, wird aber nicht indexiert.

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Social posts | Fightbase",
  robots: { index: false, follow: false },
};

const HORIZON_DAYS = 14;

export default async function AdminSocialPage() {
  const today = todayIso();
  const until = addDays(today, HORIZON_DAYS);
  const events = await getEvents();

  const range = weekendRange(today);
  const weekendEvents = eventsBetween(events, range.from, range.to);

  const post = (e: (typeof events)[number]): SocialPost => ({
    slug: e.id,
    date: e.date,
    title: eventHeadline(e).headline,
    promotion: e.promotion,
    sport: e.sport,
    captions: { en: eventCaption(e, "en"), de: eventCaption(e, "de") },
  });

  const upcoming = eventsBetween(events, today, until);

  return (
    <AdminSocialClient
      weekend={{
        from: range.from,
        to: range.to,
        count: weekendEvents.length,
        captions: { en: weekendCaption(weekendEvents, "en"), de: weekendCaption(weekendEvents, "de") },
      }}
      highlights={upcoming.filter(isHighlight).map(post)}
      others={upcoming.filter((e) => !isHighlight(e)).map(post)}
      horizonDays={HORIZON_DAYS}
    />
  );
}
