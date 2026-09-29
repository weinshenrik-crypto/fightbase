import { promotionSlug, promotionsWithPage } from "@/lib/events";
import { getEvents } from "@/lib/eventsDb";
import { ogCard, loadOgAssets, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/ogCard";

// Die Vorschaukarte einer Promotion-Seite. Gleiche Gestaltung wie ueberall
// sonst; im Hintergrund steht der Name des Veranstalters.

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Fightbase promotion schedule";
export const revalidate = 3600;

export async function generateStaticParams() {
  const events = await getEvents();
  return promotionsWithPage(events).map((p) => ({ promotion: promotionSlug(p) }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ promotion: string }>;
}) {
  const { promotion: slug } = await params;
  const events = await getEvents();
  const promotion = promotionsWithPage(events).find(
    (p) => promotionSlug(p) === slug
  );
  const assets = await loadOgAssets();

  if (!promotion) {
    return ogCard(
      {
        headline: "Fightbase",
        byline: "Combat sports events calendar",
        watermark: "Fightbase",
      },
      assets
    );
  }

  // Die Sportarten, die dieser Veranstalter tatsaechlich bestreitet — ONE
  // steht fuer Muay Thai und Kickboxen, die IBJJF nur fuer Jiu-Jitsu.
  const sports = Array.from(
    new Set(events.filter((e) => e.promotion === promotion).map((e) => e.sport))
  );

  return ogCard(
    {
      eyebrow: "SCHEDULE",
      headline: promotion,
      byline: "Every upcoming event, tracked on Fightbase",
      footnote: sports.join(" · "),
      // Die Hauptsportart statt des Namens: Der steht schon als Ueberschrift
      // da, und "ONE" hinter "ONE" sah aus wie ein Darstellungsfehler.
      watermark: sports[0],
    },
    assets
  );
}
