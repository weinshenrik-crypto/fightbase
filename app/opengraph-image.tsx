import { ogCard, loadOgAssets, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/ogCard";

// Die Vorschaukarte der Startseite — und aller Seiten, die keine eigene haben
// (Impressum, Datenschutz, Nutzungsbedingungen, /about).
//
// Vorher lag hier ein von Hand gebautes og-image.png: andere Schrift, anderer
// Aufbau, altes Logo. Wer die Startseite teilte, bekam also etwas voellig
// anderes zu sehen als bei einem Event — und ausgerechnet die Startseite ist
// die URL, die beim Vorstellen der Seite geteilt wird.
//
// Der Text ist derselbe, der auf der Startseite steht. Was dort behauptet
// wird, muss auch hier stimmen: "no tracking" fehlt bewusst, weil die Seite
// Reichweite misst (siehe /datenschutz, Abschnitt 6).

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Fightbase — combat sports events calendar";

export default async function Image() {
  return ogCard(
    {
      eyebrow: "BOXING · MMA · MUAY THAI · KICKBOXING · JIU-JITSU",
      headline: "Nine combat sports, one calendar",
      byline: "Free, no ads, nothing made up",
      footnote: "Judo · Wrestling · Karate · Taekwondo",
      watermark: "Fightbase",
    },
    await loadOgAssets()
  );
}
