# Fightbase

Kostenloser, unabhängiger Event-Kalender für 9 Kampfsportarten (Boxen, MMA, Muay Thai,
Kickboxen, Jiu-Jitsu, Judo, Ringen, Karate, Taekwondo). Live auf https://fightbase.io.

Next.js 16 App Router + Supabase + Vercel. Zusätzlich eine native Android-App (Capacitor),
die die Live-Website in einer WebView lädt.

## Befehle

```bash
npm run dev      # Dev-Server (Port 3000)
npm run build    # Production-Build
npm run lint     # ESLint
npx tsc --noEmit # Typecheck
```

**Wichtig:** `dev` und `build` nutzen beide das `--webpack`-Flag. Das ist Absicht —
Turbopack bricht beim `/_not-found`-Route-Handling seit dem Next-16-Upgrade ab.
Das Flag nicht entfernen, ohne vorher zu prüfen, ob der Bug behoben ist.

## Deploy

Ein Push auf `main` deployed automatisch — das Vercel-Projekt (`fightcard/fightbase`)
ist seit dem 5. September 2026 mit dem GitHub-Repo verbunden. Vorher war es das nicht,
und Pushes hatten keinerlei Wirkung auf die Seite.

Manuell geht weiterhin:

```bash
vercel --prod
```

Beim Prüfen, ob etwas live ist, trotzdem gegen die **laufende Seite** testen
(`curl -s https://fightbase.io | grep ...`), nicht gegen den Git-Stand — ein Build
braucht ein bis zwei Minuten, und er kann fehlschlagen.

Das Remote ist SSH (`git@github.com:weinshenrik-crypto/fightbase.git`). Falls
`Permission denied (publickey)`: der Deploy-Key ist nicht im Agent geladen —
`ssh-add ~/.ssh/id_ed25519_fightbase`.

## Aufbau

```
app/
  page.tsx              Dünne Server-Hülle: holt die Events und reicht sie weiter
  HomeClient.tsx        Die eigentliche App (~2500 Zeilen, Client Component):
                        Events, Ergebnisse, Favoriten, Fighters, Forum,
                        Account, Auth, i18n
  events/[id]/          Event-Detailseiten
  fighters/[slug]/      Fighter-Profile
  sport/[sport]/        Eine SEO-Landingpage pro Sportart
  promotion/[promotion]/ Eine SEO-Landingpage pro Promotion
  impressum/ datenschutz/ terms/   Rechtstexte, alle über LegalShell
  admin/events/         Pflegemaske für die events-Tabelle
  api/cron/notify/      Vercel-Cron: Event-Erinnerungen via Resend
  api/cron/import/      Vercel-Cron: Termine aus den Verbandskalendern
  api/cron/results/     Vercel-Cron: Ergebnisse aus Wikipedia
  api/revalidate/       Wirft den Event-Cache weg (Bearer CRON_SECRET)
  api/account/delete/   Kontolöschung
lib/
  events.ts             Typ FightEvent, Sportarten und reine Helfer — keine Daten
  eventsDb.ts           Die einzige Stelle, die Events liest
  eventSources/         Quellen des automatischen Imports, eine Datei je Verband
  resultsSource.ts      Ergebnisse aus Wikipedia-Wikitext
  sportGuides.ts        Redaktionstexte der Sport-Landingpages
  promotionGuides.ts    dito für die Promotion-Seiten
  clientStore.ts        Sprache und Cookie-Zustimmung als externer Store
  supabaseClient.ts     Browser-Client (anon key)
  supabaseAdmin.ts      Server-Client (service role) — nur in API-Routes verwenden
components/
  EventTime.tsx         Startzeit am Austragungsort, dahinter die des Betrachters
  FighterIllustration.tsx  Generierte Darstellung statt Foto (siehe "Nicht tun")
  CookieBanner.tsx      Hinweis auf technisch notwendige Speicherung
  LegalShell.tsx        Zweisprachiger Rahmen der Rechtsseiten
  NativeAppBridge.tsx   No-op im Web; blendet in der Capacitor-App den Splash aus
scripts/                Prüfskripte, von Hand und in der CI
supabase/               SQL-Schema, Migrationen, Seeds, E-Mail-Templates
```

`app/HomeClient.tsx` ist bewusst eine große Datei. Sprach-Strings liegen dort in
einem `STRINGS`-Objekt (`en`/`de`) — neue UI-Texte immer in **beiden** Sprachen
ergänzen. Das gilt auch für die Pflegemaske, die ein eigenes `STRINGS` mitbringt.

