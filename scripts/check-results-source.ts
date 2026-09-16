// Prueft den Wikipedia-Parser fuer Ergebnisse gegen feste Wikitext-Schnipsel.
//
//   npx tsx scripts/check-results-source.ts
//
// Ohne Netz: Die Schnipsel unten stehen hier im Quelltext, entnommen aus
// echten Artikeln (UFC 299, UFC 300). Der Test prueft also den Parser, nicht
// Wikipedias Verfuegbarkeit.
//
// Anlass war ein Fund im September 2026: Bei haeufigen Namen traegt der
// Artikeltitel eine Begriffsklaerung — [[Sean O'Malley (fighter)|Sean O'Malley]].
// Weil cleanName bewusst das Linkziel nimmt und nicht den Anzeigetext (der
// Anzeigetext ist oft nur der Nachname), stand der Zusatz im Namen: Auf der
// Seite waere "Sean O'Malley (fighter)" gegen "Marlon Vera" angetreten.
//
// Der zweite Teil des Fundes ist der heiklere: Die Methode enthaelt regelmaessig
// selbst Klammern ("Decision (unanimous) (50-45, 50-45, 50-44)"). Ein pauschales
// Entfernen von Klammern haette die Ergebnisse stiller beschaedigt als der
// Fehler, den es behebt. Deshalb steht unten eine Pruefung genau dafuer.

import { parseBouts } from "../lib/resultsSource";

let failures = 0;
const check = (label: string, ok: boolean, got?: unknown) => {
  if (!ok) {
    failures++;
    console.error(`FEHLGESCHLAGEN: ${label}${got === undefined ? "" : ` — bekommen: ${JSON.stringify(got)}`}`);
  }
};

/** Ein Bout-Template bauen; die Parameter sind positional, nicht benannt. */
const bout = (...fields: string[]) => `{{MMAevent bout\n|${fields.join("\n|")}\n}}`;

function main() {
  // 1. Der Normalfall aus UFC 300.
  const einfach = parseBouts(
    bout(
      "Light Heavyweight",
      "[[Alex Pereira]] (c)",
      "def.",
      "[[Jamahal Hill]]",
      "KO (punches)",
      "1",
      "3:14",
      "For the title."
    )
  );
  check("ein Kampf wird gelesen", einfach.length === 1, einfach.length);
  check("Paarung", einfach[0]?.bout === "Alex Pereira vs. Jamahal Hill", einfach[0]?.bout);
  check("Sieger steht links", einfach[0]?.winner === "Alex Pereira", einfach[0]?.winner);
  check("Methode", einfach[0]?.method === "KO (punches)", einfach[0]?.method);
  check("Runde", einfach[0]?.round === 1, einfach[0]?.round);
  check("Zeit", einfach[0]?.end_time === "3:14", einfach[0]?.end_time);
  check("(c) faellt aus dem Namen", !einfach[0]?.bout.includes("(c)"), einfach[0]?.bout);

  // 2. Der Fund: Begriffsklaerung im Linkziel.
  const disambig = parseBouts(
    bout(
      "Bantamweight",
      "[[Sean O'Malley (fighter)|Sean O'Malley]] (c)",
      "def.",
      "[[Marlon Vera]]",
      "Decision (unanimous) (50–45, 50–45, 50–44)",
      "5",
      "5:00",
      ""
    )
  );
  check(
    "Begriffsklaerung faellt weg",
    disambig[0]?.bout === "Sean O'Malley vs. Marlon Vera",
    disambig[0]?.bout
  );
  check(
    "Sieger ebenfalls ohne Zusatz",
    disambig[0]?.winner === "Sean O'Malley",
    disambig[0]?.winner
  );
  // Die Gegenprobe zum Fix: Klammern in der Methode muessen bleiben.
  check(
    "Klammern in der Methode bleiben stehen",
    disambig[0]?.method === "Decision (unanimous) (50–45, 50–45, 50–44)",
    disambig[0]?.method
  );

  // 3. Linkziel schlaegt Anzeigetext — so ist es gewollt, der Anzeigetext ist
  //    oft nur der Nachname.
  const pipe = parseBouts(
    bout("Flyweight", "[[Joshua Van|Van]]", "def.", "[[Bruno Silva (flyweight)|Bruno Silva]]", "Decision", "3", "5:00", "")
  );
  check("voller Name aus dem Linkziel", pipe[0]?.bout === "Joshua Van vs. Bruno Silva", pipe[0]?.bout);

  // 4. Noch nicht ausgetragen: "vs." statt "def." — nichts liefern, nichts raten.
  const offen = parseBouts(
    bout("Heavyweight", "[[Jon Jones]]", "vs.", "[[Tom Aspinall]]", "", "", "", "")
  );
  check("unausgewerteter Kampf liefert nichts", offen.length === 0, offen.length);

  // 5. Fussnoten raus.
  const ref = parseBouts(
    bout("Welterweight", "[[Belal Muhammad]]<ref name=\"card\"/>", "def.", "[[Leon Edwards]]", "Decision", "5", "5:00", "")
  );
  check("Fussnote faellt weg", ref[0]?.bout === "Belal Muhammad vs. Leon Edwards", ref[0]?.bout);

  // 6. Mehrere Kaempfe, Reihenfolge und Nummerierung.
  const zwei = parseBouts(
    bout("A", "[[Eins]]", "def.", "[[Zwei]]", "KO", "1", "1:00", "") +
      "\nDazwischen steht Fliesstext.\n" +
      bout("B", "[[Drei]]", "def.", "[[Vier]]", "Submission", "2", "2:00", "")
  );
  check("zwei Kaempfe", zwei.length === 2, zwei.length);
  check("Reihenfolge bleibt", zwei[0]?.winner === "Eins" && zwei[1]?.winner === "Drei");
  check("Positionen 1 und 2", zwei[0]?.position === 1 && zwei[1]?.position === 2, [zwei[0]?.position, zwei[1]?.position]);

  // 7. Ein Artikel ohne Template ist kein Fehler, nur leer.
  check("Artikel ohne Bouts liefert []", parseBouts("Ein Artikel ganz ohne Kampftabelle.").length === 0);

  // 8. Template mit verschachteltem Template darf den Trenner nicht verlieren.
  const nested = parseBouts(
    bout("Lightweight", "[[Islam Makhachev]]", "def.", "[[Dustin Poirier]]", "Submission {{small|(D'Arce choke)}}", "5", "2:42", "")
  );
  check("verschachteltes Template bricht das Zerlegen nicht", nested.length === 1, nested.length);
  check("Sieger trotz Verschachtelung", nested[0]?.winner === "Islam Makhachev", nested[0]?.winner);

  if (failures > 0) {
    console.error(`\n${failures} Pruefung(en) fehlgeschlagen`);
    process.exit(1);
  }
  console.log("ok — alle Pruefungen bestanden");
}

main();
