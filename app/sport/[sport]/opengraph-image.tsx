import { SPORTS, sportSlug, sportBySlug, SPORT_DESCRIPTIONS } from "@/lib/events";
import { ogCard, loadOgAssets, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/ogCard";

// Die Vorschaukarte einer Sport-Landingpage. Gleiche Gestaltung wie bei den
// Events, damit ein geteilter Link aus derselben Seite zu kommen scheint.

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Fightbase sport calendar";
export const revalidate = 3600;

export function generateStaticParams() {
  return SPORTS.filter((s) => s !== "All").map((s) => ({ sport: sportSlug(s) }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ sport: string }>;
}) {
  const { sport: slug } = await params;
  const sport = sportBySlug(slug);
  const assets = await loadOgAssets();

  if (!sport) {
    return ogCard(
      {
        headline: "Fightbase",
        byline: "Combat sports events calendar",
        watermark: "Fightbase",
      },
      assets
    );
  }

  // Die Beschreibung der Seite ist ein ganzer Satz und auf einer Karte zu
  // lang. Der erste Teilsatz bis zum ersten Punkt reicht — und wo es keinen
  // gibt, bleibt die Zeile weg, statt mitten im Wort abzuschneiden.
  const description = SPORT_DESCRIPTIONS[sport] ?? "";
  const firstSentence = description.split(". ")[0];
  const footnote =
    firstSentence && firstSentence.length <= 72 ? firstSentence : "";

  return ogCard(
    {
      eyebrow: "EVENTS CALENDAR",
      headline: `${sport} Events`,
      byline: "Every upcoming card, tracked on Fightbase",
      footnote,
      watermark: sport,
    },
    assets
  );
}
