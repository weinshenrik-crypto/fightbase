# Startseite: Layout, Hierarchie und Barrierefreiheit nach HIG-Foundations

**Datum:** 17. September 2026
**Fläche:** `app/HomeClient.tsx` — die sechs Tabs der Startseite
**Grundlage:** `apple-design`-Skill (Apple Human Interface Guidelines, 122 Seiten)

## Warum überhaupt

Die Startseite zeigt auf dem Handy beim ersten Blick praktisch kein Event. Gemessen
bei 375 × 812: Die erste Event-Karte beginnt bei 461,5 px — **56,8 % der Bildschirmhöhe
vergehen, bevor Inhalt kommt.** Dazu kommen zwei Textfarben, die unter WCAG AA liegen.

Beides ist klein zu beheben und hat große Wirkung. Dieses Spec beschreibt, wie.

## Geltungsbereich

**Drin:** Die sechs Tabs der Startseite (Events, Results, Favorites, Fighters, Forum,
Account) in `app/HomeClient.tsx`, plus die Farb-Tokens in `tailwind.config.ts`.

**Draußen, bewusst:** Event-Detailseiten, Fighter-Profile, die Sport- und
Promotion-Landingpages, Rechtstexte und die Pflegemaske. Die bekommen eigene
Durchgänge auf demselben Fundament.

**Nicht-Ziel:** Das Aussehen der Seite auf einen Apple-Systemlook umstellen. Der
`apple-design`-Skill schreibt in seinem eigenen Geltungsbereich:

> `SKILL.md › Scope and limits`: "A web app or an Android-only app gets the principles
> and the foundations (accessibility, color, typography, layout, writing) but not
> Apple's platform conventions."

Fightbase ist eine Website, und die einzige native App ist Android — dort wäre Apples
Plattformkonvention ohnehin die falsche Hausordnung. Es gelten also die Foundations.
**Dark-only, Oswald, `#C1272D` und die Kampfsport-Identität bleiben unverändert.**
CLAUDE.md gilt weiter, unverändert.

## Befunde (gemessen, nicht geschätzt)

Alle Werte am 17. September 2026 gegen die laufende Seite bei 375 × 812 erhoben,
Kontraste aus den tatsächlichen Hex-Werten gerechnet.

### Kritisch 1 — Zwei Textfarben unter WCAG AA

| Ort | Wert | Größe | Kontrast auf `panel` | nötig |
|---|---|---|---|---|
| `HomeClient.tsx:573` | `#5A5A5E` | 11 px | **2,66:1** | 4,5:1 |
| `HomeClient.tsx:1715` | `#4A4A4E` | 11 px | **2,07:1** | 4,5:1 |

> `accessibility.md › Contrast`: Text "Up to 17 pts | All | 4.5:1"

Beide sind rohe Hex-Werte im JSX — was CLAUDE.md ausdrücklich verbietet. Das ist die
eigentliche Ursache: Das Token-System ist durchgerechnet und besteht durchweg
(`dim` 4,51:1, `faint` 5,31:1, `accentText` 5,14:1, `muted` 9,12:1), aber diese
Grautöne gehen daran vorbei.

`#5A5A5E` steckt zusätzlich in `app/api/cron/notify/route.ts` (Zeilen 72–75) und
geht damit auch in den Erinnerungs-E-Mails raus.

### Kritisch 2 — Sechs Tab-Ziele ohne Abstand

Jeder Tab misst 55,4 × 45,5 px. Die Höhe ist in Ordnung. Der Abstand zwischen allen
sechs beträgt gemessen **0,0 px** — ein danebengegangener Tipp landet beim Nachbarn.

> `accessibility.md › Offer sufficiently sized controls`: "Controls that are too small
> are hard for many people to interact with and select."

### High — Die erste Bildschirmhöhe trägt keinen Inhalt

Erste Event-Karte bei 461,5 px von 812 (56,8 %). Ursachen:

- Die Sportart-Liste im Kopf ("Boxing · MMA · Muay Thai · …") wiederholt wortwörtlich
  die zehn Filterpillen darunter: ~100 px für null zusätzliche Information.
- Die Pillen brauchen drei Reihen: ~117 px.
- Der Cookie-Banner nimmt unten weitere 139 px.

### Medium — Filterpillen zu flach

33,5 px hoch. Über dem Minimum (28 pt), deutlich unter dem Default (44 pt) aus
`accessibility.md › Offer sufficiently sized controls`.

### Medium — "Tap for details" auf jeder Karte

Die gesamte Karte ist klickbar; der Hinweis ist Rauschen. Am Desktop ist "Tap"
zusätzlich das falsche Verb.

## Der Entwurf

### Tokens

Vier rohe Grautöne verschwinden aus dem JSX. Keine neuen Markenfarben.

Alle Kontraste auf `panel` (`#151516`), der Fläche, auf der diese Werte tatsächlich
stehen.

