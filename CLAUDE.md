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

Push auf `main` → Vercel deployed automatisch. Es gibt keinen separaten Deploy-Schritt.

Das Remote ist SSH (`git@github.com:weinshenrik-crypto/fightbase.git`). Falls
`Permission denied (publickey)`: der Deploy-Key ist nicht im Agent geladen —
`ssh-add ~/.ssh/id_ed25519_fightbase`.

## Aufbau

```
app/
  page.tsx              Die gesamte Haupt-App (~2100 Zeilen, Client Component):
                        Events, Favoriten, Fighters, Forum, Account, Auth, i18n
  events/[id]/          Event-Detailseiten
  fighters/[slug]/      Fighter-Profile
  sport/[sport]/        Eine SEO-Landingpage pro Sportart
  promotion/[promotion]/ Eine SEO-Landingpage pro Promotion
  api/cron/notify/      Vercel-Cron: verschickt Event-Erinnerungen via Resend
lib/
  events.ts             Event-Daten, Sportarten- und Promotion-Definitionen
  supabaseClient.ts     Browser-Client (anon key)
  supabaseAdmin.ts      Server-Client (service role) — nur in API-Routes verwenden
components/
  NativeAppBridge.tsx   No-op im Web; blendet in der Capacitor-App den Splash aus
supabase/               SQL-Schema, Migrationen, Seeds, E-Mail-Templates
```

`app/page.tsx` ist bewusst eine große Datei. Sprach-Strings liegen dort in einem
`STRINGS`-Objekt (`en`/`de`) — neue UI-Texte immer in **beiden** Sprachen ergänzen.

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