Zustand, den nur der Browser kennt (gespeicherte Sprache, Cookie-Zustimmung,
Zeitzone), kommt über `lib/clientStore.ts` und `useSyncExternalStore` herein,
nicht über einen `useEffect`, der nach dem Mount `setState` ruft. Letzteres
kostet einen zusätzlichen Renderdurchlauf und ist das, was
`react-hooks/set-state-in-effect` anmerkt — die Regel blockiert die CI.

**`next-env.d.ts` ist nicht eingecheckt.** Next erzeugt sie bei jedem Lauf neu,
und zwar mit wechselndem Inhalt (`next dev` verweist auf `.next/dev/types`,
`next build` auf `.next/types`) — eingecheckt machte also jeder Build den
Arbeitsbaum schmutzig. Beide Pfade stehen ohnehin in `tsconfig.json` unter
`include`, und `npx tsc --noEmit` läuft ohne die Datei unverändert durch.

## Events pflegen

Events liegen in der Supabase-Tabelle `events`, **nicht mehr im Code**. Neue Termine
gehen also ohne Deploy live: Zeile im Supabase Table Editor anlegen (`slug`, `date`,
`sport`, `promotion`, `title`, `main` sind Pflicht), fertig.

Die Seiten holen die Events per ISR alle 60 Minuten neu. Wer nicht warten will,
schiebt die Änderung sofort live:

```bash
curl -X POST https://fightbase.io/api/revalidate -H "Authorization: Bearer $CRON_SECRET"
```

`CRON_SECRET` liegt in Vercel als **Sensitive** und lässt sich weder per
`vercel env pull` noch im Dashboard zurücklesen — ohne eigene Kopie geht der
Befehl also nicht. Alternative: einmal pushen, der Rebuild erledigt dasselbe.

Die Detailseite eines frisch eingetragenen Events (`/events/<slug>`) ist davon
nicht mehr betroffen: Fehlt der Slug in der gecachten Liste, fragt die Seite die
eine Zeile direkt nach (`getEventBySlug`), statt `notFound()` zu rufen.
Sie ist also sofort erreichbar. Die **Listen** — Startseite, Sport- und
Promotion-Seiten — zeigen das neue Event weiterhin erst nach der Revalidierung.

### Pflegemaske

`/admin/events` ist eine Maske fuer dieselbe Tabelle — mit den Regeln dieses
Projekts an den Feldern, die der Supabase Table Editor nicht kennt: Pflichtfelder,
dass `fighter_a`/`fighter_b` nur als Paar zaehlen, dass `undercard` nur
bestaetigte Kaempfe enthaelt, und dass eine geschaetzte Anfangszeit schlechter
ist als keine. Importierte Zeilen sind gekennzeichnet und warnen beim
Bearbeiten, dass der naechste Cron-Lauf sie ueberschreibt.

Die Seite prueft **keine** Rechte. Wer schreiben darf, entscheiden die
RLS-Policies der `events`-Tabelle (`role = 'admin'` im Profil). Ein Nicht-Admin
sieht das Formular und bekommt beim Speichern eine Fehlermeldung von Postgres.
Nicht indexiert (`robots: noindex`).

### Automatischer Import

Der Cron-Job `/api/cron/import` (täglich 9:00 UTC, `vercel.json`) trägt Termine
aus den vier Verbandskalendern unten selbst ein. Eine Quelle je Datei unter
`lib/eventSources/`, der Abgleich steckt in `lib/eventSources/plan.ts`.

**Vor dem ersten Lauf muss `supabase/migration-event-import.sql` im
SQL-Editor laufen** — sie legt `source`, `source_key` und `source_url` an. Ohne
sie antwortet der Job mit `migration_missing`.

Trockenlauf, schreibt nichts:

```bash
npx tsx scripts/import-dry-run.ts                 # alle Quellen, ausführlich
npx tsx scripts/import-dry-run.ts ibjjf           # nur eine
curl -H "Authorization: Bearer $CRON_SECRET" \
     "https://fightbase.io/api/cron/import?dry=1" # dasselbe über die Route
```

Drei Regeln, auf die man sich verlassen kann:

- **Handzeilen sind tabu.** Zeilen mit `source IS NULL` fasst der Job nie an.
  Steht dort schon derselbe Termin (gleicher Tag, gleiche Sportart, gemeinsames
  unterscheidendes Wort in Name oder Ort), legt er nichts an und meldet es.
- **Abgeglichen wird über `(source, source_key)`, nicht über den Slug.** Sonst
  entstünde bei jeder Umbenennung eines Turniers eine zweite Zeile. Der Slug
  einer bestehenden Zeile bleibt dadurch stabil.
