import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isMissingTable } from "@/lib/calendarTokens";

// Gibt den geheimen Token fuer den persoenlichen Kalender-Feed zurueck und
// legt ihn beim ersten Aufruf an. `?rotate=1` ersetzt ihn — der Knopf
// "Link zuruecksetzen" fuer den Fall, dass der Link geteilt wurde.
//
// Wie api/account/delete: Es zaehlt nur das Konto hinter dem mitgeschickten
// Zugangstoken. Eine Benutzer-ID als Parameter gibt es bewusst nicht.
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  const session = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : "";
  if (!session) {
    return NextResponse.json({ error: "not_signed_in" }, { status: 401 });
  }

  const db = supabaseAdmin();
  const { data: userData, error: userError } = await db.auth.getUser(session);
  const user = userData?.user;
  if (userError || !user) {
    return NextResponse.json({ error: "invalid_session" }, { status: 401 });
  }

  const rotate = new URL(req.url).searchParams.get("rotate") === "1";

  if (!rotate) {
    const { data: existing, error } = await db
      .from("calendar_tokens")
      .select("token")
      .eq("user_id", user.id)
      .maybeSingle();
    if (isMissingTable(error)) {
      return NextResponse.json({ error: "migration_missing" }, { status: 503 });
    }
    if (error) {
      return NextResponse.json({ error: "token_query_failed" }, { status: 500 });
    }
    if (existing) return NextResponse.json({ token: existing.token });
  }

  const token = randomBytes(32).toString("base64url");
  const { error } = await db
    .from("calendar_tokens")
    .upsert({ user_id: user.id, token, created_at: new Date().toISOString() });
  if (isMissingTable(error)) {
    return NextResponse.json({ error: "migration_missing" }, { status: 503 });
  }
  if (error) {
    return NextResponse.json({ error: "token_write_failed" }, { status: 500 });
  }
  return NextResponse.json({ token });
}
