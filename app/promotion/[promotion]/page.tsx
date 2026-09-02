import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  EVENTS,
  PROMOTION_LINKS,
  promotionSlug,
  promotionBySlug,
  promotionsWithPage,
  formatDate,
  daysUntil,
} from "@/lib/events";

export function generateStaticParams() {
  return promotionsWithPage().map((p) => ({ promotion: promotionSlug(p) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ promotion: string }>;
}): Promise<Metadata> {
  const { promotion: slug } = await params;
  const promotion = promotionBySlug(slug);
  if (!promotion || !promotionsWithPage().includes(promotion)) return {};
  const title = `${promotion} Schedule — Upcoming Events | Fightbase`;
  const description = `Every upcoming ${promotion} event tracked on Fightbase — dates, fight cards and where to watch.`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function PromotionPage({
  params,
}: {
  params: Promise<{ promotion: string }>;
}) {
  const { promotion: slug } = await params;
  const promotion = promotionBySlug(slug);
  if (!promotion || !promotionsWithPage().includes(promotion)) notFound();

  const events = EVENTS.filter((e) => e.promotion === promotion).sort(
    (a, b) => (a.date > b.date ? 1 : -1)
  );
  const officialUrl = PROMOTION_LINKS[promotion];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${promotion} Schedule`,
    description: `Every upcoming ${promotion} event tracked on Fightbase.`,
    url: `https://fightbase.io/promotion/${promotionSlug(promotion)}`,
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
        {promotion} Schedule
      </h1>
      <p className="text-[14px] text-muted leading-relaxed mb-2">
        Every upcoming {promotion} event tracked on Fightbase — dates, fight
        cards and where to watch.
      </p>
      {officialUrl && (
        <a
          href={officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[13px] text-accent inline-block mb-8"
        >
          {promotion} official site ↗
        </a>
      )}

      <div className="flex flex-col gap-3">
        {events.length === 0 && (
          <p className="text-[13px] text-dim">
            No upcoming {promotion} events listed right now — check back
            soon.
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
                  {e.title} · in {daysUntil(e.date)} days
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      <Link href="/" className="text-[13px] text-accent block mt-8">
        See all combat sports events →
      </Link>
    </div>
  );
}
