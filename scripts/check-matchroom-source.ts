// Prueft die Matchroom-Quelle gegen ein gestubbtes fetch — ohne Netz.
//
//   npx tsx scripts/check-matchroom-source.ts
//
// Warum diese Quelle einen eigenen Test braucht:
//
// 1. Sie liest **Fliesstext**, keine Strukturdaten. IBJJF liefert JSON, ONE
//    einen ld+json-Block; Matchroom gibt nur "fight card Friday 11 December
//    2026" und eine Kaempferleiste her. Ein Layoutwechsel dort faellt sonst
//    niemandem auf: Die Quelle meldet brav "0 neue Events".
//
// 2. Sie ist die erste Quelle **ohne Austragungsort**. Der Ort steht nur im
//    Ticketlink, und bei den meisten Karten gar nicht. Dass ein leerer Ort
//    durchgeht, ein erfundener aber nicht, ist hier die halbe Miete.
//
// 3. Sie **bricht vorzeitig ab**, sobald vier vergangene Karten in Folge
//    kommen. Kippt die Reihenfolge der Uebersichtsseite, wuerde sie sonst
//    still die Haelfte der Termine verlieren.

import { matchroom } from "../lib/eventSources/matchroom";

let failures = 0;
const check = (label: string, ok: boolean) => {
  if (!ok) { failures++; console.error(`FEHLGESCHLAGEN: ${label}`); }
};

type Card = {
  slug: string;
  name?: string;
  /** Wie es im Text steht, z.B. "11 December 2099". */
  when?: string;
  pair?: [string, string] | null;
  /** events365-Stadt-Slug, z.B. "cardiff" oder "carson-ca". */
  city?: string;
  venueSlug?: string;
  dazn?: boolean;
  broken?: boolean;
};

const FUTURE = "11 December 2099";
const PAST = "11 December 2000";

function eventPage(c: Card): string {
  if (c.broken) return "<html><head><title>Kaputt - Matchroom Boxing</title></head><body></body></html>";
  const pair = c.pair === null
    ? ""
    : `${(c.pair ?? ["Tyson Fury", "Anthony Joshua"])[0]} VS W 39 KO 25 L 2 D 1 VS ` +
      `${(c.pair ?? ["Tyson Fury", "Anthony Joshua"])[1]} W 30 KO 27 L 4 D 0`;
  const ticket = c.city
    ? `<a href="https://www.events365.com/events/x-tickets_${c.city}_${c.venueSlug ?? "principality-stadium"}_friday-11-december-a">Tickets</a>`
    : "";
  const dazn = c.dazn === false ? "" : "<a href=\"http://www.dazn.com\">Watch on DAZN</a>";
  return [
    `<html><head><title>${c.name ?? "Fury vs Joshua"} - Matchroom Boxing</title></head><body>`,
    `<p>fight card Friday ${c.when ?? FUTURE}</p>`,
    `<p>${pair}</p>`,
    ticket,
    dazn,
    "</body></html>",
  ].join("");
}

function listing(cards: Card[]): string {
  return cards
    .map((c) => `<a href="https://www.matchroomboxing.com/events/${c.slug}/">Karte</a>`)
    .join("");
}

