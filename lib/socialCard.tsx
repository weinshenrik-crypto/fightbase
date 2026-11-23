import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { eventHeadline, formatDate, nameHue, type FightEvent } from "./events";
import { loadOgAssets } from "./ogCard";
import { weekendOrder, isHighlight, pairOf, type Lang } from "./socialPosts";
import config from "../tailwind.config";

// Bilder fuer Instagram und TikTok, im selben Look wie die Vorschaukarten
// (lib/ogCard.tsx): Oswald, roter Streifen links, Sportart als Schriftzug im
// Hintergrund.
//
//   Story/Reel/TikTok   1080 x 1920   ein Event
//   Feed/Karussell      1080 x 1350   das Wochenende
//
// Fighter erscheinen mit Foto nur, wenn es in der fighters-Tabelle eines gibt
// — das sind ausschliesslich frei lizenzierte Commons-Fotos, und deren Urheber
// steht klein unten auf dem Bild. Die Lizenz (CC BY / BY-SA) verlangt die
// Nennung, und ein Bild wird geteilt, ohne dass die Bildunterschrift mitreist.
// Alle anderen bekommen die Silhouette, wie auf der Seite.

export const STORY_SIZE = { width: 1080, height: 1920 };
export const FEED_SIZE = { width: 1080, height: 1350 };

const colors = config.theme?.extend?.colors as Record<string, string>;

type Assets = Awaited<ReturnType<typeof loadOgAssets>>;

export type FighterPhoto = { name: string; photoUrl: string | null; credit: string | null };

const PHOTO_PATH = /^\/fighters\/[a-z0-9-]+\.(jpg|jpeg|png)$/;

/**
 * Ein Foto aus public/fighters/ als data-URL.
 *
 * Von der Platte statt per HTTP: Satori laedt sonst ueber das Netz, und die
 * eigene Domain waehrend des Builds anzufragen ist eine Falle. Nur Pfade, die
 * genau so aussehen wie die, die scripts/find-fighter-photos.ts anlegt — die
 * Spalte ist von Admins beschreibbar, und ein "../" darin laese sonst beliebige
 * Dateien vom Server.
 */
