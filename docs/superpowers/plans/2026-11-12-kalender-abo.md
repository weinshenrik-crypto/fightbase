# Kalender-Abo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Events einzeln in den Kalender eintragen, eigene Favoriten über einen geheimen Link abonnieren, und Sportarten und Promotions öffentlich abonnieren.

**Architecture:** Ein reines Modul `lib/ics.ts` baut aus `FightEvent[]` einen RFC-5545-Text. Vier Route-Handler unter `app/api/calendar/` liefern ihn aus: Einzeltermin, Sportart, Promotion und persönlicher Feed. Eine Client-Komponente `components/CalendarButtons.tsx` zeigt die Knöpfe, zweisprachig über `useStoredLang`. Die Tokens für den persönlichen Feed liegen in einer neuen, privaten Tabelle `calendar_tokens`.

**Tech Stack:** Next.js 16 Route Handlers, Supabase (Service Role im Feed, Sitzungs-Token beim Erzeugen), keine neue Abhängigkeit.

**Spec:** `docs/superpowers/specs/2026-11-12-kalender-abo-design.md`

## Global Constraints

- Keine neue npm-Abhängigkeit. ICS wird selbst geschrieben.
- Keine geratene Uhrzeit: Ohne `startsAt` ist der Termin ganztägig (`DTSTART;VALUE=DATE:YYYYMMDD`, `DTEND` = Folgetag).
- Mit `startsAt`: `DTSTART` in UTC (`…Z`), `DTEND` = Start + 3 h, in `DESCRIPTION` die Zeile `End time estimated`.
- `UID:<id>@fightbase.io`. `VALARM` mit `TRIGGER:-PT1H` nur bei Terminen mit Uhrzeit.
- Feed-Kopf: `X-WR-CALNAME`, `REFRESH-INTERVAL;VALUE=DURATION:PT6H`, `X-PUBLISHED-TTL:PT6H`. Zeilenende CRLF, Faltung bei 75 Oktetten (UTF-8, nicht Zeichen).
- Feeds enthalten Events mit `daysUntil(date) >= -7`.
- `Content-Type: text/calendar; charset=utf-8`. Öffentlich: `public, s-maxage=3600`. Persönlich: `private, max-age=0`.
- Unbekannter Token oder Slug → 404 mit leerem Body.
- Alle UI-Texte auf `en` und `de`. Keine rohen Hex-Werte in Tailwind-Klassen (`scripts/check-design-tokens.ts`).
- `profiles` bekommt keine neue Spalte.

## Review Focus

1. **Titel mit Umlauten oder Emoji über 75 Byte.** Wird nach Zeichen statt nach Byte gefaltet oder mitten in einer UTF-8-Sequenz getrennt, lehnt Apple-Kalender die Zeile ab. Test in Task 1: `foldLine` trennt nie innerhalb eines Code-Points, und jede Zeile ist ≤ 75 Byte.
2. **Event mit `startsAt` kurz vor Mitternacht in der Zone des Austragungsorts.** `DTSTART` muss aus `startsAt` (UTC) kommen und nicht aus `date`. Test in Task 1: `startsAt: "2026-12-06T23:30:00.000Z"` ergibt `DTSTART:20261206T233000Z` und `DTEND:20261207T023000Z`.
3. **Favorit, dessen Fighter auf keiner Karte steht, oder ganz ohne Favoriten.** Der Feed muss trotzdem ein gültiger, leerer `VCALENDAR` sein und kein 500. Test in Task 4: `buildCalendar([], …)` enthält `BEGIN:VCALENDAR` und `END:VCALENDAR` und kein `VEVENT`.
4. **Abgemeldete Sitzung oder ein Token, der abläuft, während der Knopf gedrückt wird.** `POST /api/calendar/token` muss mit 401 antworten, und die Oberfläche zeigt einen Fehler statt eines Links `…/u/undefined.ics`. Prüfen in Task 4, Schritt „Von Hand".
5. **Promotion-Slug für eine Promotion ohne Landingpage.** Die Route muss dieselbe Auflösung wie die Seite nutzen (`promotionBySlug`) und sonst 404 liefern. Test in Task 3: Ein unbekannter Slug liefert 404.

