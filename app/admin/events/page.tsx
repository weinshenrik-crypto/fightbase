import type { Metadata } from "next";
import AdminEventsClient from "./AdminEventsClient";

// Die Seite liest und schreibt ausschliesslich im Browser mit dem anon key.
// Was sie darf, entscheiden die RLS-Policies der events-Tabelle ("Only admins
// can insert/update/delete events"), nicht diese Datei. Ein Nicht-Admin, der
// die URL kennt, bekommt hier also ein Formular zu sehen und beim Speichern
// eine Fehlermeldung von Postgres — nicht etwa Schreibzugriff.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Events verwalten | Fightbase",
  // Kein Grund, eine Pflegeseite in den Index zu lassen.
  robots: { index: false, follow: false },
};

export default function AdminEventsPage() {
  return <AdminEventsClient />;
}