| bisher | wird | Kontrast | Rolle |
|---|---|---|---|
| `#5A5A5E` (Text) | `faint` `#8A8A8E` | 2,66 → **5,31:1** | Hinweistext |
| `#4A4A4E` (Text) | `faint` `#8A8A8E` | 2,07 → **5,31:1** | Hinweistext |
| `#2E2E30` (Rahmen) | neues Token `borderStrong` `#3A3A3C` | 1,35 → 1,61:1 | Rahmen |
| `#3A3A3C` (Rahmen) | dasselbe Token `borderStrong` | 1,61:1 | Rahmen |

Zwei Rahmenwerte werden zu einem. `borderStrong` kommt nach `tailwind.config.ts`
neben die bestehenden Tokens, mit einem Kommentar in derselben Art wie bei `dim` und
`accentText`.

**Zu den Rahmen, offen gesagt:** 1,61:1 bleibt unter den 3:1, die WCAG für
bedeutungstragende UI-Grenzen verlangt. Vertretbar ist das hier, weil die Kartengrenze
durch die Füllung getragen wird (`panel` `#151516` gegen `base` `#0C0C0D`) und der
Strich nur verstärkt. Das ist eine Einschätzung, keine Regel aus dem HIG — wer sie
später anders bewertet, hebt `borderStrong` an, ohne dass sonst etwas bricht.

Die OAuth-Markenfarben (`#4285F4`, `#34A853`, `#FBBC05`, `#EA4335`, `#1877F2`,
`#5865F2`) bleiben als rohe Werte stehen. Sie gehören Google, Facebook und Discord,
nicht diesem Design — ein Token dafür wäre eine Lüge über ihre Herkunft.

### Typografie

Die beiden durchgefallenen Hinweistexte gehen von 11 auf 12 px. Sonst nichts. Jede
weitere Vergrößerung frisst genau den Platz, den der Umbau gewinnt.

### Layout

Kopf entschlacken, Filter in eine Reihe, Filterreihe klebt beim Scrollen.

```
375 px                             1440 px
┌────────────────────────────┐     ┌──────────────────────────────────────┐
│ FIGHTBASE           EN·DE  │     │ FIGHTBASE   Events Results …  EN·DE  │
├────────────────────────────┤     ├──────────────────────────────────────┤
│ Events  Results  Favor… →  │     │ 🔍 Suche          (All)(MMA)(Boxing)…│
├────────────────────────────┤     ╞══════════════════════════════════════╡
│ 🔍 Search events, fighters │     │ ▾ SAT 19 SEPTEMBER · in 2 days       │
├────────────────────────────┤     │ ┌────────┐ ┌────────┐ ┌────────┐     │
│ (All)(MMA)(Boxing)(Muay…→  │     │ │ Karte  │ │ Karte  │ │ Karte  │     │
╞════════════════════════════╡◀ ab hier klebend
│ ▾ SAT 19 SEPTEMBER 5 events│
│ ┌────────────────────────┐ │
│ │ JIU-JITSU              │ │  ← erste Karte ~288 px statt 461,5 px
```

Im Einzelnen:

- **Sportart-Liste im Kopf entfällt.** Sie dupliziert die Pillen. ~100 px gewonnen.
- **Filterpillen werden eine horizontal scrollbare Reihe**, Höhe 44 px statt 33,5.
  Netto ~73 px gewonnen. Alle neun Sportarten bleiben erreichbar — sie wandern nicht
  hinter einen Button, weil die Breite des Angebots das Unterscheidungsmerkmal
  gegenüber reinen MMA-Kalendern ist.
- **Tabs bekommen 8 px Abstand** und dürfen bei Bedarf horizontal scrollen.
- Die Filterreihe klebt beim Scrollen oben.

Erwartetes Ergebnis: erste Karte bei ~288 px statt 461,5 px, also ~35 % statt 56,8 %
der Bildschirmhöhe.

### Das Signature-Element

**Der Tag, den man gerade ansieht, verlässt nie den Bildschirm.** Die Datumszeile in
Oswald mit dem roten "in 2 days" klebt beim Scrollen unter der Filterreihe und
wechselt beim Übergang in den nächsten Tag.

Ein Kalender hat genau eine Aufgabe — Orientierung in der Zeit. Das Element gibt es
schon, es wird nur konsequent eingesetzt.

### Motion

Genau ein Moment: der Wechsel der klebenden Datumszeile, 150 ms Cross-Fade. Hinter
`prefers-reduced-motion: reduce` vollständig abgeschaltet. Sonst keine neue Animation.

> `motion.md`: Motion ist zweckgebunden, kurz und bei häufigen Interaktionen selten.

### Was rausfliegt

- Die doppelte Sportart-Liste im Kopf.
- "Tap for details" / "Antippen für Details" samt der beiden Gegenstücke
  `tapForDetailsWatch`. Die Strings verschwinden aus **beiden** Sprachblöcken.

## Selbstkritik

Der `apple-design`-Skill verlangt die Frage, ob derselbe Plan auch für ein beliebiges
anderes Produkt herausgekommen wäre.

