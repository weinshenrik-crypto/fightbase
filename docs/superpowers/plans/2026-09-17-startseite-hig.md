# Startseite nach HIG-Foundations — Implementierungsplan

> **Für agentische Ausführung:** ERFORDERLICHE SUB-SKILL: `superpowers:subagent-driven-development` (empfohlen) oder `superpowers:executing-plans`, um diesen Plan Aufgabe für Aufgabe umzusetzen. Die Schritte nutzen Checkbox-Syntax (`- [ ]`) zur Nachverfolgung.

**Ziel:** Die Startseite von fightbase.io so umbauen, dass auf dem Handy beim ersten Blick Events sichtbar sind und keine Textfarbe mehr unter WCAG AA liegt — ohne die Marke anzufassen.

**Vorgehen:** Vier Aufgaben in der Reihenfolge des `apple-design`-Skills — erst Barrierefreiheit, dann Trefferflächen, dann Layout, dann Motion. Aufgabe 1 schließt das Token-System und sichert es mit einem Prüfskript in der CI ab, damit derselbe Fehler nicht zurückkommt. Die Aufgaben 2 bis 4 sind Layout-Arbeit und werden im Browser nachgemessen, nicht nach Gefühl beurteilt.

**Tech-Stack:** Next.js 16 (App Router, `--webpack`), React Client Component, Tailwind mit eigenen Farb-Tokens, TypeScript. Kein Testframework — das Projekt prüft mit eigenständigen `tsx`-Skripten unter `scripts/`, die in `.github/workflows/ci.yml` laufen.

**Spec:** `docs/superpowers/specs/2026-09-17-startseite-hig-design.md`

**Branch:** `claude/startseite-hig-redesign`

## Globale Randbedingungen

Diese gelten für **jede** Aufgabe:

- **Marke bleibt unverändert.** Dark-only. Oswald für Headlines, Inter für Fließtext. Akzent `#C1272D`, Akzent-Text `#DD555B`. Kein Light-Mode, kein Apple-Systemlook.
- **Keine rohen Hex-Werte in Tailwind-Klassen.** `[#xxxxxx]` ist im JSX verboten (CLAUDE.md). Markenfarben fremder Anbieter als String (`"#4285F4"`) bleiben erlaubt.
- **Neue UI-Strings immer in beiden Sprachen.** `HomeClient.tsx` hat ein `STRINGS`-Objekt mit `en` und `de`. Ein Eintrag nur in einer Sprache ist ein Fehler.
- **Kein `useEffect`, der nach dem Mount `setState` ruft.** Browser-Zustand kommt über `lib/clientStore.ts` und `useSyncExternalStore`. Die ESLint-Regel `react-hooks/set-state-in-effect` blockiert die CI.
- **Nach jeder Aufgabe müssen laufen:** `npx tsc --noEmit` und `npm run lint`, beide fehlerfrei.
- **Nichts nach `main` pushen.** Alles bleibt auf `claude/startseite-hig-redesign`, bis Henrik den Vercel-Preview abgenommen hat. Ein Push auf `main` ist sofort auch in der Android-App live.

## Dateiübersicht

| Datei | Verantwortung | Aufgabe |
|---|---|---|
| `scripts/check-design-tokens.ts` | **neu** — prüft statisch: keine rohen Hex in Tailwind-Klassen, jede Textfarbe erreicht AA | 1 |
| `.github/workflows/ci.yml` | ändern — neues Prüfskript registrieren | 1 |
| `tailwind.config.ts` | ändern — Token `borderStrong` ergänzen | 1 |
| `app/HomeClient.tsx` | ändern — Farben, Trefferflächen, Kopfbereich, klebende Zeile | 1–4 |
| `app/api/cron/notify/route.ts` | ändern — `#5A5A5E` in der E-Mail ersetzen | 1 |
| `app/sport/[sport]/page.tsx` | ändern — ein `#2E2E30` | 1 |
| `app/promotion/[promotion]/page.tsx` | ändern — ein `#2E2E30` | 1 |
| `app/events/[id]/page.tsx` | ändern — ein `#2E2E30` | 1 |

**Anmerkung zur Abweichung vom Spec:** Das Spec nennt als Fläche nur die Startseite. Die drei Seiten `sport`, `promotion` und `events/[id]` enthalten je ein einzelnes `border-[#2E2E30]`. Sie kommen in Aufgabe 1 mit, weil das Prüfskript projektweit greift und die Garantie „keine rohen Hex-Werte" sonst nicht durchsetzbar wäre. Es ist je eine mechanische Ersetzung, kein Redesign dieser Seiten.

