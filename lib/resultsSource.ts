// Ergebnisse zu einem gelaufenen Event holen.
//
// Warum Wikipedia und nicht die Promotions selbst: jede Promotion veröffentlicht
// ihre Ergebnisse in einem eigenen Format, teils nur als Fließtext in einem
// News-Artikel. Zehn Promotions wären zehn Parser, die bei jedem Redesign
// brechen. Die englische Wikipedia dagegen benutzt für Kampfsport-Events ein
// einheitliches Template, und das ist über Jahre stabil:
//
//   {{MMAevent bout
//   |Flyweight                 <- Gewichtsklasse
//   |[[Joshua Van]] (c)        <- Kämpfer links
//   |def.                      <- vor dem Event "vs.", danach "def."
//   |[[Alexandre Pantoja]]     <- Kämpfer rechts
//   |KO (punches)              <- Methode
//   |2                         <- Runde
//   |3:24                      <- Zeit
//   |For the title.            <- Anmerkung
//   }}
//
// Der Gewinner steht links, sobald das Trennfeld "def." lautet. Solange dort
// "vs." steht, ist der Kampf nicht ausgewertet — dann liefert diese Datei
// bewusst nichts, statt einen Sieger zu raten.
//
// Grenze dieser Quelle: sie deckt ab, was einen Wikipedia-Artikel hat. Für UFC
// und die großen MMA-Karten ist das praktisch lückenlos, für kleinere
// Veranstalter wie GLORY oder regionale Kickbox-Events gibt es keine Artikel.
// Deren Ergebnisse bleiben Handarbeit.

export type ParsedBout = {
  position: number;
  bout: string;
  winner: string | null;
  method: string | null;
  round: number | null;
  end_time: string | null;
  note: string;
};

const API = "https://en.wikipedia.org/w/api.php";

// Wikipedia bittet ausdrücklich um einen aussagekräftigen User-Agent mit
// Kontaktmöglichkeit; anonyme Bots werden sonst gedrosselt.
const UA = "Fightbase/1.0 (https://fightbase.io; weinshenrik@gmail.com)";

/** Wikitext eines Artikels, oder null wenn es ihn nicht gibt. */
export async function fetchWikitext(title: string): Promise<string | null> {
  const url =
    `${API}?action=query&prop=revisions&rvprop=content&rvslots=main` +
    `&format=json&formatversion=2&redirects=1&titles=${encodeURIComponent(title)}`;

  const res = await fetch(url, {
    headers: { "User-Agent": UA },
    cache: "no-store",
  });
  if (!res.ok) return null;

  const data = await res.json();
  const page = data?.query?.pages?.[0];
  if (!page || page.missing) return null;
  return page.revisions?.[0]?.slots?.main?.content ?? null;
}

/** [[Joshua Van|Van]] (c) -> Joshua Van. Links, Fett und Fußnoten raus. */
function cleanName(raw: string): string {
  return raw
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/g, "")
    .replace(/<ref[^>]*\/>/g, "")
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$1")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/'''?/g, "")
    .replace(/\{\{[^}]*\}\}/g, "")
    .replace(/\s*\((?:c|ic)\)\s*/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Zerlegt die Bout-Templates eines Artikels.
 *
 * Die Parameter sind positional, nicht benannt — deshalb wird auf oberster
 * Ebene an "|" getrennt und dabei mitgezählt, ob wir gerade innerhalb eines
 * [[Links]] oder eines verschachtelten {{Templates}} stehen. Ein naives
 * split("|") würde an Links wie [[Choi Doo-ho|Doo Ho Choi]] auseinanderfallen.
 */
export function parseBouts(wikitext: string): ParsedBout[] {
  const bouts: ParsedBout[] = [];
  const marker = "{{MMAevent bout";
  let from = 0;

  while (true) {
    const start = wikitext.indexOf(marker, from);
    if (start === -1) break;

    let depth = 0;
    let end = -1;
    for (let i = start; i < wikitext.length - 1; i++) {
      if (wikitext[i] === "{" && wikitext[i + 1] === "{") {
        depth++;
        i++;
      } else if (wikitext[i] === "}" && wikitext[i + 1] === "}") {
        depth--;
        i++;
        if (depth === 0) {
          end = i + 1;
          break;
        }
      }
    }
    if (end === -1) break;
    from = end;

    const body = wikitext.slice(start + marker.length, end - 2);
    const parts: string[] = [];
    let buf = "";
    let link = 0;
    let tmpl = 0;
    for (let i = 0; i < body.length; i++) {
      const two = body.slice(i, i + 2);
      if (two === "[[") link++;
      else if (two === "]]") link--;
      else if (two === "{{") tmpl++;
      else if (two === "}}") tmpl--;

      if (body[i] === "|" && link <= 0 && tmpl <= 0) {
        parts.push(buf);
        buf = "";
      } else {
        buf += body[i];
      }
    }
    parts.push(buf);

    // parts[0] ist der Rest vor dem ersten "|" (leer). Danach positional:
    // 1 Gewichtsklasse, 2 links, 3 Trenner, 4 rechts, 5 Methode, 6 Runde,
    // 7 Zeit, 8 Anmerkung.
    const f = (n: number) => (parts[n] ?? "").trim();
    const left = cleanName(f(2));
    const sep = cleanName(f(3)).toLowerCase();
    const right = cleanName(f(4));
    if (!left || !right) continue;

    // "vs." heißt: noch nicht ausgewertet. Nichts zurückgeben ist hier richtig.
    const decided = sep.startsWith("def");
    if (!decided) continue;

    const method = cleanName(f(5)) || null;
    const roundRaw = cleanName(f(6));
    const round = /^\d+$/.test(roundRaw) ? Number(roundRaw) : null;
    const time = cleanName(f(7)) || null;
    const weight = cleanName(f(1));
    const note = cleanName(f(8));

    bouts.push({
      position: 0, // wird unten vergeben
      bout: `${left} vs. ${right}`,
      winner: left,
      method,
      round,
      end_time: time,
      note: [weight, note].filter(Boolean).join(" · "),
    });
  }

  // Wikipedia listet die Hauptkarte zuerst, also entspricht die Reihenfolge im
  // Artikel bereits der Kartenreihenfolge. position 1 ist der Hauptkampf.
  return bouts.map((b, i) => ({ ...b, position: i + 1 }));
}

/**
 * Titelkandidaten für ein Event. Wikipedia benennt Karten unterschiedlich:
 * "UFC 331", aber "UFC Fight Night: Smith vs. Jones". Der Eventtitel aus der
 * Datenbank enthält oft schon das Matchup, das hier abgeschnitten wird.
 */
export function titleCandidates(title: string, promotion: string): string[] {
  const withoutMatchup = title.split(":")[0].trim();
  const candidates = [title, withoutMatchup];

  // "OKTAGON 93: Roušal vs. Mågård" -> auch "OKTAGON 93" allein versuchen.
  const numbered = title.match(/^([A-Za-z ]+\s\d+)/);
  if (numbered) candidates.push(numbered[1].trim());

  if (promotion && !title.toLowerCase().startsWith(promotion.toLowerCase())) {
    candidates.push(`${promotion} ${withoutMatchup}`);
  }

  return Array.from(new Set(candidates.filter(Boolean)));
}
