import { getEvents, getEventBySlug } from "@/lib/eventsDb";
import { eventHeadline, formatDate } from "@/lib/events";
import { ogCard, loadOgAssets, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/ogCard";

// Das Vorschaubild eines einzelnen Events.
//
// Vorher trugen alle Seiten dasselbe og-image.png. Ein geteilter Link sah damit
// aus wie jeder andere — wer in einer Gruppe "schau mal, UFC 333" schickt, will
// aber, dass die Karte das auch sagt.
//
// Erzeugt wird das Bild zur Bauzeit, nicht bei jedem Abruf — dafuer braucht
// diese Datei ein eigenes generateStaticParams. Das der Eventseite gilt nicht
// mit: ohne das unten stand die Route im Build-Bericht als `ƒ (Dynamic)`.

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Fightbase event card";

// Die Seite selbst steht auf 60 Sekunden, weil dort Fighter-Fotos auftauchen
// koennen. Auf der Karte steht nur Name, Datum, Ort — eine Stunde wie bei den
// Listen reicht, und jedes Neuzeichnen kostet ein PNG.
export const revalidate = 3600;

/** Dieselben Slugs wie die Eventseite, damit die Bilder mitgebaut werden. */
export async function generateStaticParams() {
  return (await getEvents()).map((e) => ({ id: e.id }));
}

/**
 * Die Nebenzeile: Was ausser der Ueberschrift noch zum Event gehoert.
 *
 * Drei Faelle aus den echten Daten:
 *   UFC 333         Ueberschrift "Volkanovski vs. Evloev", sub "UFC 333"
 *                   -> "UFC 333". Die Promotion faellt weg, sonst stuende
 *                      dort "UFC 333 · UFC".
 *   OKTAGON 93      sub ist "OKTAGON 93: Rousal vs. Magard" und enthaelt die
 *                   Ueberschrift schon -> "OKTAGON 93".
 *   Steko's         sub ist der Hauptkampf, die Promotion steht nirgends
 *                   sonst -> "<Hauptkampf> · Steko's Fight Night".
 *
 * Ohne den ersten Fall verschwaende die Eventnummer — und die ist das, wonach
 * gesucht und was geteilt wird.
 */
function buildByline(
  headline: string,
  sub: string,
  promotion: string
): string {
  // Die Ueberschrift nicht ein zweites Mal: "OKTAGON 93: Rousal vs. Magard"
  // unter "Rousal vs. Magard" liest sich wie ein Fehler.
  let rest = sub.includes(headline) ? sub.replace(headline, "") : sub;
  rest = rest.replace(/^[\s:·\-–—]+|[\s:·\-–—]+$/g, "");
  if (!rest) return promotion;
  return rest.toLowerCase().includes(promotion.toLowerCase())
    ? rest
    : `${rest} · ${promotion}`;
}

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventBySlug(id);
  const assets = await loadOgAssets();

  // Ohne Event trotzdem eine Karte liefern statt eines 500ers: Ein toter Link
  // soll in der Vorschau nach Fightbase aussehen, nicht nach Fehler.
  if (!event) {
    return ogCard(
      {
        headline: "Fightbase",
        byline: "Combat sports events calendar",
        watermark: "Fightbase",
      },
      assets
    );
  }

  const head = eventHeadline(event);
  const { weekday, day, monthLong } = formatDate(event.date);

  return ogCard(
    {
      eyebrow: `${weekday} ${day} ${monthLong}`.toUpperCase(),
      headline: head.headline,
      byline: buildByline(head.headline, head.sub, event.promotion),
      footnote: event.venue,
      watermark: event.sport,
      figures: event.fighters ? [...event.fighters] : undefined,
    },
    assets
  );
}