- **Es werden keine Kämpfe erfunden.** `fighter_a`/`fighter_b`, `starts_at` und
  `undercard` bleiben leer — die Verbandskalender nennen Monate im Voraus weder
  Paarungen noch Anfangszeiten.

Alternativ kann der Job vom NAS aus angestoßen werden statt per Vercel-Cron —
fertige n8n-Workflows liegen unter `homeserver/n8n-workflows/`, die Anleitung
in `homeserver/README.md`. n8n ruft dabei denselben Endpunkt auf und baut die
Logik nicht nach.

Was bewusst gefiltert wird, steht als Kommentar in der jeweiligen Quelldatei.
Kurz: Nachwuchs raus (IBJJF-Kids, WKF Youth League, IJF nur `age=sen`, UWW nur
Einträge mit Senior-Klasse), und bei IJF/UWW zusätzlich nur die bedeutenden
Turniertypen, damit der Kalender nicht mit nationalen Opens volläuft.

**Falle bei IJF:** `?age=world_tour` ist *nicht* senior-rein — dort stehen auch
Cadets, Juniors und die Youth Olympic Games. Richtig ist `?age=sen` plus das
Wettkampftyp-Icon (`gs`/`gp`/`wc`/`mas`) als Filter für den World Judo Tour.

### Belegte Quellen

Vor dem Eintragen gegen die Organisation selbst prüfen, nicht gegen einen
Sammel-Kalender. Was sich bewährt hat:

| Sportart | Quelle | Hinweis |
|---|---|---|
| Jiu-Jitsu | `ibjjf.com/api/v1/events/calendar.json` | Kompletter Kalender als JSON. Braucht `X-Requested-With: XMLHttpRequest`, sonst `{"error":"Denied"}`. Beste Quelle im ganzen Projekt. |
| Judo | `ijf.org/calendar` | Vollständig, Senioren und Nachwuchs gemischt — nur Senior/Elite eintragen. |
| Karate | `wkf.net/karate-one` | Premier League, Series A und Youth League, zwei Jahre im Voraus. |
| Ringen | `uww.org/events`, nur der `ld+json`-Block | `uww.org/calendar` existiert nicht (404). Die Tabelle auf `/events` wird seit dem Umbau im September 2026 erst im Browser gefüllt — im HTML stehen leere `<tr>`. Lesbar bleibt der Suchmaschinen-Block (`@graph` → `ItemList` → `SportsEvent`), und der führt nur die **nächsten drei** Termine. |

IBJJF, IJF und WKF sind JS-gerendert; ein simpler Fetch liefert bei WKF und IJF
trotzdem Text, bei IBJJF nur über die JSON-API oben.

**Ringen deckt der Import nur noch dünn ab.** Die vollständige Liste liegt hinter
`athena.uww.org/api/public/competitions…`, und die antwortet ohne Zugangsdaten mit
401 — daran nicht vorbeibauen. Die drei Termine aus dem `ld+json` sind das, was
öffentlich lesbar ist; alles Weitere gehört von Hand eingetragen. Die
Sport-Landingpage erklärt die Lücke offen, genau wie bei Muay Thai. Auch die
Filter sind dort schwächer als bei den anderen Quellen: Altersklasse und
Turniertyp kommen nur noch aus dem Turniernamen, weil der Block keine eigenen
Spalten dafür hat (Begründung im Kopf von `lib/eventSources/uww.ts`).

**Muay Thai lässt sich nicht befüllen.** Geprüft: die RWS-Event-Seite
(`rank.rajadamnern.com/events`) ist leer, und ONE kündigt seine Karten erst
kurzfristig an. Die Stadionprogramme in Bangkok werden tagesaktuell angesetzt.
Nicht durch Hochrechnen von Wochenrhythmen "lösen" — die Sport-Landingpage
erklärt diese Lücke inzwischen offen.

**Achtung beim lokalen Build:** `npm run build` bedient sich aus
`.next/cache/fetch-cache`. Wer gerade Events in Supabase geändert hat und dann
baut, bekommt Seiten aus den alten Daten — inklusive Seiten für Promotions, die
es so nicht mehr gibt. Vor dem Verifizieren einer Datenänderung also
`rm -rf .next/cache/fetch-cache` und neu bauen.

`lib/eventsDb.ts` ist die einzige Stelle, die liest. `lib/events.ts` enthält nur noch
Typ und reine Helfer — Funktionen, die eine Eventliste brauchen, bekommen sie als
Parameter übergeben.

