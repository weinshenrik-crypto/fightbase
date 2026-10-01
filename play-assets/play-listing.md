# Play Console — fertige Angaben für Fightbase

Alles hier ist aus dem Code und der laufenden Seite abgeleitet, nicht geraten.
Wo eine Angabe von einer Entscheidung abhängt, steht das dabei.

---

## Store-Eintrag

**App-Name** (max. 30 Zeichen)

```
Fightbase
```

**Kurzbeschreibung** (max. 80 Zeichen)

```
Nine combat sports, one calendar. Free, no ads, nothing made up.
```
(64 Zeichen)

**Vollständige Beschreibung** (max. 4000 Zeichen)

```
You shouldn't need a dozen tabs to know when the next fight is.

Follow more than one combat sport and the calendar falls apart. The UFC
publishes its own schedule, ONE publishes its own, the IBJJF has a separate one
for jiu-jitsu, and judo and wrestling live on federation sites built for
officials rather than fans.

Fightbase puts nine sports into one list you can filter:
Boxing · MMA · Muay Thai · Kickboxing · Jiu-Jitsu · Judo · Wrestling · Karate ·
Taekwondo

WHAT YOU GET
• Every upcoming card in one calendar, filtered by sport
• Start times in the venue's time zone and in yours, side by side
• Fight cards, venues and where to watch
• Favourite a sport, a promotion, a fighter or a single event
• Optional email reminders before an event you care about
• Results after the event
• English and German

NO FIGHT IS EVER INVENTED
This is the rule the whole thing hangs on. A card only shows fighters when the
promotion has actually announced them. A start time only appears when the
source states one — never an estimate. If a matchup is rumoured but not
confirmed, it is not here. An empty field is the honest answer.

WHERE THE DATES COME FROM
Every day the calendar pulls from the organisations themselves, not from other
aggregators: IBJJF for jiu-jitsu, IJF for judo, WKF for karate, UWW for
wrestling and ONE for Muay Thai and kickboxing. Boxing and MMA cards are
entered by hand and checked against the promotion. Where an event has a source,
its page links back to it — so you can check any date yourself.

FREE, AND INDEPENDENT
No ads, no paywall, no sponsored listings, nothing to buy. An account is
optional and only exists for favourites and reminders. Fightbase is not owned
by, affiliated with or paid by any promotion or federation.

Built by one person. Corrections are welcome: weinshenrik@gmail.com
```

**Kategorie:** Sport
**Tags:** Kampfsport, Veranstaltungen, Kalender
**Kontakt-E-Mail:** weinshenrik@gmail.com
**Website:** https://fightbase.io
**Datenschutzerklärung:** https://fightbase.io/datenschutz

**Grafiken** (liegen neben dieser Datei)
- App-Symbol 512×512 — aus `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png` hochskalieren oder neu exportieren
- Feature-Grafik 1024×500 — `feature-graphic-1024x500.png`
- Telefon-Screenshots 1080×1920 — `01-events.png` … `05-fighter.png` (Play verlangt mindestens 2, maximal 8)

---

## Data Safety — so wie es im Code tatsächlich aussieht

**Erhebt die App Daten?** Ja.
**Werden Daten geteilt (an Dritte weitergegeben)?** Nein.
**Sind alle Daten bei der Übertragung verschlüsselt?** Ja — nur HTTPS,
`usesCleartextTraffic` ist nicht gesetzt, `cleartext: false` in
`capacitor.config.ts`.
**Können Nutzer die Löschung ihrer Daten verlangen?** Ja —
`/api/account/delete`, in der App unter Account → Delete account.

| Datentyp | Erhoben | Zweck | Pflicht? |
|---|---|---|---|
| E-Mail-Adresse | ja, nur mit Konto | Kontoverwaltung, Event-Erinnerungen | nein, Konto ist freiwillig |
| Name / Profilbild (nur bei OAuth-Login) | ja, nur mit Konto | Kontoverwaltung | nein |
| App-Interaktionen (Seitenaufrufe) | ja | Analyse / Reichweitenmessung (Vercel Analytics) | nein |
| Geräte- oder andere IDs | **nein** | — | — |
| Standort, Kontakte, Fotos, Dateien | **nein** | — | — |

**Wichtig und ehrlich:** Vercel Analytics zählt Seitenaufrufe. Es setzt keine
Cookies und verfolgt niemanden über Websites hinweg, aber es ist eine Messung
und gehört ins Formular. Beschrieben in `/datenschutz`, Abschnitt 6.

Berechtigungen der App: **nur `INTERNET`**. Sonst keine.

---

## Die übrigen Formulare

- **App access:** „All functionality is available without special access" —
  ein Konto ist freiwillig, der Kalender ist ohne Anmeldung vollständig nutzbar.
- **Ads:** Nein, enthält keine Werbung.
- **Content rating:** Fragebogen ausfüllen. Es gibt keine Gewaltdarstellung,
  keine Nutzerfotos, kein Glücksspiel, keine Käufe. Das Forum erlaubt
  Nutzerbeiträge — das muss im Fragebogen angegeben werden.
- **Target audience:** 13+ oder 16+. Nicht an Kinder gerichtet.
- **Government app / Financial features:** beides nein.
- **Data deletion URL:** https://fightbase.io/terms (dort steht der Weg) oder
  direkt der Hinweis auf Account → Delete account.

---

## Zwei Punkte, die eine Entscheidung brauchen

1. **Kontotyp.** Persönliche Entwicklerkonten, die nach dem 13.11.2023 angelegt
   wurden, brauchen vor der Produktion einen **geschlossenen Test mit 12
   Testern, 14 Tage durchgehend**. Der interne Track zählt dafür nicht.
   Nachsehen unter Settings → Developer account → Account details.

2. **Minimum Functionality.** Google lehnt Apps ab, die im Wesentlichen nur
   eine Website in einer WebView zeigen. Fightbase hat native Zutaten
   (Zurück-Taste, Deep Links, Offline-Seite, Splash), aber dünn. Das grösste
   native Merkmal, das noch fehlt, wären Push-Benachrichtigungen für
   favorisierte Events — die Erinnerungen laufen bisher nur per E-Mail.