---

### Task 1: `lib/ics.ts` — Kalendertext bauen

**Files:**
- Create: `lib/ics.ts`
- Create: `scripts/check-ics.ts`
- Modify: `.github/workflows/ci.yml` (Schritt `npx tsx scripts/check-ics.ts` neben den anderen Checks, ohne Secrets)

**Interfaces:**
- Consumes: `FightEvent`, `eventHeadline`, `daysUntil` aus `lib/events.ts`
- Produces:
  - `escapeText(s: string): string`
  - `foldLine(line: string): string` (gibt die Zeile mit `\r\n ` als Fortsetzung zurück)
  - `eventToVevent(e: FightEvent, now?: Date): string[]` (Zeilen ohne CRLF)
  - `buildCalendar(events: FightEvent[], name: string, now?: Date): string` (fertiger Text mit CRLF, filtert auf `daysUntil >= -7`)
  - `eventUrl(e: FightEvent): string` → `https://fightbase.io/events/<id>`

- [ ] **Step 1: Write `scripts/check-ics.ts`** im Stil der anderen Prüfskripte (`check()`-Zähler, `process.exit(1)` bei Fehlern). Assertions:
  - `escapeText("a,b;c\\d\ne")` === `"a\\,b\\;c\\\\d\\ne"`
  - `foldLine("X:" + "ä".repeat(60))`: Jede Teilzeile hat ≤ 75 Byte (`Buffer.byteLength`), und das Entfalten (`.replace(/\r\n /g, "")`) ergibt wieder die Eingabe.
  - Event mit `startsAt: "2026-12-06T23:30:00.000Z"` → enthält `DTSTART:20261206T233000Z`, `DTEND:20261207T023000Z`, `BEGIN:VALARM`, `TRIGGER:-PT1H`, und die `DESCRIPTION` enthält `End time estimated`.
  - Event ohne `startsAt`, `date: "2026-12-31"` → `DTSTART;VALUE=DATE:20261231`, `DTEND;VALUE=DATE:20270101`, kein `VALARM`.
  - `venue: ""` → keine Zeile, die mit `LOCATION` beginnt.
  - Turnier ohne `fighters` → `SUMMARY` ist `title`, nicht `main`.
  - `UID:<id>@fightbase.io`. Zwei Aufrufe mit demselben Event liefern einen identischen `UID`.
  - `buildCalendar([], "Fightbase · Test")` enthält `BEGIN:VCALENDAR`, `X-WR-CALNAME:Fightbase · Test`, `REFRESH-INTERVAL;VALUE=DURATION:PT6H`, und kein `BEGIN:VEVENT`. Jede Zeile endet mit `\r\n`.
  - Ein Event 8 Tage in der Vergangenheit (relativ zu `now`) fehlt, eins 6 Tage in der Vergangenheit ist enthalten.

- [ ] **Step 2: Run** `npx tsx scripts/check-ics.ts` → schlägt fehl, weil `lib/ics.ts` fehlt.

- [ ] **Step 3: Implement `lib/ics.ts`.** `foldLine` zerlegt über `Array.from(line)` (Code-Points) und zählt die Bytes mit `Buffer.byteLength`. Jede Fortsetzungszeile beginnt mit einem Leerzeichen, das mitzählt. `DTSTAMP` kommt aus `now`. `PRODID:-//Fightbase//Calendar//EN`, `VERSION:2.0`, `CALSCALE:GREGORIAN`, `METHOD:PUBLISH`. `DESCRIPTION`: Unterzeile, `promotion`, `broadcaster` (falls gesetzt), bei Uhrzeit `End time estimated`, als letzte Zeile `eventUrl(e)`, verbunden mit `\n` vor dem Escapen. Dazu `URL:` mit `eventUrl(e)`. Der Code muss ohne Node-Module im Client nicht laufen, er wird nur serverseitig importiert. `Buffer` ist also erlaubt.

