import Link from "next/link";
import LegalShell from "@/components/LegalShell";
import { socialMeta } from "@/lib/socialMeta";

// Eine Seite, damit das Anwerben von Testern an einem Link haengt.
//
// Der geschlossene Test laeuft ueber eine Google-Gruppe, und daraus folgen
// zwangslaeufig zwei Schritte: erst der Gruppe beitreten, dann bei Google Play
// teilnehmen. Der Play-Link allein zeigt Nichtmitgliedern nur eine
// Fehlermeldung — wer ihn ohne Erklaerung weiterreicht, verliert die Haelfte
// der Leute dort.
//
// Zusammenlegen laesst sich das nicht: Google bietet keine URL, die beides
// erledigt, und die Mitgliederverwaltung einer googlegroups.com-Gruppe ist
// nicht per API ansprechbar. Was geht, ist eine Seite, die beide Schritte in
// der richtigen Reihenfolge zeigt — und die auf der eigenen Domain liegt,
// statt in einem Beitrag zweimal erklaert zu werden.
//
// Bewusst **ohne Zahlen**: weder wie viele Tester es schon gibt noch wie viele
// Google verlangt. Der Stand aendert sich taeglich, und eine Seite, die zwei
// Tester behauptet, waehrend es neun sind, beschaedigt genau das Vertrauen, um
// das sie bittet. Googles Schwellen wiederum sind seine Formalien, nicht der
// Grund, warum jemand die App haben will — sie machen aus einer Einladung eine
// Quotenbitte. Es bleibt: Die App steckt im geschlossenen Test, und durch den
// kommt sie nur mit Testern.
//
// Was bleiben muss, ist die Offenheit darueber, wer fragt: Die Seite sagt, dass
// Fightbase von einer Person gebaut wird und dies eine Bitte um Hilfe ist —
// die Linie aus CLAUDE.md, kein Astroturfing.

const GROUP_URL = "https://groups.google.com/g/fightbase-closed-testers";
const PLAY_TEST_URL = "https://play.google.com/apps/testing/io.fightbase.app";

const title = "Test the Fightbase Android app";
const description =
  "The Fightbase Android app is in closed testing. Two steps, both free and about a minute each: join the tester group, then opt in on Google Play.";

export const metadata = {
  title: `${title} | Fightbase`,
  description,
  alternates: { canonical: "/beta" },
  ...socialMeta({ title, description, path: "/beta" }),
};

function H({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display font-semibold text-[17px] text-text mt-7 mb-2">
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[14px] text-muted leading-relaxed mb-3">{children}</p>
  );
}

/** Ein nummerierter Schritt mit genau einem Knopf. */
function Step({
  n,
  heading,
  body,
  href,
  cta,
}: {
  n: number;
  heading: string;
  body: React.ReactNode;
  href: string;
  cta: string;
}) {
  return (
    <div className="border border-borderStrong rounded-lg p-4 mb-3 bg-panel">
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-[12px] font-semibold text-accentText tabular-nums">
          {n}
        </span>
        <h3 className="font-display font-semibold text-[15px] text-text">
          {heading}
        </h3>
      </div>
      <p className="text-[13px] text-muted leading-relaxed mb-3">{body}</p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center min-h-[44px] bg-accent text-white text-[13px] font-semibold rounded-md px-4"
      >
        {cta}
      </a>
    </div>
  );
}

