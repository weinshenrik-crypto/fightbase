import Link from "next/link";
import LegalShell from "@/components/LegalShell";
import { socialMeta } from "@/lib/socialMeta";

// Die lange Fassung dessen, was auf der Startseite in zwei Zeilen steht.
//
// Anlass: Die Seite sagte bisher nur, *was* sie ist ("combat sports events
// calendar"), nirgends *warum ausgerechnet die hier*. Wer einem geteilten
// Link folgt, sieht eine Liste von Terminen — und hat keinen Grund, ihr mehr
// zu glauben als jedem anderen Kalender.
//
// Diese Seite ist deshalb auch die, auf die ein Reddit-Post verlinkt: Sie
// nennt die Quellen beim Namen, benennt die Luecken, und sagt, wer das
// gebaut hat. Eine Behauptung, die sich nicht nachsehen laesst, gehoert
// nicht hierher.

const title = "About Fightbase — how the calendar is built";
const description =
  "Fightbase is a free calendar for nine combat sports, built by one person. Where the dates come from, what is deliberately missing, and why no fight is ever invented.";

export const metadata = {
  title: `${title} | Fightbase`,
  description,
  alternates: { canonical: "/about" },
  ...socialMeta({ title, description, path: "/about" }),
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

function Ext({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-accentText"
    >
      {children}
    </a>
  );
}

export default function About() {
  const en = (
    <>
      <P>
        You shouldn&apos;t need a dozen tabs to know when the next fight is.
        That is the whole reason this exists.
      </P>
      <P>
        Follow more than one combat sport and the calendar falls apart. The UFC
        publishes its own schedule, ONE publishes its own, the IBJJF has a
        separate one for jiu-jitsu, judo and wrestling live on federation sites
        that were built for officials rather than fans. Fightbase puts nine
        sports — MMA, boxing, Muay Thai, kickboxing, jiu-jitsu, judo, wrestling,
        karate and taekwondo — into one list you can filter.
      </P>

      <H>No fight is ever invented</H>
      <P>
        This is the rule the whole thing hangs on. A card only shows fighters
        when the promotion has actually announced them. A start time only
        appears when the source states one — never an estimate, never
        &ldquo;probably around 10pm&rdquo;. If a matchup is rumoured but not
        confirmed, it is not here.
      </P>
      <P>
        Plenty of sites fill those gaps with guesses because an empty field
        looks unfinished. An empty field is the honest answer, and it is what
        you will see here.
      </P>

      <H>Where the dates come from</H>
      <P>
        Every day the calendar pulls from the organisations themselves, not
        from other aggregators: the{" "}
        <Ext href="https://ibjjf.com/events/calendar">IBJJF</Ext> calendar for
        jiu-jitsu, <Ext href="https://www.ijf.org/calendar">IJF</Ext> for judo,{" "}
        <Ext href="https://www.wkf.net/karate-one">WKF</Ext> for karate,{" "}
        <Ext href="https://uww.org/events">UWW</Ext> for wrestling and{" "}
        <Ext href="https://www.onefc.com/events/">ONE</Ext> for Muay Thai and
        kickboxing. Boxing and MMA cards are entered by hand and checked
        against the promotion before they go in.
      </P>
      <P>
        Where an event has a source, its page links back to it, so you can
        check any date yourself rather than take our word for it.
      </P>

      <H>What is thin, and why</H>
      <P>
        <strong className="text-text">Wrestling.</strong> United World
        Wrestling&apos;s full calendar sits behind an API that requires
        credentials. Only the next three events are readable publicly, so
        wrestling coverage is thinner than the rest. Rather than pretend
        otherwise, it says so on the wrestling page too.
      </P>
      <P>
        <strong className="text-text">Amateur and youth events</strong> are
        filtered out on purpose. Senior and elite competition only — otherwise
        the calendar fills with national opens and age-group brackets and stops
        being useful.
      </P>

      <H>Free, and how that is paid for</H>
      <P>
        No ads, no paywall, no sponsored listings, and nothing to buy. An
        account is optional and only exists so you can favourite sports and
        fighters and get an email reminder before an event you care about.
      </P>
      <P>
        To be precise rather than flattering: the site does count page views,
        through Vercel Analytics. It sets no cookies for it and does not follow
        you to other sites, and it is described in full in the{" "}
        <Link href="/datenschutz" className="text-accentText">
          privacy policy
        </Link>
        . That is the only measurement running here.
      </P>

      <H>Who built it</H>
      <P>
        One person — Henrik, in Germany. Fightbase is independent: it is not
        owned by, affiliated with, or paid by any promotion or federation, which
        is also why it can list a competitor&apos;s card next to the UFC&apos;s
        without anyone minding.
      </P>

      <H>Found something wrong?</H>
      <P>
        Dates move constantly in this sport, and a calendar that is wrong is
        worse than no calendar. If something here is out of date or simply
        incorrect, write to{" "}
        <a href="mailto:weinshenrik@gmail.com" className="text-accentText">
          weinshenrik@gmail.com
        </a>{" "}
        — corrections are welcome and get fixed quickly.
      </P>
      <P>
        <Link href="/" className="text-accentText">
          ← See the calendar
        </Link>
      </P>
    </>
  );

  const de = (
    <>
      <P>
        Man sollte kein Dutzend Tabs brauchen, um zu wissen, wann der nächste
        Kampf ist. Genau dafür gibt es diese Seite.
      </P>
      <P>
        Wer mehr als eine Kampfsportart verfolgt, kennt das Problem: Die UFC
        veröffentlicht ihren eigenen Terminplan, ONE seinen eigenen, die IBJJF
        hat einen für Jiu-Jitsu, und Judo und Ringen liegen auf
        Verbandsseiten, die für Funktionäre gebaut wurden und nicht für Fans.
        Fightbase bringt neun Sportarten — MMA, Boxen, Muay Thai, Kickboxen,
        Jiu-Jitsu, Judo, Ringen, Karate und Taekwondo — in eine Liste, die sich
        filtern lässt.
      </P>

      <H>Es wird kein Kampf erfunden</H>
      <P>
        Das ist die Regel, an der alles hängt. Kämpfer stehen erst dann auf
        einer Karte, wenn die Promotion sie angekündigt hat. Eine Anfangszeit
        erscheint nur, wenn die Quelle eine nennt — nie geschätzt, nie
        &bdquo;vermutlich gegen 22 Uhr&ldquo;. Was gerüchteweise kursiert, aber
        nicht bestätigt ist, steht hier nicht.
      </P>
      <P>
        Viele Seiten füllen solche Lücken mit Vermutungen, weil ein leeres Feld
        unfertig aussieht. Ein leeres Feld ist die ehrliche Antwort — und das,
        was du hier siehst.
      </P>

      <H>Woher die Termine kommen</H>
      <P>
        Der Kalender holt sich die Termine täglich bei den Organisationen
        selbst, nicht bei anderen Sammelkalendern: der{" "}
        <Ext href="https://ibjjf.com/events/calendar">IBJJF</Ext> für
        Jiu-Jitsu, der <Ext href="https://www.ijf.org/calendar">IJF</Ext> für
        Judo, der <Ext href="https://www.wkf.net/karate-one">WKF</Ext> für
        Karate, <Ext href="https://uww.org/events">UWW</Ext> für Ringen und{" "}
        <Ext href="https://www.onefc.com/events/">ONE</Ext> für Muay Thai und
        Kickboxen. Box- und MMA-Karten werden von Hand eingetragen und vor dem
        Eintragen gegen die Promotion geprüft.
      </P>
      <P>
        Wo ein Event eine Quelle hat, verlinkt seine Seite dorthin zurück — du
        kannst also jeden Termin selbst nachsehen, statt uns zu glauben.
      </P>

      <H>Was dünn ist, und warum</H>
      <P>
        <strong className="text-text">Ringen.</strong> Der vollständige
        Kalender von United World Wrestling liegt hinter einer Schnittstelle,
        die Zugangsdaten verlangt. Öffentlich lesbar sind nur die nächsten drei
        Termine, deshalb ist Ringen dünner besetzt als der Rest. Statt so zu
        tun, als wäre es anders, steht das auch auf der Ringen-Seite.
      </P>
      <P>
        <strong className="text-text">Nachwuchs- und Amateurturniere</strong>{" "}
        werden bewusst herausgefiltert. Nur Senioren und Elite — sonst läuft
        der Kalender mit nationalen Opens und Altersklassen voll und nützt
        niemandem mehr.
      </P>

      <H>Kostenlos — und wie das finanziert ist</H>
      <P>
        Keine Werbung, keine Bezahlschranke, keine bezahlten Einträge, nichts
        zu kaufen. Ein Konto ist freiwillig und existiert nur, damit du
        Sportarten und Kämpfer als Favoriten speichern und vor einem Event eine
        Erinnerung per E-Mail bekommen kannst.
      </P>
      <P>
        Der Genauigkeit halber, statt es schöner zu machen, als es ist: Die
        Seite zählt Seitenaufrufe, über Vercel Analytics. Dafür werden keine
        Cookies gesetzt, und du wirst nicht auf andere Seiten verfolgt; im{" "}
        <Link href="/datenschutz" className="text-accentText">
          Datenschutzhinweis
        </Link>{" "}
        steht es vollständig. Mehr wird hier nicht gemessen.
      </P>

      <H>Wer das gebaut hat</H>
      <P>
        Eine Person — Henrik, aus Deutschland. Fightbase ist unabhängig: Die
        Seite gehört keiner Promotion und keinem Verband, ist mit keiner
        verbunden und wird von keiner bezahlt. Auch deshalb kann hier die Karte
        eines Konkurrenten neben der der UFC stehen, ohne dass sich jemand
        daran stört.
      </P>

      <H>Etwas gefunden, das nicht stimmt?</H>
      <P>
        Termine verschieben sich in diesem Sport ständig, und ein falscher
        Kalender ist schlimmer als gar keiner. Wenn hier etwas veraltet oder
        schlicht falsch ist, schreib an{" "}
        <a href="mailto:weinshenrik@gmail.com" className="text-accentText">
          weinshenrik@gmail.com
        </a>{" "}
        — Korrekturen sind willkommen und werden schnell eingebaut.
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
      titleEn="About Fightbase"
      titleDe="Über Fightbase"
    />
  );
}
