import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { nameHue } from "./events";
import config from "../tailwind.config";

// Das Vorschaubild, das beim Teilen eines Links erscheint — fuer alle
// Seitentypen an einer Stelle.
//
// Vorher gab es zwei Gestaltungen nebeneinander: die erzeugte Karte auf den
// Eventseiten und ein von Hand gebautes og-image.png fuer alles andere, in
// einer anderen Schrift und mit anderem Aufbau. Wer die Startseite teilte,
// bekam also etwas voellig anderes zu sehen als bei einem Event.
//
// Fotos echter Kaempfer sind ausgeschlossen (CLAUDE.md, "Nicht tun"). Was die
// Karte traegt, ist deshalb Typografie plus die eigene Silhouette.

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/**
 * Farben aus der Tailwind-Konfiguration statt als Hex-Literal.
 *
 * CLAUDE.md verbietet rohe Hex-Werte, und scripts/check-design-tokens.ts
 * bewacht das — fuer Tailwind-Klassen. Inline-Styles wie hier faengt es nicht,
 * genau deshalb kommen die Werte aus derselben Quelle wie ueberall sonst:
 * Aendert sich das Markenrot, aendert sich die Karte mit.
 */
const colors = config.theme?.extend?.colors as Record<string, string>;

type Assets = {
  semibold: Buffer;
  medium: Buffer;
  figure: string;
};

/**
 * Schriften und Silhouette von der Platte.
 *
 * Die Schriften liegen als TTF im Repo, weil Satori kein woff2 liest und
 * next/font die Datei nicht herausgibt. Die Silhouette ist aus
 * public/fighter-mask.png erzeugt — gleiche Alphawerte, RGB auf das
 * text-Token: Die Seite legt sie als CSS-Maske ueber eine Farbflaeche, und
 * Masken kennt Satori nicht.
 *
 * Jede Route, die das hier benutzt, braucht einen Eintrag unter
 * outputFileTracingIncludes in next.config.js — die Pfade stehen als String
 * im Code, und was Next nicht als Import sieht, landet nicht im Deployment.
 */
export async function loadOgAssets(): Promise<Assets> {
  const [semibold, medium, silhouette] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/Oswald-SemiBold.ttf")),
    readFile(join(process.cwd(), "assets/fonts/Oswald-Medium.ttf")),
    readFile(join(process.cwd(), "assets/fighter-silhouette.png")),
  ]);
  return {
    semibold,
    medium,
    figure: `data:image/png;base64,${silhouette.toString("base64")}`,
  };
}

/**
 * Schriftgroesse der Ueberschrift nach Laenge und verfuegbarer Breite.
 *
 * Die IBJJF-Turniernamen sind das Mass der Dinge: "Orange County Fall
 * International Open IBJJF Jiu-Jitsu No-Gi Championship 2026" hat 77 Zeichen,
 * eine Paarung wie "Van vs. Pantoja 2" siebzehn. Stehen rechts Figuren,
 * bleibt weniger Platz — dann faellt jede Stufe kleiner aus.
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
 * Groesse des Schriftzugs im Hintergrund.
 *
 * Er soll in einer Zeile stehen und die Karte fuellen — "MMA" darf also nicht
 * dieselbe Groesse bekommen wie "Kickboxing". 0.55em pro Grossbuchstabe ist
 * fuer Oswald gemessen und liegt bewusst etwas zu hoch, damit nichts anstoesst.
 */
function watermarkSize(word: string): number {
  return Math.min(300, Math.round(1060 / Math.max(1, word.length * 0.55)));
}

/** Ein Mensch als Kreis in seiner Namensfarbe, mit der Silhouette darin. */
function Figure({
  name,
  src,
  box,
}: {
  name: string;
  src: string;
  box: number;
}) {
  const hue = nameHue(name);
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
      {/* Satori rendert daraus ein PNG, kein DOM: Es gibt hier kein LCP und
          keine Bandbreite zu sparen, next/image waere hier gar nicht
          lauffaehig. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} width={Math.round(box * 0.46)} height={Math.round(box * 0.83)} alt="" />
    </div>
  );
}

export type OgCard = {
  /** Kleine Zeile oben, z.B. "SAT 24 OCTOBER" oder "NINE COMBAT SPORTS". */
  eyebrow?: string;
  headline: string;
  /** Zeile unter der Ueberschrift, etwas kraeftiger. */
  byline?: string;
  /** Dritte, leisere Zeile — Austragungsort oder Zusatz. */
  footnote?: string;
  /** Der grosse Schriftzug im Hintergrund. */
  watermark?: string;
  /** Ein oder zwei Menschen. Bei zweien steht ein rotes VS dazwischen. */
  figures?: string[];
};

export async function ogCard(card: OgCard, assets: Assets) {
  const { semibold, medium, figure } = assets;
  const figures = card.figures?.filter(Boolean) ?? [];
  const box = figures.length > 1 ? 168 : 210;
  // Der Schriftzug wiederholt nie die Ueberschrift: Bei /promotion/one stand
  // sonst "ONE" gross im Hintergrund und "ONE" davor.
  const watermark =
    card.watermark &&
    card.watermark.trim().toUpperCase() !== card.headline.trim().toUpperCase()
      ? card.watermark
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
        {watermark ? (
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
              fontSize: watermarkSize(watermark),
              lineHeight: 1,
              fontWeight: 600,
              letterSpacing: -4,
              color: colors.text,
              // Sehr schwach: Der Schriftzug soll die Flaeche beleben, nicht
              // mit der Ueberschrift um Aufmerksamkeit streiten.
              opacity: 0.08,
              whiteSpace: "nowrap",
            }}
          >
            {watermark.toUpperCase()}
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
              width: figures.length > 0 ? 620 : "100%",
            }}
          >
            {card.eyebrow ? (
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
                {card.eyebrow}
              </div>
            ) : null}

            <div
              style={{
                display: "flex",
                fontSize: headlineSize(card.headline, figures.length > 0),
                lineHeight: 1.08,
                color: colors.text,
                fontWeight: 600,
              }}
            >
              {card.headline}
            </div>

            {card.byline ? (
              <div
                style={{
                  display: "flex",
                  fontSize: 30,
                  color: colors.muted,
                  fontWeight: 500,
                  marginTop: 20,
                }}
              >
                {card.byline}
              </div>
            ) : null}

            {card.footnote ? (
              <div
                style={{
                  display: "flex",
                  fontSize: 26,
                  color: colors.faint,
                  fontWeight: 500,
                  marginTop: 8,
                }}
              >
                {card.footnote}
              </div>
            ) : null}
          </div>

          {/* Die Farbe je Mensch ist dieselbe, die die Seite aus dem Namen
              ableitet (nameHue) — Karte und Fighterprofil zeigen denselben
              Menschen also in derselben Farbe. */}
          {figures.length > 0 ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              <Figure name={figures[0]} src={figure} box={box} />
              {figures.length > 1 ? (
                <>
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
                  <Figure name={figures[1]} src={figure} box={box} />
                </>
              ) : null}
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
      ...OG_SIZE,
      fonts: [
        { name: "Oswald", data: semibold, weight: 600, style: "normal" },
        { name: "Oswald", data: medium, weight: 500, style: "normal" },
      ],
    }
  );
}