**Anmerkung zum Aufwand:** Das Spec beschreibt die klebende Datumszeile als Signature-Element, ohne zu sagen, was sie kostet. Beim Schreiben dieses Plans hat sich gezeigt: Alle Tagesgruppen liegen derzeit in **einem** gemeinsamen Grid (`app/HomeClient.tsx:1681`, `<Fragment>`), in dem `position: sticky` nicht pro Tag funktionieren kann — die Überschriften würden sich oben stapeln, statt einander abzulösen. Aufgabe 3 Schritt 5 baut die Gruppen deshalb in eigene `<section>`-Elemente um. Das ist der einzige strukturelle Eingriff des ganzen Plans; optisch ändert er nichts, weil `DayHeading` schon `md:col-span-full` trug.

---

### Aufgabe 1: Token-System schließen und absichern

**Dateien:**
- Erstellen: `scripts/check-design-tokens.ts`
- Ändern: `tailwind.config.ts`
- Ändern: `.github/workflows/ci.yml`
- Ändern: `app/HomeClient.tsx` (Zeilen 541, 556, 573, 1664, 1715, 1784, 1808, 1945, 2690, 2707)
- Ändern: `app/api/cron/notify/route.ts` (Zeilen 72, 74, 75)
- Ändern: `app/sport/[sport]/page.tsx:176`, `app/promotion/[promotion]/page.tsx:189`, `app/events/[id]/page.tsx:239`

**Schnittstellen:**
- Erzeugt: das Tailwind-Token `borderStrong` (`#3A3A3C`), ab hier als Klasse `border-borderStrong` benutzbar. Aufgaben 2–4 verwenden es und legen keine weiteren Rahmenfarben an.
- Erzeugt: `scripts/check-design-tokens.ts`, aufrufbar als `npx tsx scripts/check-design-tokens.ts`. Exit-Code 1 bei Verstoß.

- [ ] **Schritt 1: Prüfskript schreiben (es muss zuerst fehlschlagen)**

Neue Datei `scripts/check-design-tokens.ts`:

```ts
// Prueft das Farb-System statt des Aussehens.
//
// 1. Im JSX duerfen keine rohen Hex-Werte in Tailwinds Arbitrary-Value-Syntax
//    stehen. CLAUDE.md verbietet sie, und genau daran ist der Kontrast zweimal
//    vorbeigelaufen: #5A5A5E lag bei 2.66:1, #4A4A4E bei 2.07:1 — beide unter
//    den 4.5:1, die WCAG AA fuer normalen Text verlangt, waehrend jedes Token
//    im System die Huerde nimmt.
// 2. Jede Farbe, die im Produkt Text traegt, erreicht auf base und auf panel
//    mindestens 4.5:1. Die Werte kommen aus tailwind.config.ts, damit die
//    Pruefung die Konfiguration bewacht und nicht eine Kopie davon.
//
// Markenfarben fremder Anbieter als String ("#4285F4" fuer Google, "#1877F2"
// fuer Facebook) sind erlaubt: sie gehoeren dem Anbieter, nicht diesem Design.
// Sie stehen als SVG-Attribut, nicht in einer Tailwind-Klasse, und fallen
// deshalb nicht unter Pruefung 1.
//
//   npx tsx scripts/check-design-tokens.ts

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import config from "../tailwind.config";

let failures = 0;
const check = (label: string, ok: boolean) => {
  if (!ok) {
    failures++;
    console.error(`FEHLGESCHLAGEN: ${label}`);
  }
};

// --- 1. Keine rohen Hex-Werte in Tailwind-Klassen ---

function tsxFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...tsxFiles(p));
    else if (name.endsWith(".tsx")) out.push(p);
  }
  return out;
}

const offenders: string[] = [];
for (const file of [...tsxFiles("app"), ...tsxFiles("components")]) {
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, i) => {
      const hits = line.match(/\[#[0-9A-Fa-f]{3,8}\]/g);
      if (hits) offenders.push(`${file}:${i + 1}  ${hits.join(" ")}`);
    });
}
check(`keine rohen Hex-Werte in Tailwind-Klassen (${offenders.length} gefunden)`, offenders.length === 0);
for (const o of offenders) console.error(`  ${o}`);

// --- 2. Jede Textfarbe erreicht WCAG AA ---

function luminance(hex: string): number {
  const ch = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = ch.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

function ratio(a: string, b: string): number {
  const la = luminance(a) + 0.05;
  const lb = luminance(b) + 0.05;
  return Math.max(la, lb) / Math.min(la, lb);
}

const colors = (config.theme?.extend?.colors ?? {}) as Record<string, string>;

// Nur Farben, die tatsaechlich Text tragen. Fuer Rahmen und Flaechen gilt
// 4.5:1 nicht — borderStrong steht deshalb bewusst nicht in dieser Liste.
const TEXT_TOKENS = ["text", "muted", "faint", "dim", "accentText"];
const SURFACES: Array<[string, string]> = [
  ["base", colors.base],
  ["panel", colors.panel],
];

for (const name of TEXT_TOKENS) {
  const hex = colors[name];
  check(`Token ${name} existiert in tailwind.config.ts`, typeof hex === "string");
  if (typeof hex !== "string") continue;
  for (const [surface, bg] of SURFACES) {
    const r = ratio(hex, bg);
    check(`${name} (${hex}) auf ${surface}: ${r.toFixed(2)}:1 >= 4.5:1`, r >= 4.5);
  }
}

if (failures > 0) {
  console.error(`\n${failures} Pruefung(en) fehlgeschlagen`);
  process.exit(1);
}
console.log("ok — alle Pruefungen bestanden");
```

