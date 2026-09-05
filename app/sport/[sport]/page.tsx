import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  SPORTS,
  SPORT_DESCRIPTIONS,
  sportSlug,
  sportBySlug,
  formatDate,
  daysUntil,
} from "@/lib/events";
import { getEvents } from "@/lib/eventsDb";

// Muss ein Literal sein — Next.js liest diesen Wert statisch aus und
// erkennt keine importierten Bezeichner. Entspricht EVENTS_REVALIDATE.
export const revalidate = 3600;

export function generateStaticParams() {
  return SPORTS.filter((s) => s !== "All").map((s) => ({
    sport: sportSlug(s),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sport: string }>;
}): Promise<Metadata> {
  const { sport: slug } = await params;
  const sport = sportBySlug(slug);
  if (!sport) return {};
  const title = `${sport} Events Calendar — Upcoming ${sport} Fights | Fightbase`;
  const description =
    SPORT_DESCRIPTIONS[sport] ?? `Upcoming ${sport} events, tracked on Fightbase.`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function SportPage({
  params,
}: {
  params: Promise<{ sport: string }>;
}) {
  const { sport: slug } = await params;
  const sport = sportBySlug(slug);
  if (!sport) notFound();

  const events = (await getEvents())
    .filter((e) => e.sport === sport)
    .sort((a, b) => (a.date > b.date ? 1 : -1));
  const description = SPORT_DESCRIPTIONS[sport];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${sport} Events Calendar`,
    description,
    url: `https://fightbase.io/sport/${sportSlug(sport)}`,
    ...(events.length > 0
      ? {
          mainEntity: {
            "@type": "ItemList",
            itemListElement: events.map((e, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `https://fightbase.io/events/${e.id}`,
            })),
          },
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

      <h1 className="font-display font-bold text-[26px] text-text mt-6 mb-2">
        {sport} Events Calendar
      </h1>
      {description && (
        <p className="text-[14px] text-muted leading-relaxed mb-8">
          {description}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {events.length === 0 && (
          <p className="text-[13px] text-dim">
            No upcoming {sport} events listed right now — check back soon.
          </p>
        )}
        {events.map((e) => {
          const { weekday, day, month } = formatDate(e.date);
          return (
            <Link
              key={e.id}
              href={`/events/${e.id}`}
              className="flex gap-3 border border-border bg-panel rounded-[10px] p-3.5 hover:border-accent transition-colors"
            >
              <div className="w-11 shrink-0 text-center">
                <div className="text-[10px] text-dim uppercase">
                  {weekday}
                </div>
                <div className="font-display font-semibold text-[20px] leading-none text-text">
                  {day}
                </div>
                <div className="text-[10px] text-dim">{month}</div>
              </div>
              <div>
                <p className="text-[14px] font-semibold text-text">
                  {e.main}
                </p>
                <p className="text-[12px] text-faint">
                  {e.title} · {e.promotion} · in {daysUntil(e.date)} days
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      <Link href="/" className="text-[13px] text-accent block mt-8 mb-6">
        See all combat sports events →
      </Link>

      <div className="border-t border-border pt-5">
        <p className="text-[11px] font-semibold text-dim uppercase tracking-wide mb-2">
          Other sports
        </p>
        <div className="flex gap-2 flex-wrap">
          {SPORTS.filter((s) => s !== "All" && s !== sport).map((s) => (
            <Link
              key={s}
              href={`/sport/${sportSlug(s)}`}
              className="text-[12px] px-2.5 py-1 rounded-md border border-[#2E2E30] text-faint hover:border-accent hover:text-text transition-colors"
            >
              {s}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