- [ ] **Step 4: Run** `npx tsx scripts/check-ics.ts` → keine Ausgabe `FEHLGESCHLAGEN`, Exit 0. Dazu `npx tsc --noEmit`.

- [ ] **Step 5: Commit** `lib/ics.ts scripts/check-ics.ts .github/workflows/ci.yml` — „Kalender: ICS-Erzeugung mit Pruefskript"

### Task 2: Einzeltermin — Route und Knöpfe auf Detailseite und Karte

**Files:**
- Create: `app/api/calendar/event/[id]/route.ts`
- Create: `components/CalendarButtons.tsx`
- Modify: `app/events/[id]/page.tsx` (unter dem Quellen-Absatz, vor den Sender-Chips, ca. Zeile 253)
- Modify: `app/HomeClient.tsx` (`EventCard`, nur im aufgeklappten Teil `isOpen`)

**Interfaces:**
- Consumes: `eventToVevent`, `buildCalendar`, `eventUrl` (Task 1); `getEvents`, `getEventBySlug` aus `lib/eventsDb.ts`; `useStoredLang` aus `lib/clientStore.ts`
- Produces:
  - Route `GET /api/calendar/event/<id>.ics`. Das Segment `[id]` erhält `<id>.ics`, die Route streift `.ics` ab. Ohne die Endung → 404.
  - `googleEventUrl(e: FightEvent): string` in `lib/ics.ts`: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=…&dates=…&details=…&location=…`. `dates` ist `YYYYMMDDTHHMMSSZ/…` mit Uhrzeit, sonst `YYYYMMDD/YYYYMMDD+1`.
  - `<EventCalendarButtons event={FightEvent} />` und `<FeedCalendarButtons feedPath={string} />` (Pfad ohne Host, z.B. `/api/calendar/sport/jiu-jitsu.ics`), beide aus `components/CalendarButtons.tsx`, `"use client"`, mit eigenem `STRINGS` `{en, de}`.
  - `webcalUrl(path)` → `webcal://fightbase.io<path>`. `googleSubscribeUrl(path)` → `https://calendar.google.com/calendar/r?cid=` + `encodeURIComponent(webcalUrl(path))`. Beide in `components/CalendarButtons.tsx`.

- [ ] **Step 1: Ergänze `scripts/check-ics.ts`** um `googleEventUrl`: Mit Uhrzeit enthält die URL `dates=20261206T233000Z%2F20261207T023000Z` (oder unkodiertes `/`, je nach `URLSearchParams`, und der Test prüft das dekodierte `dates`). Ohne Uhrzeit ist `dates` `20261231/20270101`.
- [ ] **Step 2: Run** → schlägt fehl.
- [ ] **Step 3: Implement** `googleEventUrl`, die Route und die Komponente. Die Route sucht zuerst in `getEvents()`, dann über `getEventBySlug`, so wie die Detailseite. Header nach Global Constraints, dazu `Content-Disposition: attachment; filename="<id>.ics"`. Knopftexte: en „Add to Google Calendar" / „Download .ics", de „In Google Kalender" / „Kalenderdatei (.ics)". Google steht zuerst (Android). Links mit `target="_blank" rel="noopener"`.
- [ ] **Step 4: Run** `npx tsx scripts/check-ics.ts`, `npx tsc --noEmit`, `npm run lint`, `npx tsx scripts/check-design-tokens.ts`. Alle grün.
- [ ] **Step 5: Im Browser prüfen.** `npm run dev`, `/events/<ein slug mit startsAt>` öffnen, die Knöpfe sind da. `curl -sI localhost:3000/api/calendar/event/<slug>.ics` liefert 200 und `text/calendar`. Ein unbekannter Slug liefert 404. Der Google-Link öffnet einen vorausgefüllten Termin.
- [ ] **Step 6: Commit** — „Kalender: Einzeltermin eintragen (Google und .ics)"

### Task 3: Öffentliche Feeds je Sportart und Promotion

**Files:**
- Create: `app/api/calendar/sport/[sport]/route.ts`
- Create: `app/api/calendar/promotion/[promotion]/route.ts`
- Modify: `app/sport/[sport]/page.tsx`, `app/promotion/[promotion]/page.tsx` (Abo-Knopf unter der Einleitung)

