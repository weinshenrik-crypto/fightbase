import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { supabase } from "@/lib/supabaseClient";
import {
  formatDate,
  daysUntil,
  watchLinks,
  fighterSlug,
  PROMOTION_LINKS,
  venueLocality,
} from "@/lib/events";
import { getEvents } from "@/lib/eventsDb";
import FighterIllustration from "@/components/FighterIllustration";

// Fighter photos can be added/changed any time, so revalidate frequently
// instead of freezing the page at build time.
export const revalidate = 60;


export async function generateStaticParams() {
  const events = await getEvents();
  return events.map((e) => ({ id: e.id }));
}

export async function generateMetadata(
  props: {
    params: Promise<{ id: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const event = (await getEvents()).find((e) => e.id === params.id);
  if (!event) return {};
  const title = `${event.main} — ${event.title} | Fightbase`;
  const description = `${event.title} (${event.promotion}) on ${event.date} at ${event.venue}. ${event.note}`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function EventPage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = await props.params;
  const event = (await getEvents()).find((e) => e.id === params.id);
  if (!event) notFound();

  const photos: Record<
    string,
    { photo_url: string | null; photo_credit: string | null }
  > = {};
  if (event.fighters) {
    const { data } = await supabase
      .from("fighters")
      .select("name, photo_url, photo_credit")
      .in("name", event.fighters);
    for (const f of data ?? []) {
      photos[f.name] = { photo_url: f.photo_url, photo_credit: f.photo_credit };
    }
  }

  const { weekday, day, month } = formatDate(event.date);
  const dLeft = daysUntil(event.date);
  const links = watchLinks(event.broadcaster);

  const locality = venueLocality(event.venue);
  const organizerUrl = PROMOTION_LINKS[event.promotion];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: event.main,
    startDate: event.date,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    image: ["https://fightbase.io/og-image.png"],
    location: {
      "@type": "Place",
      name: event.venue,
      ...(locality
        ? { address: { "@type": "PostalAddress", addressLocality: locality } }
        : {}),
    },
    organizer: {
      "@type": "Organization",
      name: event.promotion,
      ...(organizerUrl ? { url: organizerUrl } : {}),
    },
    description: event.note,
    ...(event.fighters
      ? {
          competitor: event.fighters.map((name) => ({
            "@type": "Person",
            name,
          })),
        }
      : {}),
  };

  return (
    <div className="max-w-[480px] md:max-w-2xl mx-auto min-h-screen px-5 py-10 font-body text-text">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link href="/" className="text-[13px] text-accent">
        ← Back to Fightbase
      </Link>

      <div className="mt-6 mb-1 flex items-center gap-3 text-[13px] text-dim">
        <span className="text-accent font-semibold uppercase tracking-wide">
          {event.sport}
        </span>
        <span>
          {weekday} {day} {month}
        </span>
        <span>
          {dLeft === 0 ? "today" : dLeft > 0 ? `in ${dLeft} days` : "past"}
        </span>
      </div>

      {event.fighters && (
        <div className="flex items-center justify-center gap-6 my-6">
          <Link
            href={`/fighters/${fighterSlug(event.fighters[0])}`}
            className="flex flex-col items-center gap-2"
          >
            <FighterIllustration
              name={event.fighters[0]}
              size={72}
              photoUrl={photos[event.fighters[0]]?.photo_url}
            />
            <span className="text-[14px] text-text font-medium">
              {event.fighters[0]}
            </span>
          </Link>
          <span className="text-[13px] text-dim font-semibold">VS</span>
          <Link
            href={`/fighters/${fighterSlug(event.fighters[1])}`}
            className="flex flex-col items-center gap-2"
          >
            <FighterIllustration
              name={event.fighters[1]}
              size={72}
              photoUrl={photos[event.fighters[1]]?.photo_url}
            />
            <span className="text-[14px] text-text font-medium">
              {event.fighters[1]}
            </span>
          </Link>
        </div>
      )}
      {event.fighters &&
        (photos[event.fighters[0]]?.photo_credit ||
          photos[event.fighters[1]]?.photo_credit) && (
          <p className="text-[10px] text-dim text-center mb-4">
            {[event.fighters[0], event.fighters[1]]
              .map((n) => photos[n]?.photo_credit)
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}

      <h1 className="font-display font-bold text-[26px] text-text mb-1">
        {event.main}
      </h1>
      <p className="text-[15px] text-muted mb-1">
        {event.title} · {event.promotion}
      </p>
      <p className="text-[13px] text-faint mb-5">
        {event.venue}
        {event.broadcaster !== "-" ? ` · ${event.broadcaster}` : ""}
      </p>

      {event.note && (
        <p className="text-[14px] text-muted leading-relaxed mb-5">
          {event.note}
        </p>
      )}

      {event.undercard && event.undercard.length > 0 && (
        <div className="mb-5">
          <h2 className="text-[13px] font-semibold text-text mb-1.5">
            Fight card
          </h2>
          {event.undercard.map((fight, i) => (
            <p key={i} className="text-[13px] text-muted">
              Pre Card {i + 1}: {fight}
            </p>
          ))}
        </div>
      )}

      {links.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {links.map((l) =>
            l.url ? (
              <a
                key={l.label}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] font-medium px-3.5 py-2 rounded-md bg-accent text-white"
              >
                Watch on {l.label} ↗
              </a>
            ) : (
              <span
                key={l.label}
                className="text-[13px] px-3.5 py-2 rounded-md border border-[#2E2E30] text-faint"
              >
                {l.label}
              </span>
            )
          )}
        </div>
      )}

      <Link href="/" className="text-[13px] text-accent">
        See all upcoming combat sports events →
      </Link>
    </div>
  );
}
