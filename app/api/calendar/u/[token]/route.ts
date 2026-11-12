import { icsResponse, notFoundIcs, stripIcs } from "@/lib/icsResponse";
import { TOKEN_PATTERN } from "@/lib/calendarTokens";
import { personalFeed } from "@/lib/personalFeed";
import type { Fav } from "@/lib/favorites";
import { getEvents } from "@/lib/eventsDb";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Persoenlicher Feed: GET /api/calendar/u/<token>.ics
//
// Alle Events, die zu irgendeinem Favoriten des Kontos passen — nach
// derselben Regel wie die E-Mail-Erinnerungen (lib/favorites.ts). Die
// Fehlerbehandlung steckt in lib/personalFeed.ts (DB-Fehler -> 503).
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
  const result = await personalFeed({
    lookupToken: async () =>
      await db.from("calendar_tokens").select("user_id").eq("token", token).maybeSingle(),
    loadFavorites: async (userId) => {
      const { data, error } = await db.from("favorites").select("type, value").eq("user_id", userId);
      return { data: data as Fav[] | null, error };
    },
    events: await getEvents(),
  });

  if (result.status === 404) return notFoundIcs();
  if (result.status === 503 || !result.body) {
    return new Response(null, { status: 503, headers: { "Retry-After": "3600" } });
  }
  return icsResponse(result.body, { personal: true });
}
