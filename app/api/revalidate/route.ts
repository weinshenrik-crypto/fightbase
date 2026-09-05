import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

// Events werden per ISR alle 60 Minuten neu geholt. Wer gerade ein Event in
// Supabase eingetragen hat, will es aber sofort sehen — dieser Endpunkt wirft
// den Event-Cache weg, sodass die nächste Anfrage frisch aus der Datenbank liest.
//
// Aufruf:
//   curl -X POST https://fightbase.io/api/revalidate \
//        -H "Authorization: Bearer $CRON_SECRET"
//
// Gedacht für den Handbetrieb nach einer Änderung und später für einen
// n8n-Workflow, der Events automatisch einträgt.
export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Next 16 verlangt ein cacheLife-Profil als zweites Argument. `{ expire: 0 }`
  // heißt: der Eintrag gilt sofort als abgelaufen, die nächste Anfrage holt frisch.
  revalidateTag("events", { expire: 0 });

  return NextResponse.json({
    revalidated: "events",
    at: new Date().toISOString(),
  });
}