**Interfaces:**
- Consumes: `buildCalendar` (Task 1); `FeedCalendarButtons` (Task 2); `sportBySlug`, `promotionBySlug`, `promotionsWithPage` aus `lib/events.ts`
- Produces: `GET /api/calendar/sport/<slug>.ics`, `GET /api/calendar/promotion/<slug>.ics`. Kalendernamen: `Fightbase · <Sport>` bzw. `Fightbase · <Promotion>`.

- [ ] **Step 1: Implement beide Routen.** `.ics` abstreifen, über `sportBySlug` bzw. `promotionBySlug(events, slug)` auflösen, unbekannt → 404. Die Promotion-Route liefert nur für Promotions, die in `promotionsWithPage(events)` stehen, einen Feed, sonst 404, also genau wie die Landingpage. `export const revalidate = 3600`.
- [ ] **Step 2: Knöpfe einbauen** mit `FeedCalendarButtons`. Texte: en „Subscribe in Google Calendar" / „Subscribe (Apple, Outlook)" / „Copy link", de „In Google Kalender abonnieren" / „Abonnieren (Apple, Outlook)" / „Link kopieren". Darunter der Hinweis, en: „Google Calendar refreshes subscriptions about once a day.", de: „Google Kalender aktualisiert Abos etwa einmal am Tag."
- [ ] **Step 3: Prüfen.** `curl -s localhost:3000/api/calendar/sport/jiu-jitsu.ics | head -20` zeigt `X-WR-CALNAME:Fightbase · Jiu-Jitsu` und mindestens ein `VEVENT`. `…/sport/quidditch.ics` und `…/promotion/gibtsnicht.ics` liefern 404. `npx tsc --noEmit`, `npm run lint`, Design-Token-Check.
- [ ] **Step 4: Commit** — „Kalender: oeffentliche Abos je Sportart und Promotion"

### Task 4: Persönlicher Favoriten-Feed

**Files:**
- Create: `supabase/migration-calendar-tokens.sql` (SQL wörtlich aus der Spec, dazu eine Gegenprobe wie in `migration-profiles-email-private.sql`)
- Create: `lib/favorites.ts` mit `eventMatchesFavorite` und dem Typ `Fav`
- Modify: `app/api/cron/notify/route.ts` (importiert `eventMatchesFavorite` aus `lib/favorites.ts`, die lokale Kopie entfällt)
- Create: `app/api/calendar/token/route.ts`
- Create: `app/api/calendar/u/[token]/route.ts`
- Modify: `app/api/account/delete/route.ts` (ausdrücklich `calendar_tokens` löschen, neben `favorites`)
- Modify: `app/HomeClient.tsx` (Favoriten-Tab, oberhalb der Sportarten-Auswahl; neue `STRINGS` in en und de)
- Modify: `scripts/check-profile-privacy.ts` (zweite Prüfung: `anon` liest aus `calendar_tokens` keine Zeile; fehlt die Tabelle (404), gibt das Skript einen Hinweis aus und schlägt nicht fehl)

**Interfaces:**
- Consumes: `buildCalendar` (Task 1); `FeedCalendarButtons` (Task 2); `supabaseAdmin`; `getEvents`
- Produces:
  - `type Fav = { type: string; value: string }`; `eventMatchesFavorite(e: FightEvent, fav: Fav): boolean`
  - `POST /api/calendar/token` mit `Authorization: Bearer <access_token>` → `200 { token: string }`. Mit `?rotate=1` wird ein neuer Token erzeugt. Ohne oder mit ungültiger Sitzung → `401 { error: "not_signed_in" | "invalid_session" }`. Fehlt die Tabelle → `503 { error: "migration_missing" }`.
  - `GET /api/calendar/u/<token>.ics` → Feed `Fightbase · My favorites`, oder 404.

