import { MetadataRoute } from "next";
import { EVENTS, allFighterNames, fighterSlug } from "@/lib/events";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://fightbase.io";
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/impressum`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/datenschutz`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const eventPages: MetadataRoute.Sitemap = EVENTS.map((e) => ({
    url: `${base}/events/${e.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const fighterPages: MetadataRoute.Sitemap = allFighterNames().map((name) => ({
    url: `${base}/fighters/${fighterSlug(name)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticPages, ...eventPages, ...fighterPages];
}
