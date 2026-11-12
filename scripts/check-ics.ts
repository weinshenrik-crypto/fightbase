// Prueft die Kalenderdateien, die lib/ics.ts erzeugt. Ohne Netz.
//
//   npx tsx scripts/check-ics.ts
//
// Anlass: Kalender sind beim Einlesen streng. Ein einziges falsch escaptes
// Komma oder eine mitten in einem Umlaut gefaltete Zeile reicht, damit
// Apple-Kalender oder Outlook das ganze Abo verwerfen — und niemand merkt es,
// weil der Feed im Browser normal aussieht. Ausserdem haelt der Test die
// Regeln aus der Spec fest: keine geratene Uhrzeit, stabile UID, keine
// Erinnerung bei ganztaegigen Terminen.

import {
  buildCalendar,
  escapeText,
  eventToVevent,
  foldLine,
  googleEventUrl,
  googleSubscribeUrl,
  webcalUrl,
} from "../lib/ics";
import { personalFeed } from "../lib/personalFeed";
import { eventMatchesFavorite } from "../lib/favorites";
import type { FightEvent } from "../lib/events";

let failures = 0;
const check = (label: string, ok: boolean) => {
  if (!ok) {
    failures++;
    console.error(`FEHLGESCHLAGEN: ${label}`);
  }
};

const NOW = new Date("2026-12-01T12:00:00.000Z");

const fight: FightEvent = {
  id: "one-fight-night-40",
  date: "2026-12-06",
  sport: "Muay Thai",
  promotion: "ONE",
  title: "ONE Fight Night 40",
  main: "Rodtang vs. Haggerty",
  fighters: ["Rodtang", "Haggerty"],
  venue: "Lumpinee Stadium, Bangkok",
  broadcaster: "Prime Video",
  note: "",
  startsAt: "2026-12-06T23:30:00.000Z",
  timezone: "Asia/Bangkok",
};

const tournament: FightEvent = {
  id: "ibjjf-european-2026",
  date: "2026-12-31",
  sport: "Jiu-Jitsu",
  promotion: "IBJJF",
  title: "European Open, Lisboa",
  main: "Gi divisions",
  venue: "",
  broadcaster: "",
  note: "",
};

const unfold = (s: string) => s.replace(/\r\n /g, "");

// --- escapeText -----------------------------------------------------------
check("escapeText", escapeText("a,b;c\\d\ne") === "a\\,b\\;c\\\\d\\ne");

// --- foldLine -------------------------------------------------------------
{
  const line = "X:" + "ä".repeat(60) + "🥊".repeat(10);
  const folded = foldLine(line);
  const parts = folded.split("\r\n");
  check(
    "foldLine: jede Teilzeile hat hoechstens 75 Byte",
    parts.every((p) => Buffer.byteLength(p, "utf8") <= 75)
  );
  check("foldLine: Entfalten ergibt die Eingabe", unfold(folded) === line);
  check(
    "foldLine: keine Teilzeile endet mitten in einem Code-Point",
    parts.every((p) => !p.includes("�"))
  );
  check("foldLine: kurze Zeile bleibt unveraendert", foldLine("A:b") === "A:b");
}

// --- Event mit Uhrzeit ----------------------------------------------------
{
  const lines = eventToVevent(fight, NOW);
  const text = unfold(lines.join("\r\n"));
  check("mit Uhrzeit: DTSTART in UTC", lines.includes("DTSTART:20261206T233000Z"));
  check("mit Uhrzeit: DTEND drei Stunden spaeter", lines.includes("DTEND:20261207T023000Z"));
  check("mit Uhrzeit: VALARM vorhanden", lines.includes("BEGIN:VALARM"));
  check("mit Uhrzeit: eine Stunde vorher", lines.includes("TRIGGER:-PT1H"));
  check("mit Uhrzeit: Ende als geschaetzt markiert", /DESCRIPTION:.*End time estimated/.test(text));
  check("Kampf: SUMMARY ist die Paarung", lines.includes("SUMMARY:Rodtang vs. Haggerty"));
  check("Ort wird escapt", lines.includes("LOCATION:Lumpinee Stadium\\, Bangkok"));
  check("UID", lines.includes("UID:one-fight-night-40@fightbase.io"));
  check("URL", lines.includes("URL:https://fightbase.io/events/one-fight-night-40"));
  check(
    "UID stabil ueber Aufrufe",
    eventToVevent(fight, new Date()).includes("UID:one-fight-night-40@fightbase.io")
  );
}