export default function Beta() {
  const en = (
    <>
      <P>
        Fightbase has an Android app. It is the same calendar you are looking
        at, in an app you can keep on your home screen — no ads, no account
        needed, nothing to pay.
      </P>
      <P>
        It is still in closed testing — the stage Google asks for before an app
        goes into the Play Store properly. Testers are what gets it through, so
        if you have an Android phone and two minutes, this genuinely helps.
      </P>

      <H>What you need</H>
      <P>
        An Android phone and a Google account. Both steps below are free and
        take about a minute each. You can leave the test at any time.
      </P>

      <H>Two steps, in this order</H>
      <Step
        n={1}
        heading="Join the tester group"
        body="Google only shows the test to members of this group. Anyone can join — no approval, no waiting."
        href={GROUP_URL}
        cta="Join the group"
      />
      <Step
        n={2}
        heading="Opt in on Google Play"
        body="Open this on the phone you want the app on, press “Become a tester”, then install from the Play Store link on that page."
        href={PLAY_TEST_URL}
        cta="Open the test on Google Play"
      />
      <P>
        Step two only works once step one has gone through. If you see “not
        available” or an error, give it a minute and reload — group membership
        takes a moment to reach Google Play.
      </P>

      <H>What testing involves</H>
      <P>
        Nothing, really. Install it and leave it on your phone. Google counts
        days, not actions. If something looks broken, write to{" "}
        <a href="mailto:weinshenrik@gmail.com" className="text-accentText">
          weinshenrik@gmail.com
        </a>{" "}
        — that is the whole point of a test.
      </P>
      <P>
        Fightbase is built and run by one person, and this page is me asking for
        help rather than pretending the app got there by itself.
      </P>
      <P>
        <Link href="/about" className="text-accentText">
          More about how the calendar is built
        </Link>
      </P>
      <P>
        <Link href="/" className="text-accentText">
          ← Back to the calendar
        </Link>
      </P>
    </>
  );

  const de = (
    <>
      <P>
        Fightbase gibt es als Android-App. Sie zeigt denselben Kalender, den du
        gerade vor dir hast, nur als App auf dem Startbildschirm — keine
        Werbung, kein Konto nötig, kostet nichts.
      </P>
      <P>
        Sie steckt noch im geschlossenen Test — der Stufe, die Google verlangt,
        bevor eine App richtig in den Play Store darf. Durch diese Stufe kommt
        sie nur mit Testern. Wenn du also ein Android-Telefon und zwei Minuten
        hast, hilft das wirklich.
      </P>

      <H>Was du brauchst</H>
      <P>
        Ein Android-Telefon und ein Google-Konto. Beide Schritte unten sind
        kostenlos und dauern je etwa eine Minute. Du kannst den Test jederzeit
        wieder verlassen.
      </P>

      <H>Zwei Schritte, in dieser Reihenfolge</H>
      <Step
        n={1}
        heading="Der Testgruppe beitreten"
        body="Google zeigt den Test nur Mitgliedern dieser Gruppe. Beitreten kann jeder — ohne Freigabe, ohne Wartezeit."
        href={GROUP_URL}
        cta="Gruppe beitreten"
      />
      <Step
        n={2}
        heading="Bei Google Play teilnehmen"
        body="Öffne das auf dem Telefon, auf das die App soll, tippe auf „Tester werden“ und installiere anschließend über den Play-Store-Link auf derselben Seite."
        href={PLAY_TEST_URL}
        cta="Test bei Google Play öffnen"
      />
      <P>
        Schritt zwei funktioniert erst, wenn Schritt eins durch ist. Falls dort
        „nicht verfügbar“ oder ein Fehler steht: eine Minute warten und neu
        laden — bis die Mitgliedschaft bei Google Play ankommt, dauert es kurz.
      </P>

      <H>Was Testen bedeutet</H>
      <P>
        Eigentlich nichts. Installieren und auf dem Telefon lassen. Google zählt
        Tage, keine Handgriffe. Wenn etwas kaputt aussieht, schreib an{" "}
        <a href="mailto:weinshenrik@gmail.com" className="text-accentText">
          weinshenrik@gmail.com
        </a>{" "}
        — genau dafür ist ein Test da.
      </P>
      <P>
        Fightbase wird von einer einzelnen Person gebaut und betrieben, und
        diese Seite ist meine Bitte um Hilfe — nicht die Behauptung, die App
        wäre von allein dort gelandet.
      </P>
      <P>
        <Link href="/about" className="text-accentText">
          Mehr dazu, wie der Kalender entsteht
        </Link>
      </P>
      <P>
        <Link href="/" className="text-accentText">
          ← Zum Kalender
        </Link>
      </P>
    </>
  );

  return (
    <LegalShell
      en={en}
      de={de}
      titleEn="Test the Android app"
      titleDe="Die Android-App testen"
    />
  );
}