"Kopf entschlacken, Filter kleben lassen" — ja, das ist Hygiene und wird hier nicht als
Standpunkt verkauft. Der Standpunkt ist die klebende Datumszeile; die ergibt nur bei
einem Kalender Sinn und kommt aus der Aufgabe des Produkts, nicht aus einem Trend.

Zwei Dinge wurden entfernt, nicht nur hinzugefügt.

## Umsetzungsreihenfolge

Die Reihenfolge stammt aus `SKILL.md › Design improvement mode`: erst Barrierefreiheit,
dann Konventionen, dann Craft, dann Politur.

1. **Barrierefreiheit** — `borderStrong` anlegen, vier rohe Hex-Werte ersetzen, die
   beiden Hinweistexte auf 12 px. Auch in `app/api/cron/notify/route.ts`.
2. **Konventionen** — Tab-Abstand 8 px, Filterpillen auf 44 px.
3. **Craft** — Sportart-Liste entfernen, Pillen in eine scrollbare Reihe, Filterreihe
   und Datumszeile klebend, "Tap for details" entfernen.
4. **Politur** — Cross-Fade der Datumszeile inklusive `prefers-reduced-motion`.

Jeder Schritt ist für sich lauffähig und einzeln überprüfbar.

## Abnahmekriterien

Messbar, nicht nach Gefühl:

- [ ] Jede Textfarbe auf `base` und `panel` erreicht ≥ 4,5:1 (bzw. ≥ 3:1 ab 18 pt oder
      bei Fettung). Nachweis: gerechnete Tabelle aus den tatsächlichen Hex-Werten.
- [ ] Kein roher Grauton-Hex mehr im JSX von `app/` und `components/`. Die sechs
      OAuth-Markenfarben sind ausgenommen.
- [ ] Abstand zwischen benachbarten Tabs ≥ 8 px, im Browser gemessen.
- [ ] Filterpillen ≥ 44 px hoch, im Browser gemessen.
- [ ] Erste Event-Karte bei 375 × 812 höchstens 320 px von oben.
- [ ] "Tap for details" erscheint nirgends mehr, in keiner der beiden Sprachen.
- [ ] Neue UI-Strings liegen in `en` **und** `de` vor.
- [ ] Bei `prefers-reduced-motion: reduce` läuft keine Animation.
- [ ] `npm run lint` und `npx tsc --noEmit` laufen durch.
- [ ] Alle sechs Tabs sind weiterhin bedienbar; Favoriten, Suche und Sprachwechsel
      funktionieren unverändert.

## Risiken

- **Die Android-App zeigt die Live-Website.** Ein Push auf `main` ist sofort auch in
  der App sichtbar (siehe CLAUDE.md). Deshalb: Branch mit Vercel-Preview, Abnahme
  durch Henrik, erst danach `main`.
- **`HomeClient.tsx` hat 2.728 Zeilen.** Die Änderungen verteilen sich über die Datei.
  Deshalb die vier getrennten Schritte statt eines großen Umbaus.
- **Klebende Elemente und WebView.** Die Filterreihe muss in der Capacitor-WebView
  geprüft werden, nicht nur im Desktop-Browser.

## Offene Punkte

Keine.

---

## Nachtrag: Was bei der Umsetzung anders kam

Eingetragen am 17. September 2026, nach Abschluss der Implementierung.

**Der Cross-Fade ist entfallen.** Der Abschnitt „Motion" oben verspricht einen
150-ms-Cross-Fade beim Wechsel der klebenden Datumszeile. Umgesetzt ist er
**nicht**. Die vorgesehene Tailwind-Klasse allein bewirkt nichts, weil im Baum
nie etwas `opacity` ändert — sie war toter Code und wurde entfernt. Ein echter
Cross-Fade bräuchte einen `IntersectionObserver` samt State, und genau dieses
Muster schließt CLAUDE.md aus (`react-hooks/set-state-in-effect` blockiert die
CI). Die klebende Datumszeile funktioniert; sie blendet nur nicht.

**Die erste Karte sitzt bei 316,5 px, nicht bei ~288.** Die Schätzung oben war
zu optimistisch: Die Sportart-Liste im Kopf war rund 62 px hoch, nicht ~100.
Das Abnahmekriterium (≤ 320 px) ist erfüllt, die genannte Zahl war es nicht.

**Der Umbau betraf zwei Tabs, nicht einen.** `DayHeading` wird auch im
Favoriten-Tab verwendet. Ohne den gleichen Umbau dort wären die Überschriften
genau so gestapelt, wie Aufgabe 3 es verhindern soll.

**Offen und bewusst zurückgestellt:** Die aufklappbare Event-Karte ist ein
`div` mit `onClick`, ohne `role`, `tabIndex` oder `onKeyDown` — per Tastatur
also nicht bedienbar. Das ist älter als dieser Durchgang, aber er entfernt mit
„Tap for details" den letzten Hinweis darauf. Ein eigener Durchgang sollte
hier ansetzen.
