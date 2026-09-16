import { NextResponse } from "next/server";

// Digital Asset Links für die Android-App.
//
// Android ruft beim Installieren https://fightbase.io/.well-known/assetlinks.json
// ab (next.config.js schreibt den Pfad hierher um) und vergleicht die
// Fingerabdrücke unten mit der Signatur der App. Stimmt einer, öffnet ein Link
// auf fightbase.io die App statt den Browser — ohne Rückfrage.
//
// Warum aus einer Umgebungsvariablen statt als Datei in public/:
// Der richtige Fingerabdruck ist der des **App-Signaturschlüssels aus der Play
// Console** (Setup -> App integrity), nicht der des Upload-Schlüssels. Beim
// Hochladen eines AAB signiert Google die Auslieferung selbst neu. Die
// Variable kann also gesetzt werden, ohne dass jemand einen Wert erfindet, und
// ein Debug-Fingerabdruck landet nicht versehentlich dauerhaft im Repo.
//
// Fehlt die Variable, antwortet die Route mit 404 — genau der Zustand von
// vorher: Die Deep Links greifen dann nicht, sonst ändert sich nichts.
export const dynamic = "force-dynamic";

/** Erlaubt mehrere Fingerabdrücke, getrennt durch Komma (Upload, Play, Debug). */
function fingerprints(): string[] {
  return (process.env.ANDROID_CERT_SHA256 ?? "")
    .split(",")
    .map((f) => f.trim().toUpperCase())
    // Format prüfen statt durchreichen: 32 Hex-Paare mit Doppelpunkt. Ein
    // vertippter Wert wäre sonst eine Datei, die gültig aussieht und nie
    // verifiziert — und dieser Fehler ist von außen nicht zu sehen.
    .filter((f) => /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/.test(f));
}

export async function GET() {
  const certs = fingerprints();
  if (certs.length === 0) {
    return new NextResponse("Not found", { status: 404 });
  }

  return NextResponse.json(
    [
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          package_name: "io.fightbase.app",
          sha256_cert_fingerprints: certs,
        },
      },
    ],
    {
      headers: {
        // Android liest die Datei beim Installieren und danach selten. Ein
        // langer Cache würde einen neuen Fingerabdruck verzögern.
        "Cache-Control": "public, max-age=300",
        "Content-Type": "application/json",
      },
    }
  );
}