**Beim Eintragen keine Kämpfe erfinden.** Die Seitenbeschreibungen werben ausdrücklich
mit "no fabricated fights". Termine gehören belegt, und im Zweifel lieber weggelassen.
Kampftermine verschieben sich häufig — vor dem Eintragen gegen die Promotion selbst
prüfen, nicht gegen einen Sammel-Kalender.

## Supabase

Projekt-Ref: `ewfqauarkzzhdckkbdzt`

OAuth-Login ist aktiv für Google, GitHub, Discord und Facebook. Alle nutzen dieselbe
Callback-URL: `https://ewfqauarkzzhdckkbdzt.supabase.co/auth/v1/callback`.
Provider werden im Supabase-Dashboard konfiguriert, nicht im Code.

Schema-Änderungen kommen als neue Datei nach `supabase/` und werden im Dashboard-SQL-Editor
ausgeführt — es gibt keine automatisierte Migrations-Pipeline.

## Android-App (Capacitor)

Die App bündelt **kein** lokales Web-Build. `capacitor.config.ts` zeigt per `server.url`
direkt auf `https://fightbase.io`, weil die Seite dynamische Routes, Supabase-Auth und
API-Routes braucht, die ein statischer Export nicht abbilden kann.

**Konsequenz:** Änderungen an der Website sind sofort in der App live — ein neuer
App-Store-Release ist nur für native Änderungen nötig (Icons, Splash, Plugins, Berechtigungen).

### Was nativ dazukommt

`webDir` zeigt auf **`native-web/`**, nicht auf `out/`. Dort liegen zwei Dateien,
mehr braucht die App lokal nicht:

- `error.html` — erscheint, wenn die WebView `fightbase.io` nicht erreicht
  (`server.errorPath`). Ohne sie zeigte die App Chromes Fehlerseite samt
  Adresszeile, was nach kaputter App aussieht statt nach fehlender Verbindung.
  Bewusst ohne Schriftdatei und ohne externes Skript — sie wird genau dann
  gebraucht, wenn nichts geladen werden kann.
- `index.html` — nur da, weil Capacitor im `webDir` eine Einstiegsseite
  erwartet. Im Betrieb nie sichtbar.

`out/` ist gitignored und wäre für andere verschwunden; deshalb ein eigener,
eingecheckter Ordner.

`MainActivity.java` ist nicht mehr leer. Zwei Dinge, die Capacitor 8 in dieser
Lage nicht mitbringt:

- **Zurück-Taste.** Im Paket `@capacitor/android` kommt „BackPressed" an keiner
  Stelle mehr vor, und `@capacitor/app` ist hier nicht installiert. Ohne die
  Behandlung schließt die Zurück-Taste auf der zweiten Seite die App, statt
  zurückzugehen.
- **Deep Links.** Der Intent-Filter im Manifest sorgt dafür, dass die App
  geöffnet wird; die Ziel-URL lädt Capacitor aber nicht von selbst. Geladen
  werden nur `fightbase.io` und `www.fightbase.io` — ein Intent kommt von außen,
  und ohne Positivliste würde die App jede fremde URL in ihrer eigenen WebView
  mit der angemeldeten Supabase-Sitzung öffnen.

### Deep Links scharf schalten

Android prüft beim Installieren `https://fightbase.io/.well-known/assetlinks.json`.
Den Pfad schreibt `next.config.js` auf `app/api/assetlinks/route.ts` um, und die
Route baut die Antwort aus **`ANDROID_CERT_SHA256`**. Ist die Variable nicht
gesetzt oder kein gültiger Fingerabdruck (32 Hex-Paare mit Doppelpunkt),
antwortet sie mit 404 — dann greifen die Deep Links schlicht nicht, sonst
ändert sich nichts.

**Der richtige Wert ist der App-Signaturschlüssel aus der Play Console**
(Setup → App integrity → App signing key certificate, SHA-256), *nicht* der
Upload-Schlüssel: Beim AAB signiert Google die Auslieferung selbst neu. Mehrere
Fingerabdrücke gehen kommagetrennt (z.B. zusätzlich der Upload-Schlüssel, damit
ein selbst gebautes Release auch verifiziert).

Zum Testen ohne Play Console lassen sich die Links auf dem Gerät von Hand
erlauben: Einstellungen → Apps → Fightbase → Standardmäßig öffnen.

Build:
```bash
export ANDROID_HOME=/opt/homebrew/share/android-commandlinetools
export JAVA_HOME=/opt/homebrew/Cellar/openjdk@21/21.0.12.1/libexec/openjdk.jdk/Contents/Home
cd android
./gradlew assembleDebug   # APK zum Testen
./gradlew bundleRelease   # signiertes AAB für den Play Store
```