async function photoDataUrl(photoUrl: string | null): Promise<string | null> {
  if (!photoUrl || !PHOTO_PATH.test(photoUrl)) return null;
  try {
    const buf = await readFile(join(process.cwd(), "public", photoUrl));
    const type = photoUrl.endsWith(".png") ? "png" : "jpeg";
    return `data:image/${type};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

function fonts(assets: Assets) {
  return [
    { name: "Oswald", data: assets.semibold, weight: 600 as const, style: "normal" as const },
    { name: "Oswald", data: assets.medium, weight: 500 as const, style: "normal" as const },
  ];
}

/** Wochentag, Tag, Monat in der Sprache des Posts — formatDate kennt nur Englisch. */
function dateParts(date: string, lang: Lang) {
  if (lang === "en") return formatDate(date);
  const d = new Date(date + "T00:00:00Z");
  const f = (o: Intl.DateTimeFormatOptions) => d.toLocaleDateString("de-DE", { ...o, timeZone: "UTC" });
  return {
    weekday: f({ weekday: "short" }).replace(".", ""),
    day: d.getUTCDate(),
    month: f({ month: "short" }),
    monthLong: f({ month: "long" }),
  };
}

const clip = (s: string, max: number) => (s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s);

function Person({
  name,
  photo,
  silhouette,
  box,
}: {
  name: string;
  photo: string | null;
  silhouette: string;
  box: number;
}) {
  const hue = nameHue(name);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: box + 40 }}>
      <div
        style={{
          display: "flex",
          alignItems: photo ? "center" : "flex-end",
          justifyContent: "center",
          width: box,
          height: box,
          borderRadius: box / 2,
          overflow: "hidden",
          background: `hsl(${hue}, 40%, 20%)`,
          border: `4px solid hsl(${hue}, 40%, 32%)`,
        }}
      >
        {/* Satori zeichnet ein PNG, kein DOM — next/image laeuft hier nicht. */}
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} width={box} height={box} style={{ objectFit: "cover", objectPosition: "top" }} alt="" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={silhouette} width={Math.round(box * 0.46)} height={Math.round(box * 0.83)} alt="" />
        )}
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 24,
          fontSize: 52,
          fontWeight: 600,
          color: colors.text,
          textAlign: "center",
        }}
      >
        {clip(name, 16).toUpperCase()}
      </div>
    </div>
  );
}

function Brand({ tagline }: { tagline: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 72,
            height: 72,
            borderRadius: 14,
            background: colors.accent,
            color: "#FFFFFF",
            fontSize: 44,
            fontWeight: 600,
            marginRight: 22,
          }}
        >
          F
        </div>
        <div style={{ display: "flex", fontSize: 50, letterSpacing: 3, color: colors.text, fontWeight: 600 }}>
          FIGHTBASE
        </div>
        <div style={{ display: "flex", fontSize: 36, color: colors.muted, fontWeight: 500, marginLeft: "auto" }}>
          fightbase.io
        </div>
      </div>
      <div style={{ display: "flex", fontSize: 30, color: colors.faint, fontWeight: 500, marginTop: 14 }}>
        {tagline}
      </div>
    </div>
  );
}

const TAGLINE: Record<Lang, string> = {
  en: "Every fight in 9 combat sports. One free calendar.",
  de: "Alle Kämpfe aus 9 Kampfsportarten. Ein kostenloser Kalender.",
};

/** Ein Event im Hochformat. */
export async function storyCard(event: FightEvent, people: FighterPhoto[], lang: Lang) {
  const assets = await loadOgAssets();
  const { headline, sub } = eventHeadline(event);
  const { weekday, day, monthLong } = dateParts(event.date, lang);
  const pair = pairOf(event);

  const photos = pair
    ? await Promise.all(
        pair.map((n) => photoDataUrl(people.find((p) => p.name === n)?.photoUrl ?? null))
      )
    : [];
  const credits = pair
    ? pair
        .map((n, i) => (photos[i] ? people.find((p) => p.name === n)?.credit : null))
        .filter((c): c is string => !!c)
    : [];

  const byline = sub && !sub.includes(headline) ? sub : event.promotion;
  const where = event.venue ? clip(event.venue, 48) : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          background: colors.base,
          borderLeft: `24px solid ${colors.accent}`,
          padding: "120px 80px 90px 80px",
          fontFamily: "Oswald",
        }}
      >
        {/* Schriftzug der Sportart, hochkant hinter allem */}
        <div
          style={{
            position: "absolute",
            display: "flex",
            left: 40,
            top: 560,
            fontSize: Math.min(420, Math.round(1500 / Math.max(1, event.sport.length * 0.55))),
            lineHeight: 1,
            fontWeight: 600,
            color: colors.text,
            opacity: 0.06,
            whiteSpace: "nowrap",
          }}
        >
          {event.sport.toUpperCase()}
        </div>

        <div style={{ display: "flex", fontSize: 40, letterSpacing: 6, color: colors.accentText, fontWeight: 600 }}>
          {`${weekday} ${day} ${monthLong}`.toUpperCase()}
        </div>
        <div style={{ display: "flex", fontSize: 34, letterSpacing: 4, color: colors.faint, fontWeight: 500, marginTop: 12 }}>
          {`${event.sport} · ${event.promotion}`.toUpperCase()}
        </div>

        <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "center" }}>
          {pair ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 70 }}>
              <Person name={pair[0]} photo={photos[0]} silhouette={assets.figure} box={330} />
              <div style={{ display: "flex", fontSize: 72, fontWeight: 600, color: colors.accentText, margin: "0 10px 80px 10px" }}>
                VS
              </div>
              <Person name={pair[1]} photo={photos[1]} silhouette={assets.figure} box={330} />
            </div>
          ) : null}

          <div
            style={{
              display: "flex",
              fontSize: pair ? 64 : headline.length > 40 ? 84 : 110,
              lineHeight: 1.08,
              fontWeight: 600,
              color: colors.text,
            }}
          >
            {pair ? clip(byline, 40) : clip(headline, 90)}
          </div>
          {!pair && byline ? (
            <div style={{ display: "flex", fontSize: 46, color: colors.muted, fontWeight: 500, marginTop: 26 }}>
              {clip(byline, 60)}
            </div>
          ) : null}
          {where ? (
            <div style={{ display: "flex", fontSize: 40, color: colors.faint, fontWeight: 500, marginTop: 18 }}>
              {where}
            </div>
          ) : null}
        </div>

        <Brand tagline={TAGLINE[lang]} />
        {credits.length ? (
          <div style={{ display: "flex", fontSize: 22, color: colors.dim, fontWeight: 500, marginTop: 22 }}>
            {/* Nie kuerzen: Die Lizenz verlangt die volle Nennung. */}
            {credits.join(" · ")}
          </div>
        ) : null}
      </div>
    ),
    { ...STORY_SIZE, fonts: fonts(assets) }
  );
}

const WEEKEND_ROWS = 6;

/** Alle Events eines Wochenendes auf einer Karte. */
export async function weekendCard(events: FightEvent[], range: { from: string; to: string }, lang: Lang) {
  const assets = await loadOgAssets();
  const rows = weekendOrder(events).slice(0, WEEKEND_ROWS);
  const more = events.length - rows.length;
  const a = dateParts(range.from, lang);
  const b = dateParts(range.to, lang);
  const span = `${a.day} – ${b.day} ${b.monthLong}`.toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: colors.base,
          borderLeft: `24px solid ${colors.accent}`,
          padding: "80px 72px 70px 72px",
          fontFamily: "Oswald",
        }}
      >
        <div style={{ display: "flex", fontSize: 34, letterSpacing: 6, color: colors.accentText, fontWeight: 600 }}>
          {span}
        </div>
        <div style={{ display: "flex", fontSize: 92, lineHeight: 1.05, fontWeight: 600, color: colors.text, marginTop: 10 }}>
          {lang === "de" ? "DIESES WOCHENENDE" : "THIS WEEKEND"}
        </div>
        <div style={{ display: "flex", fontSize: 44, color: colors.muted, fontWeight: 500, marginBottom: 40 }}>
          {lang === "de" ? "im Kampfsport" : "in combat sports"}
        </div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
          {rows.length === 0 ? (
            <div style={{ display: "flex", fontSize: 40, color: colors.faint }}>
              {lang === "de" ? "Keine Events eingetragen." : "No events listed."}
            </div>
          ) : (
            rows.map((e) => {
              const { headline } = eventHeadline(e);
              const d = dateParts(e.date, lang);
              return (
                <div
                  key={e.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    borderTop: `2px solid ${colors.border}`,
                    padding: "16px 0",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", width: 130 }}>
                    <div style={{ display: "flex", fontSize: 28, color: colors.faint, fontWeight: 500 }}>
                      {d.weekday.toUpperCase()}
                    </div>
                    <div style={{ display: "flex", fontSize: 44, color: colors.text, fontWeight: 600, lineHeight: 1 }}>
                      {String(d.day)}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        fontSize: isHighlight(e) ? 42 : 36,
                        color: colors.text,
                        fontWeight: 600,
                        lineHeight: 1.15,
                      }}
                    >
                      {clip(headline, 40)}
                    </div>
                    <div style={{ display: "flex", fontSize: 28, color: colors.muted, fontWeight: 500, marginTop: 4 }}>
                      {clip(`${e.promotion} · ${e.sport}`, 50)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          {more > 0 ? (
            <div style={{ display: "flex", fontSize: 32, color: colors.accentText, fontWeight: 500, borderTop: `2px solid ${colors.border}`, paddingTop: 20 }}>
              {lang === "de" ? `+ ${more} weitere auf fightbase.io` : `+ ${more} more at fightbase.io`}
            </div>
          ) : null}
        </div>

        <Brand tagline={TAGLINE[lang]} />
      </div>
    ),
    { ...FEED_SIZE, fonts: fonts(assets) }
  );
}