- [ ] **Schritt 2: Prüfskript laufen lassen — es muss fehlschlagen**

```bash
npx tsx scripts/check-design-tokens.ts
```

Erwartet: Exit-Code 1, Meldung `FEHLGESCHLAGEN: keine rohen Hex-Werte in Tailwind-Klassen (13 gefunden)` und darunter 13 Fundstellen. Die Kontrastprüfungen bestehen bereits alle — das ist der Beleg, dass die Tokens in Ordnung sind und nur die rohen Werte daran vorbeilaufen.

- [ ] **Schritt 3: Token `borderStrong` ergänzen**

In `tailwind.config.ts`, direkt nach `borderFav`:

```ts
        borderFav: "#5A1A1C",
        // Hellerer Rahmen fuer Trenner innerhalb einer Karte und fuer
        // hervorgehobene Zustaende. Ersetzt die rohen #2E2E30 und #3A3A3C, die
        // vorher im JSX standen. 1.61:1 auf panel liegt unter den 3:1 fuer
        // bedeutungstragende UI-Grenzen — vertretbar, weil die Kartengrenze
        // von der Flaeche getragen wird (panel gegen base) und der Strich sie
        // nur verstaerkt.
        borderStrong: "#3A3A3C",
```

- [ ] **Schritt 4: Die 13 rohen Werte ersetzen**

Mechanisch, in dieser Reihenfolge:

```bash
# Rahmen: beide Werte werden zu einem Token
grep -rl '\[#2E2E30\]' app components --include='*.tsx' | xargs sed -i '' 's/border-\[#2E2E30\]/border-borderStrong/g'
grep -rl '\[#3A3A3C\]' app components --include='*.tsx' | xargs sed -i '' 's/border-\[#3A3A3C\]/border-borderStrong/g'
```

Die beiden Textfarben von Hand, weil zusätzlich die Schriftgröße steigt:

`app/HomeClient.tsx:573`
```tsx
            <p className="text-[12px] text-faint">
```

`app/HomeClient.tsx:1715`
```tsx
            <p className="text-[12px] text-faint leading-relaxed">
```

- [ ] **Schritt 5: Die E-Mail-Route mitnehmen**

In `app/api/cron/notify/route.ts` alle drei Vorkommen von `#5A5A5E` durch `#8A8A8E` ersetzen — derselbe Grauton geht sonst weiter in den Erinnerungs-Mails raus. Hier bleibt es ein roher Hex-Wert: Es ist Inline-CSS in einer HTML-Mail, Tailwind greift dort nicht.

```bash
sed -i '' 's/#5A5A5E/#8A8A8E/g' app/api/cron/notify/route.ts
```

- [ ] **Schritt 6: Prüfskript laufen lassen — es muss jetzt bestehen**

```bash
npx tsx scripts/check-design-tokens.ts
```

Erwartet: `ok — alle Pruefungen bestanden`, Exit-Code 0.

