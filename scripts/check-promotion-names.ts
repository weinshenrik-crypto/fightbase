// Faengt zwei Namen fuer dieselbe Organisation, bevor daraus zwei Seiten werden.
//
// Dreimal ist das schon passiert — "IJF" neben "IJF Judo Grand Slam", "WKF"
// neben "WKF Karate 1", "ONE" neben "ONE Championship". Jedes Mal standen
// danach zwei duenne Promotion-Seiten fuer denselben Veranstalter im Netz,
// jedes Mal musste PROMOTION_LINKS doppelt gepflegt werden (und war es nicht:
// die 14 ONE-Zeilen hatten dadurch monatelang keinen Veranstalter-Link), und
// jedes Mal fiel es erst auf, als jemand die Seite benutzt hat.
//
// Der Teil, der ohne Netz laeuft, prueft die Erkennung selbst gegen die drei
// echten Faelle. Danach — nur wenn Zugangsdaten da sind — laeuft dieselbe
// Funktion gegen die laufende Tabelle.
//
//   npx tsx scripts/check-promotion-names.ts

import { promotionNameCollisions } from "../lib/events";

let failures = 0;
const check = (label: string, ok: boolean) => {
  if (!ok) {
    failures++;
    console.error(`FEHLGESCHLAGEN: ${label}`);
  }
};

// --- 1. Die Erkennung selbst, gegen die drei echten Faelle ---

const historical: Array<[string, string]> = [
  ["IJF", "IJF Judo Grand Slam"],
  ["WKF", "WKF Karate 1"],
  ["ONE", "ONE Championship"],
];

for (const [short, long] of historical) {
  const found = promotionNameCollisions([short, long, "GLORY", "UFC"]);
  check(
    `erkennt "${short}" / "${long}"`,
    found.length === 1 && found[0][0] === short && found[0][1] === long
  );
}

// Reihenfolge darf egal sein — sonst haengt der Befund daran, wie die
// Datenbank die Zeilen zurueckgibt.
check(
  "Reihenfolge der Namen ist egal",
  promotionNameCollisions(["ONE Championship", "ONE"]).length === 1
);

// Gleicher Slug bei verschiedener Schreibweise: "K-1" und "K 1" werden beide
// zu "k-1" und wuerden sich dieselbe URL teilen.
check(
  "gleicher Slug wird gefunden",
  promotionNameCollisions(["K-1", "K 1"]).length === 1
);

// --- 2. Was ausdruecklich KEIN Treffer sein darf ---

const distinct = [
  "UFC",
  "GLORY",
  "ONE",
  "IBJJF",
  "IJF",
  "UWW",
  "WKF",
  "ADCC",
  "OKTAGON",
  "K-1",
  "World Taekwondo",
  "Matchroom Boxing",
  "Zuffa Boxing",
  "Queensberry Promotions",
  "Riyadh Season",
  "STEKO'S Fight Night",
  "Phoenix Fighting Championship",
];
const falsePositives = promotionNameCollisions(distinct);
check(
  `verschiedene Veranstalter bleiben ungestoert (${falsePositives.length} Fehlalarme)`,
  falsePositives.length === 0
);
for (const [a, b] of falsePositives) console.error(`  Fehlalarm: ${a} / ${b}`);

// Die Wortgrenze ist der Grund, warum "ONE" nicht alles trifft, was mit
// denselben Buchstaben beginnt.
check(
  "Wortgrenze: ONE trifft nicht Oneida Fight Series",
  promotionNameCollisions(["ONE", "Oneida Fight Series"]).length === 0
);

// Die Tuer fuer Faelle, die wirklich verschieden sind.
check(
  "allowed unterdrueckt ein Paar",
  promotionNameCollisions(
    ["UFC", "UFC Fight Pass Invitational"],
    [["UFC", "UFC Fight Pass Invitational"]]
  ).length === 0
);

// --- 3. Gegen die laufende Tabelle ---
//
// Paare, die trotz gleichem Anfang verschiedene Veranstalter sind, kommen
// hier herein — mit einer Zeile Begruendung, nicht stillschweigend.
const ALLOWED: Array<[string, string]> = [];

async function live() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.log(
      "Hinweis: NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY fehlen — der Teil gegen " +
        "die Datenbank wird uebersprungen."
    );
    return;
  }

  const res = await fetch(`${url}/rest/v1/events?select=promotion`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) {
    failures++;
    console.error(
      `FEHLGESCHLAGEN: Promotions konnten nicht geladen werden (HTTP ${res.status})`
    );
    return;
  }

  const rows = (await res.json()) as Array<{ promotion: string }>;
  const names = Array.from(new Set(rows.map((r) => r.promotion))).sort();
  const hits = promotionNameCollisions(names, ALLOWED);

  check(
    `keine doppelten Promotion-Namen in der Tabelle (${names.length} Namen geprueft)`,
    hits.length === 0
  );
  for (const [a, b] of hits) {
    console.error(`  "${a}" und "${b}" meinen wahrscheinlich dieselbe Organisation.`);
    console.error(
      "  Zusammenlegen wie in supabase/migration-one-promotion.sql, plus eine"
    );
    console.error(
      "  Weiterleitung in next.config.js. Sind sie wirklich verschieden:"
    );
    console.error("  Paar in ALLOWED in dieser Datei eintragen, mit Begruendung.");
  }
}

// Kein Top-Level-await: tsx uebersetzt diese Skripte nach CJS, und dort
// bricht es mit ERR_REQUIRE_ASYNC_MODULE ab.
live().then(() => {
  if (failures > 0) {
    console.error(`\n${failures} Pruefung(en) fehlgeschlagen`);
    process.exit(1);
  }
  console.log("ok — alle Pruefungen bestanden");
});
