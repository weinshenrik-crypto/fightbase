import type { Metadata } from "next";

// Die Vorschaukarte, die beim Teilen eines Links erscheint.
//
// Anlass: Nur die Startseite hatte eine. Gemessen an der laufenden Seite
// trugen /sport/*, /promotion/*, /events/* und /fighters/* kein og:image und
// nur twitter:card=summary — als Link in WhatsApp, Discord, Reddit oder X also
// nackter Text statt einer Karte mit Bild. Das waren 194 der 195 URLs in der
// Sitemap, und ausgerechnet die, die man teilt.
//
// Ursache war kein Versehen im Layout, sondern wie Next Metadaten
// zusammenfuehrt: Definiert eine Unterseite ein eigenes `openGraph`, ersetzt
// das den Block des Wurzel-Layouts vollstaendig — `images` wird nicht vererbt.
// Dasselbe gilt fuer `twitter`.
//
// **Diese Datei setzt deshalb gar kein Bild mehr.** Jede Seite bekommt es
// ueber die Dateikonvention (opengraph-image.tsx im jeweiligen Ordner, und
// app/opengraph-image.tsx fuer alles ohne eigene). Das ist genau andersherum
// als der erste Versuch: Ein hier gesetztes `images` wuerde die erzeugte
// Karte verdecken, weil die Dateikonvention einen ausdruecklichen Eintrag
// *nicht* ueberschreibt. Gemessen an der gebauten Seite trug /events/steko-1
// weiter og-image.png, obwohl das fertige opengraph-image.tsx danebenlag.

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
      locale: "en_US",
      type,
    },
    twitter: {
      // summary_large_image statt summary: Die grosse Karte ist der
      // Unterschied zwischen einem Vorschaubildchen am Rand und einer Karte,
      // die im Verlauf auffaellt.
      card: "summary_large_image",
      title,
      description,
    },
  };
}
