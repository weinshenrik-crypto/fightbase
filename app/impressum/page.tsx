import LegalShell from "@/components/LegalShell";

export const metadata = {
  title: "Impressum — Fightbase",
};

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="font-semibold text-[15px] mb-1">{children}</h2>;
}

function P({
  children,
  last,
}: {
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <p
      className={`text-[14px] text-muted leading-relaxed ${
        last ? "" : "mb-5"
      }`}
    >
      {children}
    </p>
  );
}

const ADDRESS = (
  <>
    Henrik Weins
    <br />
    Friedensstraße 4
    <br />
    52224 Stolberg (Rhld.)
  </>
);

export default function Impressum() {
  const en = (
    <>
      <H>Information according to § 5 DDG (German Digital Services Act)</H>
      <P>
        {ADDRESS}
        <br />
        Germany
      </P>

      <H>Contact</H>
      <P>Email: weinshenrik@gmail.com</P>

      <H>
        Responsible for content according to § 18 Abs. 2 MStV (German
        Interstate Media Treaty)
      </H>
      <P>Henrik Weins (address as above)</P>

      <H>Disclaimer</H>
      <P last>
        Fightbase is a private, non-commercial project providing an overview of
        combat sports events. Despite careful review of the content, we assume
        no liability for the content of external links. The operators of
        linked pages are solely responsible for their content.
      </P>
    </>
  );

  const de = (
    <>
      <H>Angaben gemäß § 5 DDG</H>
      <P>
        {ADDRESS}
        <br />
        Deutschland
      </P>

      <H>Kontakt</H>
      <P>E-Mail: weinshenrik@gmail.com</P>

      <H>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</H>
      <P>Henrik Weins (Anschrift wie oben)</P>

      <H>Haftung für Inhalte und Links</H>
      <P last>
        Fightbase ist ein privates, nicht-kommerzielles Projekt und bietet
        einen Überblick über Kampfsport-Veranstaltungen. Die Inhalte werden
        sorgfältig geprüft; für die Inhalte externer Links wird dennoch keine
        Haftung übernommen. Für diese sind ausschließlich die Betreiber der
        verlinkten Seiten verantwortlich.
      </P>
    </>
  );

  return (
    <LegalShell
      en={en}
      de={de}
      titleEn="Legal Notice (Impressum)"
      titleDe="Impressum"
    />
  );
}