// --- Event ohne Uhrzeit ---------------------------------------------------
{
  const lines = eventToVevent(tournament, NOW);
  check("ohne Uhrzeit: ganztaegig", lines.includes("DTSTART;VALUE=DATE:20261231"));
  check("ohne Uhrzeit: Ende ist der Folgetag (Jahreswechsel)", lines.includes("DTEND;VALUE=DATE:20270101"));
  check("ohne Uhrzeit: kein VALARM", !lines.includes("BEGIN:VALARM"));
  check("ohne Uhrzeit: nichts geschaetzt", !lines.join("\n").includes("estimated"));
  check("leerer Ort: keine LOCATION", !lines.some((l) => l.startsWith("LOCATION")));
  check("Turnier: SUMMARY ist der Name", lines.includes("SUMMARY:European Open\\, Lisboa"));
}

// --- buildCalendar --------------------------------------------------------
{
  const empty = buildCalendar([], "Fightbase · Test", NOW);
  check("leer: VCALENDAR", empty.includes("BEGIN:VCALENDAR\r\n") && empty.includes("END:VCALENDAR\r\n"));
  check("leer: Name", unfold(empty).includes("X-WR-CALNAME:Fightbase · Test\r\n"));
  check("leer: Refresh", empty.includes("REFRESH-INTERVAL;VALUE=DURATION:PT6H\r\n"));
  check("leer: TTL", empty.includes("X-PUBLISHED-TTL:PT6H\r\n"));
  check("leer: kein VEVENT", !empty.includes("BEGIN:VEVENT"));
  check(
    "jede Zeile endet mit CRLF",
    empty.endsWith("\r\n") && !empty.replace(/\r\n/g, "").includes("\n")
  );

  const old8 = { ...tournament, id: "old8", date: "2026-11-23" };
  const old6 = { ...tournament, id: "old6", date: "2026-11-25" };
  const cal = buildCalendar([old8, old6, fight], "X", NOW);
  check("8 Tage alt: fehlt", !cal.includes("UID:old8@"));
  check("6 Tage alt: enthalten", cal.includes("UID:old6@"));
  check("kommend: enthalten", cal.includes("UID:one-fight-night-40@"));
  check(
    "jede Zeile hoechstens 75 Byte",
    cal.split("\r\n").every((l) => Buffer.byteLength(l, "utf8") <= 75)
  );
}

// --- Einzeltermin und Platzhalter ---------------------------------------
{
  const old = { ...tournament, id: "old", date: "2026-01-10" };
  const single = buildCalendar([old], "X", NOW, { allDates: true });
  check("allDates: altes Event enthalten", single.includes("UID:old@"));
  check("DTSTAMP ist jetzt, nicht der Eventtag", single.includes("DTSTAMP:20261201T120000Z"));
  const dash = eventToVevent({ ...fight, broadcaster: "-" }, NOW);
  check("Sender-Platzhalter '-' nicht in der Beschreibung", !unfold(dash.join("\r\n")).includes("\\n-\\n"));
}

