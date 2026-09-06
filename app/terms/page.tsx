import Link from "next/link";
import LegalShell from "@/components/LegalShell";

export const metadata = {
  title: "Terms of Use — Fightbase",
  description:
    "Die Regeln für die Nutzung von Fightbase: was die Eventdaten sind und was nicht, Forenregeln, Konten und Haftung.",
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <h2 className="font-semibold text-[15px] mb-1.5 text-text">{title}</h2>
      <div className="text-[13px] text-muted leading-relaxed">{children}</div>
    </section>
  );
}

export default function Terms() {
  const en = (
    <>
      <Section title="1. What Fightbase Is">
        <p>
          Fightbase is a free, privately run calendar of combat sports events.
          It is operated by Henrik Weins as a non-commercial project. There is
          no charge for using it, no subscription and nothing for sale, so
          there is also no payment, cancellation or refund process.
        </p>
      </Section>

      <Section title="2. Event Data Is Information, Not a Guarantee">
        <p className="mb-2">
          Event dates, cards and broadcasters are compiled from the
          promotions&apos; own announcements and are kept as accurate as we
          can. Combat sports schedules change constantly: bouts are rearranged,
          fighters withdraw, cards are postponed and broadcast rights move
          between services, sometimes within days of an event.
        </p>
        <p>
          Treat everything here as a starting point, not as confirmation.
          Before you buy a ticket, book travel or pay for a stream, check the
          promotion&apos;s own website. We accept no liability for costs
          arising from a listing that turned out to be outdated or incorrect.
        </p>
      </Section>

      <Section title="3. No Affiliation With the Promotions">
        <p>
          Fightbase is independent. We are not affiliated with, endorsed by or
          acting on behalf of any promotion, federation or broadcaster listed
          on this site. Their names and event titles are used descriptively, to
          identify the events themselves. All trademarks belong to their
          respective owners. We do not sell tickets and do not link to
          unofficial streams.
        </p>
      </Section>

      <Section title="4. Accounts">
        <p className="mb-2">
          You can use Fightbase without an account. An account is only needed
          for favorites that follow you between devices, email reminders and
          the forum. You are responsible for keeping access to your account
          secure, and for everything posted through it.
        </p>
        <p>
          Register with your own identity or a pseudonym — but not by
          impersonating someone else. You can delete your account at any time
          by emailing us; see the{" "}
          <Link href="/datenschutz" className="text-accentText">
            Privacy Policy
          </Link>
          .
        </p>
      </Section>

      <Section title="5. Forum Rules">
        <p className="mb-2">
          The forum works on one principle: talk about fights, not about each
          other. Specifically, do not post:
        </p>
        <ul className="list-disc pl-5 mb-2 space-y-1">
          <li>
            insults, harassment, threats, or attacks on someone&apos;s origin,
            religion, gender or sexual orientation
          </li>
          <li>
            illegal content, or links to pirated streams and other infringing
            material
          </li>
          <li>advertising, referral links, spam or bot-posted content</li>
          <li>
            other people&apos;s personal data — addresses, phone numbers,
            private messages
          </li>
          <li>
            content you have no right to publish, including copyrighted photos
          </li>
        </ul>
        <p>
          You keep the rights to what you post, and grant us the right to
          display it on Fightbase. You are responsible for your own posts, not
          us — but see the next section for what we do about it.
        </p>
      </Section>

      <Section title="6. Moderation">
        <p>
          We may remove posts, threads or accounts that break these rules,
          usually without prior notice where the content is clearly illegal or
          abusive. If you think something was removed in error, email us and we
          will look at it again. Reports of unlawful content are welcome at the
          address in the{" "}
          <Link href="/impressum" className="text-accentText">
            Legal Notice
          </Link>
          , and are dealt with promptly.
        </p>
      </Section>

      <Section title="7. Availability">
        <p>
          Fightbase is offered as it is, with no promise of uptime. It is a
          side project: it can be unavailable for maintenance, break, or be
          discontinued entirely. Features can change or disappear. If the
          project ends, we will say so on this site beforehand where we
          reasonably can.
        </p>
      </Section>

      <Section title="8. External Links">
        <p>
          We link to promotions, federations and broadcasters. Those sites are
          not ours and we have no influence over their content. Responsibility
          for them lies with their respective operators.
        </p>
      </Section>

      <Section title="9. Liability">
        <p>
          We are liable without limitation for injury to life, body or health,
          and for damage caused intentionally or through gross negligence. For
          slight negligence we are liable only where an obligation essential to
          the purpose of this agreement has been breached, and then only up to
          the damage typically foreseeable for a service of this kind.
          Liability under the German Product Liability Act is unaffected.
        </p>
      </Section>

      <Section title="10. Changes to These Terms">
        <p>
          These terms may be updated as the site develops. The version
          published on this page applies. Substantial changes affecting
          registered users will be announced on the site.
        </p>
      </Section>

      <Section title="11. Applicable Law">
        <p>
          German law applies. If you are a consumer resident in the EU, this
          does not deprive you of the protection of mandatory provisions of the
          law of your country of residence. We are neither obliged nor willing
          to take part in dispute resolution proceedings before a consumer
          arbitration board.
        </p>
      </Section>

      <p className="mt-2 text-[12px] text-dim">Last updated: September 2026</p>
    </>
  );

  const de = (
    <>
      <Section title="1. Was Fightbase ist">
        <p>
          Fightbase ist ein kostenloser, privat betriebener Kalender für
          Kampfsport-Veranstaltungen. Betreiber ist Henrik Weins; das Projekt
          ist nicht-kommerziell. Die Nutzung kostet nichts, es gibt kein Abo
          und nichts zu kaufen — und damit auch keine Zahlung, keine Kündigung
          und keine Rückerstattung.
        </p>
      </Section>

      <Section title="2. Eventdaten sind Information, keine Zusage">
        <p className="mb-2">
          Termine, Kampfkarten und Übertragungswege stammen aus den
          Ankündigungen der Veranstalter selbst und werden so genau gepflegt,
          wie es uns möglich ist. Kampfsport-Terminpläne ändern sich ständig:
          Kämpfe werden umgestellt, Kämpfer sagen ab, Veranstaltungen werden
          verschoben, und Übertragungsrechte wechseln zwischen Anbietern —
          manchmal wenige Tage vor dem Termin.
        </p>
        <p>
          Nimm alles hier als Ausgangspunkt, nicht als Bestätigung. Bevor du
          ein Ticket kaufst, eine Reise buchst oder für einen Stream bezahlst,
          prüfe die Seite des Veranstalters. Für Kosten, die daraus entstehen,
          dass ein Eintrag veraltet oder falsch war, übernehmen wir keine
          Haftung.
        </p>
      </Section>

      <Section title="3. Keine Verbindung zu den Veranstaltern">
        <p>
          Fightbase ist unabhängig. Wir stehen mit keiner hier aufgeführten
          Promotion, keinem Verband und keinem Sender in Verbindung, handeln
          nicht in deren Auftrag und werden von ihnen nicht unterstützt. Ihre
          Namen und Veranstaltungstitel werden beschreibend verwendet, um die
          Events zu bezeichnen. Alle Marken gehören ihren jeweiligen Inhabern.
          Wir verkaufen keine Tickets und verlinken keine inoffiziellen
          Streams.
        </p>
      </Section>

      <Section title="4. Konten">
        <p className="mb-2">
          Fightbase lässt sich ohne Konto nutzen. Ein Konto brauchst du nur für
          geräteübergreifende Favoriten, E-Mail-Erinnerungen und das Forum. Für
          den sicheren Zugang zu deinem Konto und für alles, was darüber
          gepostet wird, bist du selbst verantwortlich.
        </p>
        <p>
          Registriere dich unter deinem eigenen Namen oder einem Pseudonym —
          aber nicht, indem du dich als jemand anderes ausgibst. Du kannst dein
          Konto jederzeit per E-Mail an uns löschen lassen, siehe{" "}
          <Link href="/datenschutz" className="text-accentText">
            Datenschutzerklärung
          </Link>
          .
        </p>
      </Section>

      <Section title="5. Forenregeln">
        <p className="mb-2">
          Im Forum gilt ein Grundsatz: Es geht um Kämpfe, nicht um einander.
          Konkret nicht erlaubt sind:
        </p>
        <ul className="list-disc pl-5 mb-2 space-y-1">
          <li>
            Beleidigungen, Belästigung, Drohungen sowie Angriffe auf Herkunft,
            Religion, Geschlecht oder sexuelle Orientierung
          </li>
          <li>
            rechtswidrige Inhalte sowie Links zu illegalen Streams und anderem
            rechtsverletzenden Material
          </li>
          <li>
            Werbung, Empfehlungslinks, Spam und von Bots erzeugte Beiträge
          </li>
          <li>
            personenbezogene Daten anderer — Adressen, Telefonnummern, private
            Nachrichten
          </li>
          <li>
            Inhalte, die du nicht veröffentlichen darfst, einschließlich
            urheberrechtlich geschützter Fotos
          </li>
        </ul>
        <p>
          Die Rechte an deinen Beiträgen bleiben bei dir; du räumst uns das
          Recht ein, sie auf Fightbase anzuzeigen. Für deine Beiträge bist du
          selbst verantwortlich, nicht wir — was wir damit tun, steht im
          nächsten Abschnitt.
        </p>
      </Section>

      <Section title="6. Moderation">
        <p>
          Wir können Beiträge, Themen oder Konten entfernen, die gegen diese
          Regeln verstoßen — bei eindeutig rechtswidrigen oder missbräuchlichen
          Inhalten in der Regel ohne vorherige Ankündigung. Wenn du meinst,
          dass etwas zu Unrecht entfernt wurde, schreib uns; wir sehen es uns
          noch einmal an. Hinweise auf rechtswidrige Inhalte nehmen wir unter
          der Adresse im{" "}
          <Link href="/impressum" className="text-accentText">
            Impressum
          </Link>{" "}
          entgegen und bearbeiten sie zügig.
        </p>
      </Section>

      <Section title="7. Verfügbarkeit">
        <p>
          Fightbase wird so angeboten, wie es ist, ohne Zusage einer
          Verfügbarkeit. Es ist ein Nebenprojekt: Die Seite kann wegen Wartung
          nicht erreichbar sein, ausfallen oder ganz eingestellt werden.
          Funktionen können sich ändern oder wegfallen. Sollte das Projekt
          enden, kündigen wir das hier vorher an, soweit uns das möglich ist.
        </p>
      </Section>

      <Section title="8. Externe Links">
        <p>
          Wir verlinken auf Veranstalter, Verbände und Sender. Diese Seiten
          gehören nicht uns, und wir haben keinen Einfluss auf ihre Inhalte.
          Dafür sind allein deren Betreiber verantwortlich.
        </p>
      </Section>

      <Section title="9. Haftung">
        <p>
          Wir haften unbeschränkt für Schäden aus der Verletzung des Lebens,
          des Körpers oder der Gesundheit sowie für Schäden, die auf Vorsatz
          oder grober Fahrlässigkeit beruhen. Bei einfacher Fahrlässigkeit
          haften wir nur bei Verletzung einer Pflicht, deren Erfüllung die
          ordnungsgemäße Durchführung dieses Vertrags überhaupt erst ermöglicht
          und auf deren Einhaltung du regelmäßig vertrauen darfst
          (Kardinalpflicht), und dann begrenzt auf den bei Vertragsschluss
          vorhersehbaren, vertragstypischen Schaden. Die Haftung nach dem
          Produkthaftungsgesetz bleibt unberührt.
        </p>
      </Section>

      <Section title="10. Änderungen dieser Bedingungen">
        <p>
          Diese Bedingungen können angepasst werden, wenn sich die Seite
          weiterentwickelt. Es gilt die jeweils auf dieser Seite
          veröffentlichte Fassung. Wesentliche Änderungen, die registrierte
          Nutzer betreffen, kündigen wir auf der Seite an.
        </p>
      </Section>

      <Section title="11. Anwendbares Recht">
        <p>
          Es gilt deutsches Recht. Bist du Verbraucher mit Wohnsitz in der EU,
          bleiben zwingende Schutzvorschriften des Rechts deines
          Aufenthaltsstaats davon unberührt. Zur Teilnahme an einem
          Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
          sind wir weder verpflichtet noch bereit.
        </p>
      </Section>

      <p className="mt-2 text-[12px] text-dim">Stand: September 2026</p>
    </>
  );

  return (
    <LegalShell
      en={en}
      de={de}
      titleEn="Terms of Use"
      titleDe="Nutzungsbedingungen"
    />
  );
}
