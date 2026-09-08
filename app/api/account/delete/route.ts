import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Löscht das Konto des Aufrufers samt seiner Daten.
//
// Google Play verlangt seit 2024, dass eine App, in der man ein Konto anlegen
// kann, die Löschung auch in der App anbietet — ein Hinweis "schreib uns eine
// E-Mail" reicht nicht. Der App Store verlangt dasselbe.
//
// Sicherheitsentscheidung: gelöscht wird ausschließlich das Konto, zu dem das
// mitgeschickte Zugangstoken gehört. Es gibt bewusst keinen Parameter für eine
// Benutzer-ID — sonst wäre diese Route ein Werkzeug, um fremde Konten zu
// löschen. Wer eine fremde ID kennt, kann damit nichts anfangen.
export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : null;

  if (!token) {
    return NextResponse.json({ error: "not_signed_in" }, { status: 401 });
  }

  const db = supabaseAdmin();

  // Das Token gegen Supabase prüfen, statt ihm zu glauben. Ein abgelaufenes
  // oder gefälschtes Token liefert hier keinen Benutzer.
  const { data: userData, error: userError } = await db.auth.getUser(token);
  const user = userData?.user;
  if (userError || !user) {
    return NextResponse.json({ error: "invalid_session" }, { status: 401 });
  }

  // Forenbeiträge und -themen zuerst: sie hängen per Cascade an profiles,
  // aber ein ausdrückliches Löschen macht die Absicht sichtbar und funktioniert
  // auch dann, wenn die Migration mit den Cascade-Regeln noch nicht gelaufen
  // ist. Reihenfolge: Beiträge vor Themen, sonst hängen Antworten in der Luft.
  await db.from("forum_posts").delete().eq("user_id", user.id);
  await db.from("forum_threads").delete().eq("created_by", user.id);
  await db.from("favorites").delete().eq("user_id", user.id);
  await db.from("sent_notifications").delete().eq("user_id", user.id);
  await db.from("reports").delete().eq("reporter_id", user.id);
  await db.from("profiles").delete().eq("id", user.id);

  // Zum Schluss der Auth-Datensatz. Erst danach ist die E-Mail-Adresse weg —
  // vorher würde ein Fehler weiter oben ein Konto ohne Profil hinterlassen.
  const { error: deleteError } = await db.auth.admin.deleteUser(user.id);
  if (deleteError) {
    return NextResponse.json(
      { error: "delete_failed", detail: deleteError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ deleted: true });
}
