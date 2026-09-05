import HomeClient from "./HomeClient";
import { getEvents } from "@/lib/eventsDb";

// Dünne Server-Hülle um die eigentliche App: Sie lädt die Events einmal auf dem
// Server und reicht sie an die Client-Komponente weiter. Vorher lagen sie als
// Konstante im Bundle — jetzt kommen sie aus der Datenbank und werden per ISR
// aufgefrischt, ohne dass ein Deploy nötig ist.
// Muss ein Literal sein — Next.js liest diesen Wert statisch aus und
// erkennt keine importierten Bezeichner. Entspricht EVENTS_REVALIDATE.
export const revalidate = 3600;

export default async function Home() {
  const events = await getEvents();
  return <HomeClient events={events} />;
}
