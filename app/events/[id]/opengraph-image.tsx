import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { getEvents, getEventBySlug } from "@/lib/eventsDb";
import { eventHeadline, formatDate, nameHue } from "@/lib/events";
import config from "@/tailwind.config";

// Das Vorschaubild eines einzelnen Events.
//
// Vorher trugen alle Seiten dasselbe og-image.png. Ein geteilter Link sah damit
// aus wie jeder andere — wer in einer Gruppe "schau mal, UFC 333" schickt, will
// aber, dass die Karte das auch sagt.
//
// Die erste Fassung war reine Typografie und sah im Verlauf nach nichts aus.
// Zwei Dinge kommen deshalb dazu:
//
//   - Die Sportart als riesiger Schriftzug im Hintergrund. Sie gibt jeder
//     Karte ein Gesicht und behauptet nichts Falsches — anders als eine
//     Grafik, die auf einer Jiu-Jitsu-Karte einen Boxer zeigt.
//   - Zwei Figuren bei einer angekuendigten Paarung. Das betrifft nur 16 der
//     164 Events, aber genau die werden geteilt.
//
// Fotos echter Kaempfer sind ausgeschlossen (CLAUDE.md, "Nicht tun") — die
// Figuren sind dieselbe eigene Silhouette, die auch die Seite benutzt.
//
// Erzeugt wird das Bild zur Bauzeit, nicht bei jedem Abruf — dafuer braucht
// diese Datei ein eigenes generateStaticParams. Das der Eventseite gilt nicht
// mit: ohne das unten stand die Route im Build-Bericht als `ƒ (Dynamic)`.

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
 * bewacht das — fuer Tailwind-Klassen. Inline-Styles wie hier faengt es nicht,
 * genau deshalb kommen die Werte aus derselben Quelle wie ueberall sonst:
 * Aendert sich das Markenrot, aendert sich die Karte mit.
 */
const colors = config.theme?.extend?.colors as Record<string, string>;

/**
 * Schriftgroesse der Ueberschrift nach Laenge und verfuegbarer Breite.
 *
 * Die IBJJF-Turniernamen sind das Mass der Dinge: "Orange County Fall
 * International Open IBJJF Jiu-Jitsu No-Gi Championship 2026" hat 77 Zeichen,
 * eine Paarung wie "Van vs. Pantoja 2" siebzehn. Steht rechts der
 * Figurenblock, bleibt weniger Platz — dann faellt jede Stufe kleiner aus.
 */
function headlineSize(text: string, narrow: boolean): number {
  const steps: Array<[number, number]> = narrow
    ? [
        [20, 62],
        [32, 50],
        [46, 40],
        [Infinity, 34],
      ]
    : [
        [22, 82],
        [34, 68],
        [48, 56],
        [Infinity, 46],
      ];
  for (const [max, px] of steps) if (text.length <= max) return px;
  return steps[steps.length - 1][1];
}

/**
 * Groesse des Sportart-Schriftzugs im Hintergrund.
 *
 * Er soll in einer Zeile stehen und die Karte fuellen — "MMA" darf also nicht
 * dieselbe Groesse bekommen wie "Kickboxing". 0.55em pro Grossbuchstabe ist
 * fuer Oswald gemessen und liegt bewusst etwas zu hoch, damit nichts anstoesst.
 */
function watermarkSize(word: string): number {
  return Math.min(300, Math.round(1060 / Math.max(1, word.length * 0.55)));
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

/** Ein Kaempfer als Kreis in seiner Namensfarbe, mit der Silhouette darin. */
function Figure({ name, src }: { name: string; src: string }) {
  const hue = nameHue(name);
  const box = 168;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        width: box,
        height: box,
        borderRadius: box / 2,
        overflow: "hidden",
        background: `hsl(${hue}, 40%, 20%)`,
        border: `2px solid hsl(${hue}, 40%, 32%)`,
      }}
    >
      {/* Satori rendert <img>, kein next/image — die Regel greift hier
          ohnehin nicht, weil daraus ein PNG wird und kein DOM. */}
      <img src={src} width={78} height={139} alt="" />
    </div>
  );
}

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventBySlug(id);

  const [semibold, medium, silhouette] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/Oswald-SemiBold.ttf")),
    readFile(join(process.cwd(), "assets/fonts/Oswald-Medium.ttf")),
    // Dieselbe Figur wie in components/FighterIllustration.tsx, nur hell statt
    // schwarz: Dort liegt sie als CSS-Maske ueber einer Farbflaeche, und
    // Masken kennt Satori nicht. Die Datei ist aus public/fighter-mask.png
    // erzeugt — gleiche Alphawerte, RGB auf das text-Token gesetzt.
    readFile(join(process.cwd(), "assets/fighter-silhouette.png")),
  ]);
  const figure = `data:image/png;base64,${silhouette.toString("base64")}`;

  // Ohne Event trotzdem eine Karte liefern statt eines 500ers: Ein toter Link
  // soll in der Vorschau nach Fightbase aussehen, nicht nach Fehler.
  const head = event
    ? eventHeadline(event)
    : { headline: "Fightbase", sub: "" };
  const headline = head.headline;
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
  const fighters = event?.fighters ?? null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
          background: colors.base,
          // Der Streifen links ist das einzige volle Rot auf der Karte. Er
          // macht sie im Verlauf erkennbar, ohne dass Text in Akzentfarbe
          // steht.
          borderLeft: `18px solid ${colors.accent}`,
          padding: "56px 72px",
          fontFamily: "Oswald",
        }}
      >
        {/* Die Sportart als Hintergrund. Sehr schwach: Sie soll die Flaeche
            beleben, nicht mit der Ueberschrift um Aufmerksamkeit streiten. */}
        {sport ? (
          <div
            style={{
              position: "absolute",
              display: "flex",
              alignItems: "center",
              left: 56,
              top: 0,
              // Ueber die volle Hoehe und mittig: Sonst haengt der Schriftzug
              // je nach Schriftgroesse anders — "MMA" bei 300px begann tief,
              // "MUAY THAI" bei 192px stiess oben an die Datumszeile.
              height: "100%",
              fontSize: watermarkSize(sport),
              lineHeight: 1,
              fontWeight: 600,
              letterSpacing: -4,
              color: colors.text,
              opacity: 0.08,
              whiteSpace: "nowrap",
            }}
          >
            {sport.toUpperCase()}
          </div>
        ) : null}

        {/* flex: 1 plus zentriert: Ohne das klebte der Text oben und liess bei
            kurzen Namen ein Drittel der Karte leer. */}
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              width: fighters ? 620 : "100%",
            }}
          >
            {when ? (
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
                {when}
              </div>
            ) : null}

            <div
              style={{
                display: "flex",
                fontSize: headlineSize(headline, Boolean(fighters)),
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
                  marginTop: 20,
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

          {/* Die angekuendigte Paarung. Die Farbe je Kaempfer ist dieselbe, die
              die Seite aus dem Namen ableitet (nameHue) — Karte und
              Fighterprofil zeigen denselben Menschen also in derselben
              Farbe. */}
          {fighters ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              <Figure name={fighters[0]} src={figure} />
              <div
                style={{
                  display: "flex",
                  fontSize: 34,
                  fontWeight: 600,
                  color: colors.accentText,
                  letterSpacing: 2,
                  margin: "0 18px",
                }}
              >
                VS
              </div>
              <Figure name={fighters[1]} src={figure} />
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