**JDK 21 ist Pflicht.** Das mit Android Studio gelieferte JDK 25 lässt Gradle 8.14 mit
`Unsupported class file major version 69` abbrechen.

### Ein Release herausgeben

0. **Erst `git pull`.** Der häufigste Fehlschlag ist ein alter Checkout: Play
   lehnt das AAB mit „Versionscode 1 wurde bereits verwendet" ab, weil die
   Erhöhung aus einem Commit stammt, den der Arbeitsbaum noch nicht hat.
   Blockiert der Pull wegen `next-env.d.ts`, ist das harmlos —
   `git checkout -- next-env.d.ts`, die Datei erzeugt Next bei jedem Lauf neu
   und ist seit `93b9a98` ohnehin nicht mehr eingecheckt.
1. **`versionCode` in `android/app/build.gradle` erhöhen.** Play verlangt eine
   streng steigende Zahl; ein AAB mit einer schon hochgeladenen Nummer wird
   abgelehnt. `versionName` ist frei und nur für Menschen.
2. `./gradlew bundleRelease` — braucht `android/keystore.properties`, die auf
   den Keystore zeigt. Beide gibt es nur lokal.

   Vorher `JAVA_HOME` setzen, sonst bricht es mit „Unable to locate a Java
   Runtime" ab — Homebrews `openjdk@21` ist keg-only und liegt nicht im
   Suchpfad:

   ```bash
   export JAVA_HOME=$(ls -d /opt/homebrew/Cellar/openjdk@21/*/libexec/openjdk.jdk/Contents/Home | tail -1)
   ```

   Fehlt `keystore.properties`, bricht der Build mit einer Meldung ab, die
   sagt, was fehlt. Bis September 2026 war das eine nackte
   `NullPointerException` in `signReleaseBundle` — falls die je wiederkommt,
   ist die Prüfung in `android/app/build.gradle` verloren gegangen.
3. Das AAB liegt unter
   `android/app/build/outputs/bundle/release/app-release.aab` und geht in der
   Play Console nach Test and release → Testing → Internal testing → Create
   new release. Dort muss danach die neue Nummer stehen — das ist die
   Kontrolle, ob wirklich der frische Build hochgeladen wurde.

**Nur nötig, wenn sich etwas Natives geändert hat.** Alles unter `app/`,
`lib/` und `components/` ist über die WebView sofort in der App live und
braucht kein Release.

Vor dem ersten Release mit Deep Links muss `ANDROID_CERT_SHA256` gesetzt sein
(siehe oben) — sonst verifiziert Android die Links beim Installieren nicht.

Signierung liest `android/keystore.properties` (gitignored). Diese Datei und
`android/app/fightbase-release.jks` existieren **nur lokal** — ohne sie kein Release-Build.

Play Console: Paketname `io.fightbase.app`, Entwicklerkonto `weinshenrik@gmail.com`.
Interner Test-Track ist aktiv, Produktion noch nicht eingereicht.

## Env-Variablen

```
NEXT_PUBLIC_SUPABASE_URL         Supabase-Projekt-URL
NEXT_PUBLIC_SUPABASE_ANON_KEY    Public anon key
SUPABASE_SERVICE_ROLE_KEY        Nur serverseitig — niemals an den Client
RESEND_API_KEY                   E-Mail-Versand für Event-Erinnerungen
CRON_SECRET                      Schützt /api/cron/notify
ANDROID_CERT_SHA256              SHA-256 des App-Signaturschlüssels, für die
                                 Deep Links der Android-App. Optional; fehlt
                                 sie, liefert /.well-known/assetlinks.json 404.
```

## Konventionen

- Tailwind mit eigenen Farb-Tokens in `tailwind.config.ts`: `base` `#0C0C0D`,
  `panel` `#151516`, `accent` `#C1272D`, `text` `#EDEAE4`. Keine rohen Hex-Werte im JSX.
- Schriften: Oswald (Headlines), Inter (Fließtext) — über `next/font` in `app/layout.tsx`.
- Dark-Theme only. Es gibt keinen Light-Mode.

## Nicht tun

- **Keine Fotos von echten Kämpfern kopieren oder hotlinken.** UFC/Zuffa setzen ihr
  Urheberrecht aggressiv durch (dokumentierte DMCA-Takedowns auch gegen kleine Kanäle).
  Fighter werden mit der generierten `FighterIllustration` dargestellt.
- **Kein Astroturfing beim Marketing.** Posts sagen offen, dass Fightbase vom Poster
  gebaut wurde. Mehrere Subreddits haben eigene Selbstwerbungs-Regeln — vor dem Posten
  die Regeln des jeweiligen Subs lesen.
