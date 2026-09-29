import { ogCard, loadOgAssets, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/ogCard";

// /about braucht eine eigene Karte, obwohl app/opengraph-image.tsx eine
// Etage darueber liegt.
//
// Gemessen an der gebauten Seite: Wer wie hier ein eigenes `openGraph`
// definiert (ueber socialMeta), erbt die Bilddatei des Elternordners *nicht*.
// /impressum bekommt sie, weil es gar kein openGraph setzt; /about bekam
// nichts. Deshalb hier eine eigene — und weil es die Seite ist, auf die ein
// Post verlinkt, darf sie ohnehin anders klingen als die Startseite.

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "About Fightbase";

export default async function Image() {
  return ogCard(
    {
      eyebrow: "ABOUT",
      headline: "How the calendar is built",
      byline: "Sourced from the federations themselves",
      footnote: "No fabricated fights. Free, no ads.",
      watermark: "Fightbase",
    },
    await loadOgAssets()
  );
}
