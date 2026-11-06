// Boxen: Matchroom Boxing.
//
// Boxen galt hier als nicht automatisierbar — "kein Verbandskalender, der die
// Rolle der IBJJF/IJF/WKF/UWW uebernehmen koennte". Das stimmt fuer den Sport
// als Ganzes weiterhin: Geprueft wurden am 6. November 2026 alle grossen
// Promotionen, und das Ergebnis ist duenn.
//
//   Top Rank        /events/upcoming ist eine Nuxt-Anwendung. 612 KB Seite,
//                   davon 1327 Zeichen sichtbarer Text und kein einziges
//                   Datum im HTML — die Nutzdaten stehen im __NUXT_DATA__ als
//                   dereferenziertes Array ohne Feldnamen.
//   Ring Magazine   JS-gerendert; im HTML steht nur das historische Archiv
//                   (Daten aus den 1980ern), nicht der Spielplan.
//   Queensberry     keine Event-Links auf der Seite.
//   PBC, Golden Boy, BoxRec   antworten mit 403. Daran nicht vorbeibauen —
//                   dieselbe Linie wie bei athena.uww.org (siehe uww.ts).
//
// Matchroom ist die Ausnahme, und robots.txt erlaubt /events/ ausdruecklich
// (gesperrt sind nur WooCommerce-Pfade und wp-admin).
//
// Zweistufig wie ONE, aber ueber die **Uebersichtsseite**, nicht die Sitemap:
// events-sitemap.xml fuehrt 314 Eintraege in alphabetischer Reihenfolge, die
// ersten davon sind Karten von 2018. Die Uebersicht traegt dagegen genau die
// aktuellen 18 Karten, kommende zuerst.
//
// Was die Einzelseite hergibt — gemessen an 18 Karten:
//
//   Datum        18 von 18, als Text "fight card Friday 11 December 2026"
//   Hauptkampf   15 von 18, als "NAME VS W 39 KO 25 L 2 D 1 VS NAME W 30 …"
//   Sender       DAZN, auf jeder Seite
//   Ort          nur 2 von 18 — und zwar nirgends als Fliesstext, sondern im
//                Ticketlink (events365.com/events/…tickets_cardiff_
//                principality-stadium_friday-11-december-…).
//
// Der fehlende Ort ist bewusst kein Ausschlussgrund, anders als bei ONE: Dort
// ist der Austragungsort der eigentliche Inhalt (welches Stadion in Bangkok),
// bei einer Boxkarte sind es die Namen. Die Oberfläche kommt seit venueLine()
// in lib/events.ts mit einem leeren Ort zurecht, und die Detailseite laesst
// dann auch das location-Feld im JSON-LD weg, statt einen Place ohne Namen zu
// behaupten.

import {
  type EventSource,
  type SourceEvent,
  type SourceResult,
  SkipLog,
  fetchText,
  isoDate,
  monthNumber,
  slugify,
  textOf,
  today,
} from "./types";

const BASE = "https://www.matchroomboxing.com";
const LISTING = "https://matchroomboxing.com/events/";

/** Obergrenze der Einzelabrufe. Die Uebersicht fuehrt derzeit 18 Karten. */
const MAX_PAGES = 20;

/**
 * Nach so vielen aufeinanderfolgenden vergangenen Karten wird abgebrochen.
 *
 * Die Uebersicht listet kommende Termine zuerst und danach die juengste
 * Vergangenheit. Weiterzulesen kostet nur Zeit — und die ist knapp, weil sich
 * alle Quellen die 60 Sekunden der Route teilen. Vier statt einer, damit eine
 * einzelne unlesbare Seite den Lauf nicht vorzeitig beendet.
 *
 * Dass abgebrochen wurde, steht im Protokoll: Kippt die Reihenfolge der
 * Uebersicht irgendwann, fehlten sonst still Termine.
 */
const STOP_AFTER_PAST = 4;

/** Pause zwischen zwei Einzelseiten — wie bei ONE, aus Hoeflichkeit. */
const PAUSE_MS = 200;
const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Parsed = { title: string; date: string; main: string | null; venue: string };

/** "fight card Friday 11 December 2026" -> 2026-12-11 */
function parseDate(text: string): string | null {
  const m = text.match(/fight card\s+\w+day\s+(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/i);
  if (!m) return null;
  const month = monthNumber(m[2]);
  if (month === null) return null;
  return isoDate(Number(m[3]), month, Number(m[1]));
}

/**
 * Die Paarung aus der Kaempferleiste.
 *
 * Aufbau: "Tyson Fury VS W 39 KO 25 L 2 D 1 VS Anthony Joshua W 30 KO 27 …".
 * Die Bilanzen sind das verlaessliche Geruest — an ihnen haengt der Parser,
 * nicht an Layoutklassen. Findet er nichts, bleibt `main` leer und die Karte
 * laeuft unter ihrem Titel; erfunden wird hier nichts.
 */
function parseMain(text: string): string | null {
  const m = text.match(
    /([A-Z][\w'\-.]+(?: [A-Z][\w'\-.]+){0,3}) VS W \d+ KO \d+ L \d+ D \d+ VS ([A-Z][\w'\-.]+(?: [A-Z][\w'\-.]+){0,3}) W \d+/
  );
  return m ? `${m[1]} vs ${m[2]}` : null;
}

