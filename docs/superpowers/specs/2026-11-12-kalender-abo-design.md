# Kalender: einzelne Events eintragen, Favoriten und Sportarten abonnieren

Stand: 12. November 2026

## Wozu

Wer Kampfsport schaut, will sich nicht bei jeder Organisation einzeln
informieren. Fightbase sammelt die Termine schon, und Favoriten plus
E-Mail-Erinnerungen gibt es auch. Was fehlt, ist der Weg dorthin, wo man
ohnehin nachschaut, nämlich in den Kalender auf dem Handy.

Das hier ist der Kalender-Teil. Push-Benachrichtigungen in der Android-App
sind ein eigenes, späteres Vorhaben und gehören nicht in dieses Dokument.

Ein Nebeneffekt ist gewollt: Ein öffentlicher Abo-Link wie „alle
IBJJF-Turniere" lässt sich in Vereinen und Foren teilen, und jeder Termin
darin verweist zurück auf fightbase.io.

## Drei Wege in den Kalender

1. **Einzelnes Event.** Auf der Detailseite (`/events/[id]`) und auf der
   Event-Karte in `HomeClient` steht „In Kalender eintragen". Es gibt zwei
   Ziele:
   - **Google Kalender**: ein Link auf
     `https://calendar.google.com/calendar/render?action=TEMPLATE&…` mit
     fertig ausgefülltem Termin. Kein Download, funktioniert auch in der
     Android-WebView.
   - **Kalenderdatei (.ics)** für iPhone, Outlook und alles andere:
     `GET /api/calendar/event/[id].ics`.
2. **Eigene Favoriten als Abo**, nur mit Konto. Im Favoriten-Tab steht der
   Knopf „Favoriten im Kalender abonnieren". Er führt auf einen persönlichen,
   geheimen Feed: `GET /api/calendar/u/[token].ics`. Der Feed enthält alle
   kommenden Events, die zu irgendeinem Favoriten passen: Sportart,
   Promotion, Fighter oder einzelnes Event, nach derselben Regel wie
   `eventMatchesFavorite` in `app/api/cron/notify/route.ts`. Diese Funktion
   wandert nach `lib/` und wird von beiden benutzt, damit E-Mail und Kalender
   nie verschieden entscheiden.
3. **Öffentliche Abos ohne Konto**, eins je Sportart und eins je Promotion:
   `GET /api/calendar/sport/[sport].ics` und
   `GET /api/calendar/promotion/[promotion].ics`, mit denselben Slugs wie die
   Landingpages (`sportSlug`, `promotionSlug`). Auf jeder Sport- und
   Promotion-Seite steht ein Abo-Knopf.

Abo-Knöpfe bieten zwei Ziele: `webcal://fightbase.io/…` (öffnet auf
iPhone/Mac den Kalender direkt) und Google Kalender über
`https://calendar.google.com/calendar/r?cid=<webcal-URL>`. Dazu die nackte
https-URL zum Kopieren, für alles andere.

## Inhalt eines Termins

