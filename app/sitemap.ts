import { MetadataRoute } from "next";
import {
  SPORTS,
  allFighterNames,
  fighterSlug,
  sportSlug,
  promotionSlug,
  promotionsWithPage,
} from "@/lib/events";
import { getEvents } from "@/lib/eventsDb";
import { supabase } from "@/lib/supabaseClient";

// Muss ein Literal sein — Next.js liest diesen Wert statisch aus und
// erkennt keine importierten Bezeichner. Entspricht EVENTS_REVALIDATE.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://fightbase.io";
  const events = await getEvents();
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/impressum`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/datenschutz`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const eventPages: MetadataRoute.Sitemap = events.map((e) => ({
    url: `${base}/events/${e.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const sportPages: MetadataRoute.Sitemap = SPORTS.filter(
    (s) => s !== "All"
  ).map((s) => ({
    url: `${base}/sport/${sportSlug(s)}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.9,
  }));

  const promotionPages: MetadataRoute.Sitemap = promotionsWithPage(events).map(
    (p) => ({
      url: `${base}/promotion/${promotionSlug(p)}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    })
  );

  const { data } = await supabase.from("fighters").select("slug");
  const dbSlugs = (data ?? []).map((f) => f.slug).filter(Boolean) as string[];
  const eventSlugs = allFighterNames(events).map((name) => fighterSlug(name));
  const allSlugs = Array.from(new Set([...eventSlugs, ...dbSlugs]));

  const fighterPages: MetadataRoute.Sitemap = allSlugs.map((slug) => ({
    url: `${base}/fighters/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...sportPages,
    ...promotionPages,
    ...eventPages,
    ...fighterPages,
  ];
}