let fetched: string[] = [];
function serve(cards: Card[], opts: { listingOk?: boolean; pageOk?: boolean } = {}) {
  const { listingOk = true, pageOk = true } = opts;
  fetched = [];
  const bySlug = new Map(cards.map((c) => [c.slug, c]));
  globalThis.fetch = (async (url: string) => {
    const u = String(url);
    if (/\/events\/?$/.test(u.replace(/\?.*$/, ""))) {
      return { ok: listingOk, status: listingOk ? 200 : 503, text: async () => listing(cards) };
    }
    const slug = u.match(/\/events\/([^/]+)\//)?.[1] ?? "";
    fetched.push(slug);
    const c = bySlug.get(slug);
    return {
      ok: pageOk,
      status: pageOk ? 200 : 500,
      text: async () => (c ? eventPage(c) : "<html></html>"),
    };
  }) as unknown as typeof fetch;
}

const reasons = (r: { skipped: { reason: string }[] }) => r.skipped.map((s) => s.reason).join(" | ");

async function main() {
  // 1. Normalfall
  serve([{ slug: "fury-vs-joshua", city: "cardiff" }]);
  const r1 = await matchroom.load();
  const e1 = r1.events[0];
  check("eine Karte wird gelesen", r1.events.length === 1 && r1.error === null);
  check("Datum aus dem Fliesstext", e1?.date === "2099-12-11");
  check("Titel ohne ' - Matchroom Boxing'", e1?.title === "Fury vs Joshua");
  check("Paarung aus der Kaempferleiste", e1?.main === "Tyson Fury vs Anthony Joshua");
  check("Ort aus dem Ticketlink", e1?.venue === "Principality Stadium, Cardiff");
  check("Sender DAZN", e1?.broadcaster === "DAZN");
  check("Sportart Boxing", e1?.sport === "Boxing");
  // Schreibweise exakt wie in der Tabelle — sonst entsteht eine zweite
  // Promotion-Seite (siehe "Ein Veranstalter, ein Name" in CLAUDE.md).
  check("Veranstalter 'Matchroom Boxing'", e1?.promotion === "Matchroom Boxing");
  check("Slug aus dem Titel", e1?.slug === "fury-vs-joshua");
  check("sourceKey ist der Matchroom-Slug", e1?.sourceKey === "fury-vs-joshua");
  check("sourceUrl zeigt auf die Karte", e1?.sourceUrl === "https://www.matchroomboxing.com/events/fury-vs-joshua/");
  // Matchroom nennt keine Anfangszeiten. Taucht hier eine auf, kommt sie aus
  // einem Fehlgriff — und wuerde in der Tabelle als belegte Zeit landen.
  check("keine erfundene Anfangszeit", e1?.startsAt === undefined && e1?.timezone === undefined);

  // 2. US-Ort: das Bundesland am Stadt-Slug faellt weg
  serve([{ slug: "pacheco-vs-fulghum", city: "carson-ca", venueSlug: "dignity-health-sports-park" }]);
  const r2 = await matchroom.load();
  check("Bundesland wird abgeschnitten", r2.events[0]?.venue === "Dignity Health Sports Park, Carson");

  // 3. Ohne Ticketlink bleibt der Ort leer — und wird nicht geraten
  serve([{ slug: "walker-vs-rocha" }]);
  const r3 = await matchroom.load();
  check("ohne Ticketlink kein Ort", r3.events.length === 1 && r3.events[0].venue === "");

  // 4. Ohne lesbare Paarung laeuft die Karte unter ihrem Titel
  serve([{ slug: "bivol-vs-smith", name: "Bivol vs Smith", pair: null }]);
  const r4 = await matchroom.load();
  check("ohne Paarung neutrale Beschreibung", r4.events[0]?.main === "Boxing card");
  check("fehlende Paarung wird gemeldet", /keine Paarung/.test(reasons(r4)));

  // 5. Kein DAZN-Hinweis -> kein erfundener Sender
  serve([{ slug: "x-vs-y", dazn: false }]);
  check("ohne Hinweis kein Sender", (await matchroom.load()).events[0]?.broadcaster === "-");

  // 6. Vergangene Karte faellt raus
  serve([{ slug: "alt", when: PAST }, { slug: "neu" }]);
  const r6 = await matchroom.load();
  check("vergangene Karte faellt raus", r6.events.length === 1 && r6.events[0].slug === "fury-vs-joshua");

  // 7. Unmoegliches Datum darf nicht still zum 3. Maerz werden
  serve([{ slug: "kaputt", when: "31 February 2099" }]);
  const r7 = await matchroom.load();
  check("31. Februar wird verworfen", r7.events.length === 0 && /nicht lesbar/.test(reasons(r7)));

  // 8. Abbruch nach vier vergangenen Karten in Folge — und zwar gemeldet
  const many: Card[] = [
    { slug: "kommend" },
    ...Array.from({ length: 6 }, (_, i) => ({ slug: `alt-${i}`, when: PAST })),
    { slug: "weit-hinten" },
  ];
  serve(many);
  const r8 = await matchroom.load();
  check("bricht nach vier vergangenen ab", fetched.length === 5);
  check("Abbruch steht im Protokoll", /abgebrochen/.test(reasons(r8)));
  check("die kommende Karte davor ist drin", r8.events.length === 1);

  // 9. Uebersicht nicht erreichbar -> Fehler, nicht "0 Events"
  serve([{ slug: "a" }], { listingOk: false });
  const r9 = await matchroom.load();
  check("unerreichbare Uebersicht ist ein Fehler", !!r9.error && r9.events.length === 0);

  // 10. Uebersicht ohne Links -> ebenfalls ein Fehler
  serve([]);
  const r10 = await matchroom.load();
  check("leere Uebersicht ist ein Fehler", !!r10.error);

  // 11. Einzelseite kaputt: gemeldet, die uebrigen laufen weiter
  serve([{ slug: "kaputt", broken: true }, { slug: "gut" }]);
  const r11 = await matchroom.load();
  check("kaputte Seite reisst den Lauf nicht mit", r11.events.length === 1);
  check("kaputte Seite wird gemeldet", /nicht lesbar/.test(reasons(r11)));

  // 12. Einzelseiten nicht erreichbar
  serve([{ slug: "a" }], { pageOk: false });
  const r12 = await matchroom.load();
  check("unerreichbare Einzelseite wird gemeldet", r12.events.length === 0 && /nicht erreichbar/.test(reasons(r12)));

  // 13. Obergrenze der Abrufe wird gemeldet
  serve(Array.from({ length: 25 }, (_, i) => ({ slug: `k-${i}` })));
  const r13 = await matchroom.load();
  check("Obergrenze greift", fetched.length === 20);
  check("Obergrenze steht im Protokoll", /begrenzt/.test(reasons(r13)));

  if (failures > 0) {
    console.error(`\n${failures} Pruefung(en) fehlgeschlagen`);
    process.exit(1);
  }
  console.log("ok — alle Pruefungen bestanden");
}
main();