- [ ] **Step 1: Ergänze `scripts/check-ics.ts`** um `eventMatchesFavorite`: Sportart, Promotion, Event-ID und Fighter-Name treffen jeweils, ein fremder Fighter trifft nicht, ein unbekannter `type` trifft nicht. Dazu Review Focus 3: `buildCalendar([], …)` ohne `VEVENT`.
- [ ] **Step 2: Run** → schlägt fehl.
- [ ] **Step 3: Implement** `lib/favorites.ts` und stelle die Notify-Route darauf um. Die Logik bleibt unverändert, sie wird nur verschoben.
- [ ] **Step 4: Implement die Token-Route.** Sitzung prüfen wie in `app/api/account/delete/route.ts` (`db.auth.getUser(token)`). Token: `randomBytes(32).toString("base64url")`. Vorhandene Zeile zurückgeben, bei `rotate` per `upsert` ersetzen.
- [ ] **Step 5: Implement die Feed-Route.** `.ics` abstreifen. Token muss `/^[A-Za-z0-9_-]{43}$/` erfüllen, sonst sofort 404 ohne Datenbankzugriff. Dann Token → `user_id` → `favorites` (Service Role), Events aus `getEvents()`, filtern mit `eventMatchesFavorite`. `Cache-Control: private, max-age=0` und `export const dynamic = "force-dynamic"`.
- [ ] **Step 6: UI im Favoriten-Tab.** Knopf „Subscribe to my favorites" / „Favoriten im Kalender abonnieren". Ein Klick holt den Token und zeigt danach `FeedCalendarButtons` mit `/api/calendar/u/<token>.ics` und den Knopf „Reset link" / „Link zurücksetzen". Bei 401 erscheint „Please sign in again." / „Bitte melde dich neu an.", bei 503 „Not available yet." / „Noch nicht verfügbar." Der Token wird nur im Komponentenzustand gehalten, nicht in `localStorage`.
- [ ] **Step 7: Prüfen.** `npx tsx scripts/check-ics.ts`, `npx tsc --noEmit`, `npm run lint`, Design-Token-Check. Von Hand, nachdem die Migration im SQL-Editor gelaufen ist: einloggen, abonnieren, `curl -s localhost:3000/api/calendar/u/<token>.ics` zeigt die Favoriten-Events, ein erfundener Token liefert 404. Nach „Link zurücksetzen" liefert der alte Token 404. Abmelden und auf den Knopf → Fehlermeldung, kein `undefined` im Link (Review Focus 4). `npx tsx scripts/check-profile-privacy.ts` ist grün.
- [ ] **Step 8: Commit** — „Kalender: persoenlicher Favoriten-Feed mit geheimem Link"

### Task 5: Android-WebView und Abschluss

**Files:**
- Modify (nur falls nötig): `android/app/src/main/java/io/fightbase/app/MainActivity.java`
- Modify: `CLAUDE.md` (Abschnitt „Kalender": Routen, Migration, Hinweis auf die Google-Verzögerung)
- Modify: `app/about/` (ein Satz, dass es Kalender-Abos gibt, falls die Seite Funktionen aufzählt)

- [ ] **Step 1: Auf dem Emulator prüfen** (`android-build`-Skill, Debug-APK gegen die Preview oder Production): Öffnet der Google-Knopf Google Kalender oder den Browser? Lädt der `.ics`-Knopf etwas herunter? Was passiert beim Abo-Knopf?
- [ ] **Step 2: Nur wenn etwas verschluckt wird:** In `MainActivity` Navigationen zu Hosts außerhalb der Positivliste und zum Schema `webcal:` per `Intent.ACTION_VIEW` an Android übergeben. Die bestehende Positivliste für Deep Links bleibt unverändert. Danach ist ein App-Release nötig: dem Nutzer sagen, nicht selbst hochladen.
- [ ] **Step 3: CLAUDE.md und /about** ergänzen.
- [ ] **Step 4: Gesamtprüfung:** `npx tsc --noEmit`, `npm run lint`, `npm run build`, alle `scripts/check-*.ts`, die lokal ohne Secrets laufen.
- [ ] **Step 5: Commit** — „Kalender: Doku, Android-Weitergabe"
