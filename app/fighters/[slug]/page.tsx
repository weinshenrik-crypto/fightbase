import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { supabase } from "@/lib/supabaseClient";
import {
  allFighterNames,
  fighterBySlug,
  fighterSlug,
  upcomingFightsFor,
  formatDate,
  daysUntil,
} from "@/lib/events";
import FighterIllustration from "@/components/FighterIllustration";

export function generateStaticParams() {
  return allFighterNames().map((name) => ({
    slug: fighterSlug(name),
  }));
}

async function getFighter(name: string) {
  const { data } = await supabase
    .from("fighters")
    .select("*")
    .eq("name", name)
    .maybeSingle();
  return data;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const name = fighterBySlug(params.slug);
  if (!name) return {};
  const fighter = await getFighter(name);
  const title = `${name}${fighter?.nickname ? ` "${fighter.nickname}"` : ""} — Fightbase`;
  const description =
    fighter?.bio ??
    `Upcoming fights, results and profile for ${name} on Fightbase.`;
  return {
    title,
    description,
    openGraph: { title, description, type: "profile" },
    twitter: { card: "summary", title, description },
  };
}

export default async function FighterPage({
  params,
}: {
  params: { slug: string };
}) {
  const name = fighterBySlug(params.slug);
  if (!name) notFound();

  const fighter = await getFighter(name);
  const upcoming = upcomingFightsFor(name);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    ...(fighter?.nickname ? { alternateName: fighter.nickname } : {}),
    ...(fighter?.sport ? { jobTitle: `${fighter.sport} athlete` } : {}),
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

      <div className="flex items-center gap-4 mt-6 mb-2">
        <FighterIllustration name={name} size={64} />
        <div>
          <h1 className="font-display font-bold text-[24px] text-text">
            {name}
          </h1>
          {fighter?.nickname && (
            <p className="text-[13px] text-accent">
              &quot;{fighter.nickname}&quot;
            </p>
          )}
        </div>
      </div>

      {(fighter?.sport || fighter?.record) && (
        <p className="text-[13px] text-faint mb-5">
          {[fighter?.sport, fighter?.record].filter(Boolean).join(" · ")}
        </p>
      )}

      {fighter?.bio ? (
        <p className="text-[14px] text-muted leading-relaxed mb-6 whitespace-pre-wrap">
          {fighter.bio}
        </p>
      ) : (
        <p className="text-[14px] text-dim mb-6">
          No profile written for {name} yet.
        </p>
      )}

      {fighter?.career && (
        <>
          <h2 className="text-[13px] font-semibold text-text mb-1.5">
            Career
          </h2>
          <p className="text-[14px] text-muted leading-relaxed mb-8 whitespace-pre-wrap">
            {fighter.career}
          </p>
        </>
      )}

      <h2 className="text-[13px] font-semibold text-text mb-3">
        Upcoming fights
      </h2>
      {upcoming.length === 0 && (
        <p className="text-[13px] text-dim mb-6">No upcoming fights listed.</p>
      )}
      <div className="flex flex-col gap-3 mb-8">
        {upcoming.map((e) => {
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

      <Link href="/" className="text-[13px] text-accent">
        See all upcoming combat sports events →
      </Link>
    </div>
  );
}