/** "principality-stadium" -> "Principality Stadium" */
function titleCase(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Der Austragungsort steckt nur im Ticketlink.
 *
 * events365 baut seine URLs als "…tickets_<stadt>_<halle>_<wochentag>-<tag>-".
 * Beides zusammen ergibt "Principality Stadium, Cardiff" — dieselbe Form
 * "Halle, Stadt", die venueLocality() in lib/events.ts erwartet. Fehlt der
 * Link, bleibt der Ort leer; geraten wird nichts.
 */
function parseVenue(html: string): string {
  const m = html.match(
    /events365\.com\/events\/[^"']*?tickets_([a-z0-9-]+)_([a-z0-9-]+)_/i
  );
  if (!m) return "";
  // Bei US-Orten haengt events365 das Bundesland an die Stadt
  // ("carson-ca"). Es faellt weg, statt als "Carson Ca" stehenzubleiben:
  // venueLocality() in lib/events.ts nimmt den Teil hinter dem letzten Komma
  // als Ortsnamen fuer die Strukturdaten, und das soll die Stadt sein.
  const city = m[1].replace(/-[a-z]{2}$/, "");
  return `${titleCase(m[2])}, ${titleCase(city)}`;
}

function parsePage(html: string): Parsed | null {
  const body = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ");
  const text = textOf(body);

  const date = parseDate(text);
  if (!date) return null;

  const raw = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = raw
    ? textOf(raw[1]).replace(/\s*-\s*Matchroom Boxing\s*$/i, "").trim()
    : "";
  if (!title) return null;

  return { title, date, main: parseMain(text), venue: parseVenue(html) };
}

export const matchroom: EventSource = {
  id: "matchroom",
  label: "Matchroom Boxing",
  home: BASE,

  async load(): Promise<SourceResult> {
    const base = { id: "matchroom", label: "Matchroom Boxing" };

    const listing = await fetchText(LISTING);
    if ("error" in listing) {
      return { ...base, events: [], skipped: [], error: listing.error };
    }

    // Reihenfolge der Uebersicht beibehalten: kommende Karten stehen oben.
    const slugs: string[] = [];
    for (const m of listing.text.matchAll(
      /href="https:\/\/www\.matchroomboxing\.com\/events\/([a-z0-9-]+)/g
    )) {
      if (!slugs.includes(m[1])) slugs.push(m[1]);
    }
    if (slugs.length === 0) {
      return {
        ...base,
        events: [],
        skipped: [],
        error: "Matchroom: keine Event-Links auf der Uebersicht",
      };
    }

    const skip = new SkipLog();
    const now = today();
    const events: SourceEvent[] = [];
    let consecutivePast = 0;
    let visited = 0;

    for (const slug of slugs.slice(0, MAX_PAGES)) {
      if (visited > 0) await pause(PAUSE_MS);
      visited++;

      const url = `${BASE}/events/${slug}/`;
      const page = await fetchText(url);
      if ("error" in page) {
        skip.add("Einzelseite nicht erreichbar", slug);
        continue;
      }
      const parsed = parsePage(page.text);
      if (!parsed) {
        skip.add("Datum oder Titel nicht lesbar", slug);
        continue;
      }
      if (parsed.date < now) {
        skip.add("liegt in der Vergangenheit", parsed.title);
        if (++consecutivePast >= STOP_AFTER_PAST) {
          skip.add(
            `nach ${STOP_AFTER_PAST} vergangenen Karten in Folge abgebrochen ` +
              `(Uebersicht listet kommende zuerst)`,
            `${visited} von ${slugs.length} Seiten geholt`
          );
          break;
        }
        continue;
      }
      consecutivePast = 0;

      if (!parsed.main) skip.add("keine Paarung lesbar, laeuft unter dem Titel", parsed.title);

      events.push({
        slug: slugify(parsed.title),
        date: parsed.date,
        sport: "Boxing",
        // Exakt die Schreibweise, die schon in der Tabelle und in
        // promotionGuides.ts steht — sonst legt der naechste Lauf eine zweite
        // Promotion-Seite an (siehe "Ein Veranstalter, ein Name" in CLAUDE.md).
        promotion: "Matchroom Boxing",
        title: parsed.title,
        // Die Paarung steht auf der Seite, sie wird nicht erfunden. Fehlt sie,
        // bleibt es bei der neutralen Beschreibung.
        main: parsed.main ?? "Boxing card",
        venue: parsed.venue,
        broadcaster: page.text.includes("DAZN") ? "DAZN" : "-",
        note: "Matchroom Boxing card; date and bout from matchroomboxing.com.",
        sourceKey: slug,
        sourceUrl: url,
      });
    }

    if (slugs.length > MAX_PAGES) {
      skip.add(
        `auf ${MAX_PAGES} Einzelseiten begrenzt (Obergrenze fuer die Laufzeit)`,
        `${slugs.length} Karten auf der Uebersicht`
      );
    }

    return { ...base, events, skipped: skip.list(), error: null };
  },
};