- [ ] **Schritt 7: Prüfskript in der CI registrieren**

In `.github/workflows/ci.yml`, nach dem Schritt „Ergebnis-Parser pruefen" und vor „Lint":

```yaml
      # Haelt das Farb-System zusammen: keine rohen Hex-Werte in Tailwind-Klassen
      # und jede Textfarbe ueber 4.5:1. Zwei Werte waren genau so am System
      # vorbeigelaufen und lagen bei 2.66:1 und 2.07:1.
      - name: Farb-Tokens pruefen
        run: npx tsx scripts/check-design-tokens.ts
```

- [ ] **Schritt 8: Typecheck und Lint**

```bash
npx tsc --noEmit && npm run lint
```

Erwartet: beide ohne Fehler.

- [ ] **Schritt 9: Committen**

```bash
git add scripts/check-design-tokens.ts .github/workflows/ci.yml tailwind.config.ts app/
git commit -m "Farb-Tokens schliessen: rohe Hex-Werte raus, Kontrast abgesichert

Zwei Textfarben lagen unter WCAG AA (#5A5A5E 2,66:1, #4A4A4E 2,07:1),
beide als rohe Hex-Werte im JSX und damit am durchgerechneten Token-System
vorbei. Beide werden faint (#8A8A8E, 5,31:1) bei 12 statt 11 px.

Die acht Rahmenwerte #2E2E30 und #3A3A3C werden ein Token borderStrong.
Derselbe Grauton steckte auch in der Erinnerungs-Mail und geht dort mit.

check-design-tokens.ts haelt beides in der CI fest.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Aufgabe 2: Trefferflächen

**Dateien:**
- Ändern: `app/HomeClient.tsx` — die Tab-Leiste und die Sportart-Filterpillen

**Schnittstellen:**
- Konsumiert: `border-borderStrong` aus Aufgabe 1.
- Erzeugt: nichts, worauf spätere Aufgaben angewiesen sind.

Die Befunde aus dem Spec: Tabs messen 55,4 × 45,5 px mit **0,0 px** Abstand zueinander; die Filterpillen sind 33,5 px hoch, der Default aus `accessibility.md › Offer sufficiently sized controls` liegt bei 44 pt.

- [ ] **Schritt 1: Ist-Zustand messen und festhalten**

Dev-Server starten (`npm run dev`), im Browser bei 375 × 812 auf `http://localhost:3000` ausführen:

```js
const names = ['Events','Results','Favorites','Fighters','Forum','Account'];
const tabs = [...document.querySelectorAll('button,a')]
  .filter(e => names.includes(e.innerText.trim()))
  .map(e => { const r = e.getBoundingClientRect(); return { t: e.innerText.trim(), h: +r.height.toFixed(1), left: +r.left.toFixed(1), right: +r.right.toFixed(1) }; })
  .sort((a,b) => a.left - b.left);
const gaps = tabs.slice(1).map((t,i) => +(t.left - tabs[i].right).toFixed(1));
const pills = [...document.querySelectorAll('button')]
  .filter(e => ['All','MMA','Boxing','Muay Thai','Kickboxing','Jiu-Jitsu','Judo','Wrestling','Karate','Taekwondo'].includes(e.innerText.trim()));
({ tabGaps: gaps, pillHeights: [...new Set(pills.map(p => +p.getBoundingClientRect().height.toFixed(1)))] });
```

Erwartet vor der Änderung: `tabGaps: [0,0,0,0,0]`, `pillHeights: [33.5]`.

- [ ] **Schritt 2: Tab-Leiste — Abstand und Scrollbarkeit**

Ursache des Null-Abstands: Der Container in `app/HomeClient.tsx:1613` hat kein `gap`, und jeder Tab-Button trägt `flex-1` (Zeile 1619) — die Tabs strecken sich also über die volle Breite und stoßen zwangsläufig aneinander.

