import HomeClient from "./HomeClient";
import { getEvents } from "@/lib/eventsDb";

// Dünne Server-Hülle um die eigentliche App: Sie lädt die Events einmal auf dem
// Server und reicht sie an die Client-Komponente weiter. Vorher lagen sie als
// Konstante im Bundle — jetzt kommen sie aus der Datenbank und werden per ISR
// aufgefrischt, ohne dass ein Deploy nötig ist.
// Muss ein Literal sein — Next.js liest diesen Wert statisch aus und
// erkennt keine importierten Bezeichner. Entspricht EVENTS_REVALIDATE.
export const revalidate = 3600;

// Eigener Canonical, weil die Startseite unter zwei Hostnamen erreichbar ist
// (fightbase.io und www.fightbase.io liefern byte-gleichen Inhalt) und ohne
// diesen Hinweis jede Seite doppelt im Index stehen kann. Loest relativ gegen
// metadataBase aus app/layout.tsx auf.
export const metadata = {
  alternates: { canonical: "/" },
};

export default async function Home() {
  const events = await getEvents();
  return <HomeClient events={events} />;
}
