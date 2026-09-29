import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { getEvents, getEventBySlug } from "@/lib/eventsDb";
import { eventHeadline, formatDate } from "@/lib/events";
import config from "@/tailwind.config";

// Das Vorschaubild eines einzelnen Events.
//
// Vorher trugen alle Seiten dasselbe og-image.png. Ein geteilter Link sah damit
// aus wie jeder andere — wer in einer Gruppe "schau mal, UFC 331" schickt, will
// aber, dass die Karte das auch sagt. Diese Datei erzeugt je Event eine eigene.
//
// Erzeugt wird sie zur Bauzeit, nicht bei jedem Abruf — dafuer braucht diese
// Datei ein eigenes generateStaticParams. Das der Eventseite gilt nicht mit:
// ohne das unten stand die Route im Build-Bericht als `ƒ (Dynamic)`.
// Ein Event, das erst spaeter in der Datenbank auftaucht, bekommt sein Bild
// beim ersten Abruf und danach aus dem Cache.

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
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
 * Farben aus der Tailwind-Konfiguration statt als Hex-Literal.
 *
 * CLAUDE.md verbietet rohe Hex-Werte, und scripts/check-design-tokens.ts
 * bewacht das — fuer Tailwind-Klassen. Inline-Styles wie hier faenge es nicht,
 * genau deshalb kommen die Werte aus derselben Quelle wie ueberall sonst:
 * Aendert sich das Markenrot, aendert sich die Karte mit.
 */
const colors = config.theme?.extend?.colors as Record<string, string>;

/**
 * Schriftgroesse nach Laenge.
 *
 * Die IBJJF-Turniernamen sind das Mass der Dinge: "Manaus International Open
 * IBJJF Jiu-Jitsu No-Gi Championship 2026" hat 63 Zeichen, eine Paarung wie
 * "Van vs. Pantoja 2" sechzehn. Eine feste Groesse laesst entweder das eine
 * ueberlaufen oder das andere verloren aussehen.
 */
function headlineSize(text: string): number {
  if (text.length <= 22) return 82;
  if (text.length <= 34) return 68;
  if (text.length <= 48) return 56;
  return 46;
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

  const [semibold, medium] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/Oswald-SemiBold.ttf")),
    readFile(join(process.cwd(), "assets/fonts/Oswald-Medium.ttf")),
  ]);

  // Ohne Event trotzdem eine Karte liefern statt eines 500ers: Ein toter Link
  // soll in der Vorschau nach Fightbase aussehen, nicht nach Fehler.
  const head = event
    ? eventHeadline(event)
    : { headline: "Fightbase", sub: "" };
  const headline = head.headline;

  // Dieselbe Aufteilung wie auf der Eventseite: Nebenzeile und Promotion
  // zusammen, der Austragungsort darunter.
  //
  // Bei einer Paarung ist die Ueberschrift "Volkanovski vs. Evloev" und die
  // Nebenzeile "UFC 333" — ohne sie verschwaende die Nummer, nach der
  // gesucht und geteilt wird. Die Promotion faellt weg, wenn die Nebenzeile
  // sie schon enthaelt, sonst stuende dort "UFC 333 · UFC".
  const byline = event
    ? buildByline(headline, head.sub, event.promotion)
    : "Combat sports events calendar";
  const venue = event?.venue ?? "";
  const sport = event?.sport ?? "";
  const when = event
    ? (() => {
        const { weekday, day, monthLong } = formatDate(event.date);
        return `${weekday} ${day} ${monthLong}`.toUpperCase();
      })()
    : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: colors.base,
          // Der Streifen links ist das einzige Rot auf der Karte. Er macht sie
          // im Verlauf erkennbar, ohne dass Text in Akzentfarbe steht.
          borderLeft: `18px solid ${colors.accent}`,
          padding: "64px 72px",
          fontFamily: "Oswald",
        }}
      >
        {/*
          flex: 1 plus zentriert: Ohne das klebte der Text oben und liess bei
          kurzen Namen ("Steko's Fight Night") ein Drittel der Karte leer.
          Lange IBJJF-Namen brauchen denselben Platz weiterhin — sie wachsen
          jetzt nach oben und unten statt nach unten allein.
        */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
          }}
        >
          {sport ? (
            <div
              style={{
                display: "flex",
                fontSize: 26,
                letterSpacing: 4,
                color: colors.faint,
                fontWeight: 500,
                marginBottom: 18,
              }}
            >
              {sport.toUpperCase()}
              {when ? `  ·  ${when}` : ""}
            </div>
          ) : null}

          <div
            style={{
              display: "flex",
              fontSize: headlineSize(headline),
              lineHeight: 1.08,
              color: colors.text,
              fontWeight: 600,
            }}
          >
            {headline}
          </div>

          {byline ? (
            <div
              style={{
                display: "flex",
                fontSize: 30,
                color: colors.muted,
                fontWeight: 500,
                marginTop: 22,
              }}
            >
              {byline}
            </div>
          ) : null}

          {venue ? (
            <div
              style={{
                display: "flex",
                fontSize: 26,
                color: colors.faint,
                fontWeight: 500,
                marginTop: 8,
              }}
            >
              {venue}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 46,
              height: 46,
              borderRadius: 10,
              background: colors.accent,
              color: "#FFFFFF",
              fontSize: 28,
              fontWeight: 600,
              marginRight: 16,
            }}
          >
            F
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 32,
              letterSpacing: 2,
              color: colors.text,
              fontWeight: 600,
            }}
          >
            FIGHTBASE
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 24,
              color: colors.dim,
              fontWeight: 500,
              marginLeft: "auto",
            }}
          >
            fightbase.io
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Oswald", data: semibold, weight: 600, style: "normal" },
        { name: "Oswald", data: medium, weight: 500, style: "normal" },
      ],
    }
  );
}
