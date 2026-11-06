import { ogCard, loadOgAssets, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/ogCard";

// Eigene Karte, weil /beta ueber socialMeta ein eigenes `openGraph` setzt und
// die Bilddatei des Elternordners damit nicht erbt — dieselbe Falle wie bei
// /about, dort ausfuehrlich beschrieben.
//
// Diese Seite wird verschickt, nicht gefunden: Die Karte ist das, was in
// WhatsApp, Discord oder einem Forum unter dem Link steht.

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Test the Fightbase Android app";

export default async function Image() {
  return ogCard(
    {
      eyebrow: "ANDROID BETA",
      headline: "Test the Fightbase app",
      byline: "Two minutes on an Android phone helps it reach the Play Store",
      footnote: "Free, no ads, no account required.",
      watermark: "Fightbase",
    },
    await loadOgAssets()
  );
}