Sechs Tabs mit 8 px Abstand passen bei 13 px Schriftgröße nicht in 375 px („Favorites" allein misst 57,9 px). Deshalb auf dem Handy scrollen statt stauchen. Das `md:`-Verhalten bleibt unangetastet.

Container Zeile 1613:

```tsx
      <div className="flex gap-2 overflow-x-auto px-5 border-b border-border md:justify-center md:gap-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
```

Button-Klasse Zeile 1619 — `flex-1` wird zu `shrink-0`:

```tsx
            className={`shrink-0 md:flex-none text-[13px] font-semibold py-3 border-b-2 transition-colors ${
```

- [ ] **Schritt 3: Filterpillen auf 44 px**

Die Pillen gibt es **zweimal**: im Events-Tab (Zeile 1661) und im Fighters-Tab (Zeile 1942). Beide tragen dieselbe Klasse und werden identisch geändert — `py-1.5` ergibt mit 13 px Schrift 33,5 px, deshalb eine feste Untergrenze plus vertikale Zentrierung:

```tsx
                  className={`inline-flex items-center min-h-[44px] text-[13px] font-medium px-4 rounded-full border transition-colors shrink-0 ${
```

`min-h-[44px]` ist ein Abstandswert, kein Farbwert — das Prüfskript aus Aufgabe 1 greift nur bei `[#...]` und schlägt hier nicht an.

- [ ] **Schritt 4: Nachmessen**

Denselben Schnipsel aus Schritt 1 erneut ausführen.

Erwartet: jeder Wert in `tabGaps` ist `>= 8`, `pillHeights` ist `[44]`.

- [ ] **Schritt 5: Typecheck und Lint**

```bash
npx tsc --noEmit && npm run lint
```

- [ ] **Schritt 6: Committen**

```bash
git add app/HomeClient.tsx
git commit -m "Trefferflaechen: Tabs mit Abstand, Filterpillen auf 44 px

Die sechs Tabs standen mit 0,0 px Abstand nebeneinander — ein danebener
Tipp landete beim Nachbarn. Jetzt 8 px, und die Leiste scrollt lieber,
als die Ziele zu quetschen. Die Filterpillen gehen von 33,5 auf 44 px,
den Default aus accessibility.md.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Aufgabe 3: Kopfbereich und klebende Elemente

**Dateien:**
- Ändern: `app/HomeClient.tsx` — Kopfbereich, Filterreihe, Datumszeile, Kartenfuß

**Schnittstellen:**
- Konsumiert: die Pillen-Höhe aus Aufgabe 2 (44 px), weil die klebende Filterreihe diese Höhe hat.
- Erzeugt: nichts, worauf Aufgabe 4 zwingend angewiesen ist — Aufgabe 4 animiert die hier klebend gemachte Datumszeile.

Das ist die Aufgabe mit der größten sichtbaren Wirkung: Die erste Karte soll von 461,5 px auf höchstens 320 px rücken.

- [ ] **Schritt 1: Ist-Zustand messen**

Bei 375 × 812 auf `http://localhost:3000`:

```js
const h = [...document.querySelectorAll('h1,h2,h3,h4,h5')].find(e => /\w/.test(e.innerText));
let card = h; for (let i=0;i<8&&card;i++){ const p=card.parentElement; if(!p)break; const cs=getComputedStyle(p); if(cs.backgroundColor!=='rgba(0, 0, 0, 0)'){card=p;break;} card=p; }
({ ersteKarteVonOben: +card.getBoundingClientRect().top.toFixed(1), viewport: innerHeight });
```

Erwartet vor der Änderung: rund `461.5`.

- [ ] **Schritt 2: Sportart-Liste im Kopf entfernen**

`app/HomeClient.tsx:1593–1596`. Der Text steht fest im JSX, nicht in `STRINGS` — es ist also nur dieser Block zu löschen, es verschwindet kein Sprach-Eintrag:

```tsx
          <p className="text-[13px] text-faint mt-1">
            Boxing · MMA · Muay Thai · Kickboxing · Jiu-Jitsu · Judo ·
            Wrestling · Karate · Taekwondo
          </p>
```

Das umgebende `<div className="flex-1">` bleibt stehen, es trägt die Wortmarke.

- [ ] **Schritt 3: Filterpillen in eine scrollbare Reihe**

Beide Container — Zeile 1654 (Events) und Zeile 1930 (Fighters) — wechseln von `flex-wrap` auf eine einzelne scrollbare Reihe:

```tsx
          <div className="flex gap-2 px-5 pt-4 pb-4 overflow-x-auto border-b border-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
```

Alle neun Sportarten plus „All" bleiben erreichbar — sie wandern bewusst nicht hinter einen Button, weil die Breite des Angebots das Unterscheidungsmerkmal gegenüber reinen MMA-Kalendern ist.

- [ ] **Schritt 4: Filterreihe klebend machen**

Der Events-Container aus Schritt 3 (Zeile 1654) bekommt zusätzlich `sticky top-0 z-20 bg-base` — der deckende Hintergrund verhindert, dass durchscrollende Karten durchscheinen. Der Fighters-Container bleibt unverändert nicht klebend; dort ist die Liste kurz.

- [ ] **Schritt 5: Tagesgruppen in eigene Abschnitte fassen**

**Das ist ein struktureller Umbau, kein CSS-Zusatz.** Aktuell rendert Zeile 1681 alle Tage als `<Fragment>` in **ein** gemeinsames Grid — `DayHeading` und die `EventCard`s sind Geschwister. Ein `position: sticky` an der Überschrift würde in diesem Aufbau für die gesamte Liste gelten: Die Überschriften aller Tage stapelten sich oben, statt einander abzulösen. Jede Tagesgruppe braucht deshalb einen eigenen Abschnitt als Bezugsrahmen.

`Fragment` wird zu `<section>`, die das Grid für ihren Tag selbst aufspannt:

```tsx
            {groupByDay(filtered).map((day, i) => (
              <section key={day.date} className="md:col-span-full">
                <DayHeading
                  date={day.date}
                  count={day.events.length}
                  open={isDayOpen(day.date, i === 0)}
                  onToggle={() => toggleDay(day.date, i === 0)}
                  L={L}
                />
                <div className="grid gap-4 md:grid-cols-3 mt-3">
                  {isDayOpen(day.date, i === 0) &&
                    day.events.map((e) => (
                      /* EventCard unverändert */
                    ))}
                </div>
              </section>
            ))}
```

Optisch ändert sich dadurch nichts: `DayHeading` trug schon `md:col-span-full`, Karten verschiedener Tage sind also ohnehin nie in einer Reihe gelaufen.

`Fragment` aus dem Import entfernen, falls es danach nirgends mehr benutzt wird — sonst meldet Lint eine ungenutzte Variable:

```bash
grep -n "Fragment" app/HomeClient.tsx
```

- [ ] **Schritt 6: Datumszeile klebend machen**

Erst jetzt, mit dem Abschnitt als Bezugsrahmen, greift `sticky`. In `DayHeading` (Zeile 331) am `<button>`:

```tsx
      className="sticky top-[60px] z-10 bg-base self-start w-full flex items-baseline gap-3 py-3 text-left group"
```

`top-[60px]` liegt unterhalb der klebenden Filterreihe aus Schritt 4. **Den tatsächlichen Wert im Browser nachmessen** — er ergibt sich aus der Höhe der Filterreihe (44 px Pillen plus `pt-4 pb-4`) und ist anzupassen, wenn er nicht passt. `bg-base` ist nötig, damit die Karten nicht durchscheinen; `md:col-span-full` und `first:pt-0` entfallen, weil die Überschrift jetzt im eigenen Abschnitt sitzt.

Die Klapp-Funktion (`aria-expanded`, `onToggle`) bleibt unverändert erhalten — die Zeile ist weiterhin ein Button.

Das ist das Signature-Element aus dem Spec: Der Tag, den man gerade ansieht, verlässt nie den Bildschirm.

- [ ] **Schritt 7: „Tap for details" entfernen**

In `app/HomeClient.tsx` den `<p>`-Block bei Zeile 573 entfernen, der `L.tapForDetails` bzw. `L.tapForDetailsWatch` ausgibt — die ganze Karte ist klickbar, und am Desktop ist „Tap" das falsche Verb.

Anschließend die vier Einträge aus dem `STRINGS`-Objekt löschen: `tapForDetails` und `tapForDetailsWatch`, jeweils im `en`- und im `de`-Block (Zeilen 650, 651, 787, 788).

Prüfen, dass danach nichts mehr darauf verweist:

```bash
grep -rn "tapForDetails" app/ components/ || echo "keine Verweise mehr"
```

- [ ] **Schritt 8: Nachmessen**

Den Schnipsel aus Schritt 1 erneut ausführen.

Erwartet: `ersteKarteVonOben` **höchstens 320**.

Zusätzlich beim Scrollen prüfen, dass Filterreihe und Datumszeile oben stehen bleiben und die Datumszeile beim Tageswechsel wechselt.

- [ ] **Schritt 9: Typecheck und Lint**

```bash
npx tsc --noEmit && npm run lint
```

- [ ] **Schritt 10: Committen**

```bash
git add app/HomeClient.tsx
git commit -m "Kopfbereich entschlacken, Filter und Datum kleben

Die Sportart-Liste im Kopf wiederholte die Filterpillen darunter und
kostete rund 100 px. Die Pillen werden eine scrollbare Reihe statt drei
Zeilen. Zusammen rueckt die erste Event-Karte von 461,5 px auf unter
320 px — von 57 auf gut 35 Prozent der Bildschirmhoehe.

Die Datumszeile klebt jetzt: Der Tag, den man ansieht, verlaesst nie den
Bildschirm. Das ist die Aufgabe eines Kalenders.

'Tap for details' faellt weg — die ganze Karte ist klickbar, und am
Desktop war 'Tap' ohnehin falsch.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Aufgabe 4: Motion

**Dateien:**
- Ändern: `app/HomeClient.tsx` — Übergang der klebenden Datumszeile

**Schnittstellen:**
- Konsumiert: die klebende Datumszeile aus Aufgabe 3.

Genau ein animierter Moment im ganzen Umbau. Alles andere bleibt ohne Animation.

- [ ] **Schritt 1: Cross-Fade ergänzen**

Die klebende Datumszeile bekommt einen kurzen Übergang beim Wechsel:

```tsx
className="... transition-opacity duration-150 motion-reduce:transition-none"
```

`motion-reduce:` ist Tailwinds Variante für `prefers-reduced-motion: reduce` und braucht keine zusätzliche Konfiguration.

- [ ] **Schritt 2: Gegen reduzierte Bewegung prüfen**

Im Browser ausführen:

```js
matchMedia('(prefers-reduced-motion: reduce)').matches;
```

Dann im Browser reduzierte Bewegung aktivieren (DevTools → Rendering → „Emulate CSS prefers-reduced-motion") und prüfen, dass die Datumszeile ohne Übergang wechselt.

Erwartet: mit `reduce` keine sichtbare Animation, ohne `reduce` ein kurzer Übergang.

- [ ] **Schritt 3: Typecheck und Lint**

```bash
npx tsc --noEmit && npm run lint
```

- [ ] **Schritt 4: Alle Abnahmekriterien des Specs durchgehen**

```bash
npx tsx scripts/check-design-tokens.ts
grep -rn "tapForDetails" app/ components/ || echo "tapForDetails: entfernt"
npx tsc --noEmit && npm run lint
```

Dazu im Browser bei 375 × 812 die Messungen aus den Aufgaben 2 und 3 ein letztes Mal, und alle sechs Tabs einmal durchklicken: Favoriten, Suche und Sprachwechsel müssen unverändert funktionieren.

- [ ] **Schritt 5: Committen**

```bash
git add app/HomeClient.tsx
git commit -m "Ein Uebergang fuer die klebende Datumszeile

150 ms Cross-Fade beim Tageswechsel, abgeschaltet bei
prefers-reduced-motion. Der einzige animierte Moment im Umbau.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

- [ ] **Schritt 6: Branch pushen und Vercel-Preview holen**

```bash
git push -u origin claude/startseite-hig-redesign
```

Danach den Preview-Link aus dem Vercel-Deployment an Henrik geben. **Nicht nach `main` mergen** — die Abnahme macht er.

Die Prüfung in der Capacitor-WebView (Risiko aus dem Spec) passiert am Preview, nicht lokal.

---

## Abnahme gegen das Spec

| Kriterium aus dem Spec | Aufgabe | Nachweis |
|---|---|---|
| Jede Textfarbe ≥ 4,5:1 | 1 | `check-design-tokens.ts` |
| Keine rohen Grauton-Hex im JSX | 1 | `check-design-tokens.ts` |
| Tab-Abstand ≥ 8 px | 2 | Browser-Messung |
| Filterpillen ≥ 44 px | 2 | Browser-Messung |
| Erste Karte ≤ 320 px von oben | 3 | Browser-Messung |
| „Tap for details" nirgends mehr | 3 | `grep` |
| Neue Strings in `en` und `de` | 3 | Sichtprüfung beider Blöcke |
| Bei `prefers-reduced-motion` keine Animation | 4 | Browser mit Emulation |
| `npm run lint` und `npx tsc --noEmit` grün | 1–4 | jeweils vor dem Commit |
| Alle sechs Tabs weiter bedienbar | 4 | Durchklicken |