// --- Google-Link ----------------------------------------------------------
{
  const withTime = new URL(googleEventUrl(fight)).searchParams;
  check("Google mit Uhrzeit: dates", withTime.get("dates") === "20261206T233000Z/20261207T023000Z");
  check("Google: action", withTime.get("action") === "TEMPLATE");
  check("Google: text", withTime.get("text") === "Rodtang vs. Haggerty");
  check("Google: location", withTime.get("location") === "Lumpinee Stadium, Bangkok");
  check("Google: Link im Text", (withTime.get("details") ?? "").includes("https://fightbase.io/events/one-fight-night-40"));
  const allDay = new URL(googleEventUrl(tournament)).searchParams;
  check("Google ohne Uhrzeit: dates", allDay.get("dates") === "20261231/20270101");
  check("Google leerer Ort: kein location", !allDay.has("location"));
}

// --- Favoriten ------------------------------------------------------------
{
  check("Fav Sportart", eventMatchesFavorite(fight, { type: "sport", value: "Muay Thai" }));
  check("Fav Promotion", eventMatchesFavorite(fight, { type: "promotion", value: "ONE" }));
  check("Fav Event", eventMatchesFavorite(fight, { type: "event", value: "one-fight-night-40" }));
  check("Fav Fighter", eventMatchesFavorite(fight, { type: "fighter", value: "Rodtang" }));
  check("Fav fremder Fighter", !eventMatchesFavorite(fight, { type: "fighter", value: "Nobody" }));
  check("Fav Turnier ohne Paarung", !eventMatchesFavorite(tournament, { type: "fighter", value: "Rodtang" }));
  check("Fav unbekannter Typ", !eventMatchesFavorite(fight, { type: "weird", value: "ONE" }));
}

// --- Abo-Links (Review I2) -----------------------------------------------
{
  const pub = "/api/calendar/sport/judo.ics";
  check("webcal oeffentlich", webcalUrl(pub) === "webcal://fightbase.io/api/calendar/sport/judo.ics");
  // Google macht aus webcal:// ein http://, Vercel antwortet darauf mit 308,
  // und Googles Abrufdienst folgt der Umleitung nicht ("URL ueberpruefen").
  // Deshalb bekommt Google immer die https-Adresse.
  for (const path of [pub, "/api/calendar/u/abc.ics"]) {
    const cid = new URL(googleSubscribeUrl(path)).searchParams.get("cid");
    check(`Google-Abo ueber https (${path})`, cid === `https://fightbase.io${path}`);
  }
}

// --- Persoenlicher Feed: Datenbankfehler (Review I1) ----------------------
// Ein leerer 200-Feed bei einem DB-Fehler loescht beim naechsten Abruf alle
// Termine aus dem Kalender. Bei Fehlern muss 503 kommen — dann behalten
// Kalender ihre letzte gute Fassung.
async function feedChecks() {
  const ok = { data: [{ type: "sport", value: "Muay Thai" }], error: null };
  const boom = { data: null, error: { message: "timeout" } };
  const user = { data: { user_id: "u1" }, error: null };

  const r1 = await personalFeed({ lookupToken: async () => user, loadFavorites: async () => boom, events: [fight], now: NOW });
  check(`Favoriten-Fehler -> 503 (war ${r1.status})`, r1.status === 503);

  const r2 = await personalFeed({ lookupToken: async () => boom, loadFavorites: async () => ok, events: [fight], now: NOW });
  check(`Token-Abfrage-Fehler -> 503 (war ${r2.status})`, r2.status === 503);

  const r3 = await personalFeed({ lookupToken: async () => ({ data: null, error: null }), loadFavorites: async () => ok, events: [fight], now: NOW });
  check(`unbekannter Token -> 404 (war ${r3.status})`, r3.status === 404);

  const r4 = await personalFeed({ lookupToken: async () => user, loadFavorites: async () => ok, events: [fight, tournament], now: NOW });
  check("gueltig -> 200 mit passendem Event", r4.status === 200 && !!r4.body?.includes("UID:one-fight-night-40@") && !r4.body?.includes("UID:ibjjf-european-2026@"));
}

feedChecks().then(() => {
  if (failures > 0) {
    console.error(`\n${failures} Pruefung(en) fehlgeschlagen.`);
    process.exit(1);
  }
  console.log("ICS: alle Pruefungen bestanden.");
});
