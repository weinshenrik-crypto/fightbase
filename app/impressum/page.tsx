import Link from "next/link";

export const metadata = {
  title: "Impressum — Fightbase",
};

export default function Impressum() {
  return (
    <div className="max-w-[480px] md:max-w-2xl mx-auto min-h-screen px-5 py-10 font-body text-text">
      <Link href="/" className="text-[13px] text-accent">
        ← Back to Fightbase
      </Link>
      <h1 className="font-display font-bold text-[26px] mt-4 mb-6">
        Impressum
      </h1>

      <h2 className="font-semibold text-[15px] mb-1">
        Angaben gemäß § 5 TMG
      </h2>
      <p className="text-[14px] text-muted leading-relaxed mb-5">
        Henrik Weins
        <br />
        Friedensstraße 4
        <br />
        52224 Stolberg (Rhld.)
        <br />
        Deutschland
      </p>

      <h2 className="font-semibold text-[15px] mb-1">Kontakt</h2>
      <p className="text-[14px] text-muted leading-relaxed mb-5">
        E-Mail: weinshenrik@gmail.com
      </p>

      <h2 className="font-semibold text-[15px] mb-1">
        Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
      </h2>
      <p className="text-[14px] text-muted leading-relaxed mb-5">
        Henrik Weins (Anschrift wie oben)
      </p>

      <h2 className="font-semibold text-[15px] mb-1">Hinweis</h2>
      <p className="text-[14px] text-muted leading-relaxed">
        Fightbase ist ein privates, nicht-kommerzielles Projekt zur
        Übersicht von Kampfsport-Events. Trotz sorgfältiger inhaltlicher
        Kontrolle übernehmen wir keine Haftung für die Inhalte externer
        Links. Für den Inhalt der verlinkten Seiten sind ausschließlich
        deren Betreiber verantwortlich.
      </p>
    </div>
  );
}