- **Mit `startsAt`**: Beginn ist dieser Zeitpunkt in UTC (`DTSTART:…Z`). Eine
  Dauer kennen wir nicht. Als Ende wird **drei Stunden** gesetzt, damit der
  Termin im Kalender sichtbar ist. Das ist die eine Schätzung im ganzen
  Feature, und sie steht in der Beschreibung („Ende geschätzt").
- **Ohne `startsAt`**: ganztägig (`DTSTART;VALUE=DATE:`). Keine geratene
  Uhrzeit, dieselbe Regel wie beim Import.
- `SUMMARY`: `eventHeadline(e).headline`, bei Turnieren also der Name und
  nicht „Gi divisions".
- `LOCATION`: `venue`, weglassen, wenn leer (bei Matchroom häufig).
- `DESCRIPTION`: Unterzeile, Promotion, Sender, und als letzte Zeile der
  Link `https://fightbase.io/events/<id>`. Dazu `URL:` mit demselben Link.
- `UID`: `<id>@fightbase.io`. Er muss über Abrufe hinweg stabil bleiben, sonst
  verdoppeln Kalender die Termine. Der Slug ist stabil (siehe
  „Abgeglichen wird über (source, source_key)" in CLAUDE.md).
- **Erinnerung** (`VALARM`), nur bei Terminen mit Uhrzeit: eine Stunde vorher.
  Apple übernimmt sie, Google ignoriert sie bei Abos. Bei ganztägigen Terminen
  gibt es keinen Alarm, denn „1 Stunde vor Mitternacht" wäre falsch.
- Text nach RFC 5545 escapen (`\\`, `;`, `,`, Zeilenumbruch) und Zeilen bei
  75 Oktetten falten. Das ist die Stelle, an der selbst geschriebene
  ICS-Ausgaben typischerweise brechen.

Feed-Kopf: `X-WR-CALNAME` (z.B. „Fightbase · Jiu-Jitsu", „Fightbase · Meine
Favoriten"), `REFRESH-INTERVAL;VALUE=DURATION:PT6H` und
`X-PUBLISHED-TTL:PT6H`. Google hält sich nicht daran und aktualisiert alle
12 bis 24 Stunden. Das lässt sich nicht ändern und wird auf der Seite gesagt.

Zeitraum eines Feeds: ab sieben Tagen in der Vergangenheit, damit ein gerade
vorbeigegangenes Event nicht sofort verschwindet, bis zum Ende der Liste.

## Der geheime Link

Neue Tabelle statt neuer Spalte in `profiles`. `profiles` ist zeilenweise für
alle lesbar, und jede neue Spalte dort müsste wie `email` über Spaltenrechte
abgeschottet werden (siehe „RLS ist zeilenweise" in CLAUDE.md). Eine eigene
Tabelle ist von vornherein privat:

```sql
create table calendar_tokens (
  user_id uuid primary key references profiles(id) on delete cascade,
  token text not null unique,
  created_at timestamptz not null default now()
);
alter table calendar_tokens enable row level security;
create policy "Users manage their own calendar token"
  on calendar_tokens for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

Migration als `supabase/migration-calendar-tokens.sql`.

- Den Token erzeugt der **Server** und nicht der Browser:
  `POST /api/calendar/token` mit der Supabase-Sitzung als Bearer, 32 Byte
  aus `crypto.randomBytes`, base64url. Gibt es schon einen, kommt er zurück.
  `?rotate=1` ersetzt ihn, das ist der Knopf „Link zurücksetzen" für den
  Fall, dass er geteilt wurde.
- Der Feed liest mit dem Service-Role-Schlüssel: Token → `user_id` →
  `favorites`. Unbekannter Token → 404, ohne Unterschied zwischen „gibt es
  nicht" und „falsch".
- Kontolöschung (`api/account/delete`) entfernt die Zeile über das `cascade`.
- `scripts/check-profile-privacy.ts` um eine Prüfung erweitern: `anon` darf
  `calendar_tokens` nicht lesen.

## Caching

- Öffentliche Feeds und Einzeltermine: aus `getEvents()`, also derselbe
  stündliche ISR-Cache wie die Seiten, mit `Cache-Control: public,
  s-maxage=3600`.
- Persönlicher Feed: Events aus `getEvents()` (gecacht), Favoriten frisch.
  Die Antwort ist `private, max-age=0`, sie darf nicht im CDN landen, weil der
  Token in der URL steckt.

`Content-Type: text/calendar; charset=utf-8`. Für den Download des
Einzeltermins zusätzlich `Content-Disposition: attachment;
filename="<id>.ics"`.

## Texte

Alle neuen UI-Texte in `STRINGS` auf **en und de**. Unter dem Abo-Knopf ein
Satz, der ehrlich sagt, wie es sich verhält: Google aktualisiert etwa einmal
am Tag, Erinnerungen stellt man bei Google selbst ein.

## Ziele, Nicht-Ziele, Anti-Ziele

Ziele: ein Event in zwei Taps im Kalender. Ein Abo, das neue passende Events
ohne Zutun nachliefert. Öffentliche Abo-Links, die man teilen kann.

Nicht-Ziele: Push-Benachrichtigungen in der App (eigenes Vorhaben). Ein
Abo je Fighter ohne Konto. Eine Kalender-Synchronisation in die andere
Richtung.

Anti-Ziele, die das Feature trotz Funktion scheitern ließen:
- Termine, die sich bei jedem Abruf verdoppeln (instabile `UID`).
- Eine geratene Uhrzeit bei Events ohne `startsAt`.
- Ein persönlicher Feed, der über das CDN oder über `anon` für andere lesbar
  wird.
- Ein kaputter Feed: Ein einziger falsch escapter Titel lässt manche Kalender
  das ganze Abo verwerfen.

## Prüfen

- `scripts/check-ics.ts` in der CI, ohne Netz: Er baut einen Feed aus
  Beispiel-Events (mit und ohne Uhrzeit, leerer Ort, Komma, Semikolon und
  Umlaut im Titel, ein Titel über 75 Zeichen) und prüft Escaping, Faltung,
  `UID`-Stabilität und dass ganztägige Termine keinen Alarm haben.
- Von Hand: den öffentlichen Jiu-Jitsu-Feed in Apple-Kalender und Google
  Kalender abonnieren, einen Einzeltermin auf dem Android-Emulator in der App
  eintragen.

## In der Android-App

Die App ist eine WebView, und `MainActivity` lädt nur `fightbase.io`.
`webcal://`, der Google-Kalender-Link und der `.ics`-Download müssen deshalb
an Android übergeben werden: als Intent bzw. im Systembrowser. Ob das heute
schon passiert oder ob die WebView sie stumm verschluckt, ist ungeprüft und
muss als Erstes auf dem Emulator geprüft werden. Wenn eine Änderung an
`MainActivity` nötig ist, braucht es ein App-Release. Auf Android gibt es
außerdem keinen Systemkalender, der `webcal://` abonniert. Dort ist der
Google-Kalender-Link der richtige Knopf und kommt zuerst.

## Entscheidungen von Claude, nicht von Henrik

Zum Gegenlesen:
- Termine mit Uhrzeit enden nach **drei Stunden**, als Schätzung markiert.
- Erinnerung **eine Stunde vorher**, nur bei Terminen mit Uhrzeit.
- Eigene Tabelle `calendar_tokens` statt einer Spalte in `profiles`.
- Feeds reichen sieben Tage in die Vergangenheit.

## Dem Builder überlassen

- Ob die ICS-Erzeugung selbst geschrieben wird (empfohlen, das Format ist
  klein) oder eine Bibliothek nutzt.
- Wie die Knöpfe genau aussehen, innerhalb der Farb-Tokens.
- Ob `eventMatchesFavorite` nach `lib/events.ts` oder in eine eigene Datei
  wandert.
