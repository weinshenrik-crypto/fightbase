// Prueft die Regeln hinter /admin/social (lib/socialPosts.ts), ohne Netz.
//
//   npx tsx scripts/check-social-posts.ts
//
// Was hier nicht kaputtgehen darf: Kein Text behauptet eine Uhrzeit, die die
// Zeile nicht hat; Turniere werden keine Einzelposts; das Wochenende ist von
// jedem Wochentag aus dasselbe.

import type { FightEvent } from "../lib/events";
import {
  eventCaption,
  hashtags,
  isHighlight,
  pairOf,
  promotionTag,
  weekendCaption,
  weekendOrder,
  weekendRange,
} from "../lib/socialPosts";

let failures = 0;
const check = (label: string, ok: boolean) => {
  if (!ok) {
    failures++;
    console.error(`FEHLGESCHLAGEN: ${label}`);
  }
};

const base: FightEvent = {
  id: "x",
  date: "2026-11-28",
  sport: "Jiu-Jitsu",
  promotion: "IBJJF",
  title: "Paris Fall International Open",
  main: "Gi divisions",
  venue: "",
  broadcaster: "-",
  note: "",
};
const fight: FightEvent = {
  ...base,
  id: "ufc",
  sport: "MMA",
  promotion: "UFC",
  title: "UFC 333",
  main: "Volkanovski vs. Evloev",
  fighters: ["Volkanovski", "Evloev"],
  venue: "Etihad Arena, Abu Dhabi",
};
const matchroom: FightEvent = {
  ...base,
  id: "mr",
  sport: "Boxing",
  promotion: "Matchroom Boxing",
  title: "Walker vs Rocha",
  main: "Conah Walker vs Alexis Rocha",
};

// Wochenende: Mo–Do zeigen aufs kommende, Fr–So aufs laufende.
for (const day of ["2026-11-23", "2026-11-26", "2026-11-27", "2026-11-28", "2026-11-29"]) {
  const r = weekendRange(day);
  check(`Wochenende von ${day}`, r.from === "2026-11-27" && r.to === "2026-11-29");
}
check("Montag danach -> naechstes Wochenende", weekendRange("2026-11-30").from === "2026-12-04");
check("Monatswechsel", weekendRange("2026-12-31").to === "2027-01-03");

// Einzelposts nur fuer Kaempfe.
check("Turnier ist kein Highlight", !isHighlight(base));
check("Paarung ist ein Highlight", isHighlight(fight));
check("Matchroom ohne fighter-Felder ist ein Highlight", isHighlight(matchroom));
check("Matchroom bekommt keine erfundenen Figuren", pairOf(matchroom) === null);
check("Wochenende: Kaempfe zuerst", weekendOrder([base, fight])[0].id === "ufc");

// Keine Uhrzeit ohne startsAt.
check("ohne startsAt keine Zeit (en)", !/Starts:/.test(eventCaption(fight, "en")));
check("ohne startsAt keine Zeit (de)", !/Beginn:/.test(eventCaption(fight, "de")));
const timed = { ...fight, startsAt: "2026-10-24T18:00:00Z", timezone: "Asia/Dubai" };
check("mit startsAt Ortszeit", /Starts: 22:00/.test(eventCaption(timed, "en")));
check("ohne Ort kein leeres Trennzeichen", !/ · \n/.test(eventCaption(base, "en")));

// Hashtags.
check("ONE -> #onechampionship", promotionTag("ONE") === "onechampionship");
check("Umlaute/Leerzeichen", promotionTag("Ström Fight Night") === "stromfightnight");
check("hoechstens 12 Tags", hashtags([base, fight, matchroom]).split(" ").length <= 12);
check("Wochenende nennt alle Events", weekendCaption([base, fight], "de").split("\n").filter((l) => l.startsWith("•")).length === 2);

if (failures) {
  console.error(`${failures} Pruefung(en) fehlgeschlagen.`);
  process.exit(1);
}
console.log("ok — Social-Posts");
