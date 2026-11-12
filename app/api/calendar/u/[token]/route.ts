import { buildCalendar } from "@/lib/ics";
import { icsResponse, notFoundIcs, stripIcs } from "@/lib/icsResponse";
import { TOKEN_PATTERN } from "@/lib/calendarTokens";
import { eventMatchesFavorite, type Fav } from "@/lib/favorites";
import { getEvents } from "@/lib/eventsDb";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Persoenlicher Feed: GET /api/calendar/u/<token>.ics
//
// Alle Events, die zu irgendeinem Favoriten des Kontos passen — nach
// derselben Regel wie die E-Mail-Erinnerungen (lib/favorites.ts).
//
// Der Token steht in der URL. Die Antwort darf deshalb in keinem gemeinsamen
// Cache landen (icsResponse personal), und ein falscher Token bekommt
// dieselbe nackte 404 wie ein unbekannter — ohne Hinweis, was nicht stimmt.
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const token = stripIcs((await params).token);
  // Formpruefung vor jedem Datenbankzugriff: Was kein Token sein kann,
  // kostet keine Abfrage.
  if (!token || !TOKEN_PATTERN.test(token)) return notFoundIcs();

  const db = supabaseAdmin();
  const { data: row } = await db
    .from("calendar_tokens")
    .select("user_id")
    .eq("token", token)
    .maybeSingle();
  if (!row) return notFoundIcs();

  const { data: favs } = await db
    .from("favorites")
    .select("type, value")
    .eq("user_id", row.user_id);
  const list = (favs ?? []) as Fav[];

  const events = (await getEvents()).filter((e) =>
    list.some((f) => eventMatchesFavorite(e, f))
  );
  return icsResponse(buildCalendar(events, "Fightbase · My favorites"), { personal: true });
}
