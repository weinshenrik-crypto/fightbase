import type { Metadata } from "next";

// Die Vorschaukarte, die beim Teilen eines Links erscheint.
//
// Anlass: Nur die Startseite hatte eine. Gemessen an der laufenden Seite trugen
// /sport/*, /promotion/*, /events/* und /fighters/* kein og:image und nur
// twitter:card=summary — als Link in WhatsApp, Discord, Reddit oder X also
// nackter Text statt einer Karte mit Bild. Das sind 194 der 195 URLs in der
// Sitemap, und ausgerechnet die, die man teilt: ein bestimmter Kampf, eine
// bestimmte Sportart.
//
// Ursache ist kein Versehen im Layout, sondern wie Next Metadaten
// zusammenfuehrt: Definiert eine Unterseite ein eigenes `openGraph`, ersetzt
// das den Block des Wurzel-Layouts vollstaendig — `images` wird nicht
// vererbt. Dasselbe gilt fuer `twitter`. Vier Seitentypen definierten beides
// und verloren dabei das Bild.
//
// Deshalb diese Datei: ein Ort, an dem Bild und Kartenformat stehen. Wer eine
// neue Seite anlegt, ruft socialMeta() auf und kann es nicht mehr vergessen.

/**
 * Das geteilte Vorschaubild. Relativ angegeben — `metadataBase` im Layout
 * macht daraus die absolute URL, die die Netzwerke verlangen.
 */
export const OG_IMAGE = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: "Fightbase — combat sports events calendar",
};

/**
 * `openGraph` und `twitter` fuer eine Unterseite.
 *
 * `url` gehoert dazu, auch wenn die Seite schon ein Canonical traegt: Die
 * Netzwerke lesen og:url, nicht das Canonical.
 */
export function socialMeta({
  title,
  description,
  path,
  type = "website",
}: {
  title: string;
  description: string;
  /** Pfad ab der Wurzel, z.B. "/sport/muay-thai". */
  path: string;
  type?: "website" | "profile";
}): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: {
      title,
      description,
      url: path,
      siteName: "Fightbase",
      images: [OG_IMAGE],
      locale: "en_US",
      type,
    },
    twitter: {
      // summary_large_image statt summary: Die grosse Karte ist der
      // Unterschied zwischen einem Vorschaubildchen und einer Karte, die im
      // Verlauf auffaellt.
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE.url],
    },
  };
}
