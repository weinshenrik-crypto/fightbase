// Gemeinsames der Kalender-Routen unter app/api/calendar/.

/** "jiu-jitsu.ics" -> "jiu-jitsu"; ohne Endung null (die Route antwortet dann 404). */
export function stripIcs(param: string): string | null {
  const decoded = decodeURIComponent(param);
  return decoded.endsWith(".ics") && decoded.length > 4 ? decoded.slice(0, -4) : null;
}

export function notFoundIcs(): Response {
  return new Response(null, { status: 404 });
}

/**
 * `personal`: Der persoenliche Feed traegt den Token in der URL und darf
 * deshalb in keinem gemeinsamen Cache landen. Oeffentliche Feeds duerfen eine
 * Stunde im CDN liegen — so lange cachen die Seiten die Events ohnehin.
 */
export function icsResponse(
  body: string,
  { personal = false, filename }: { personal?: boolean; filename?: string } = {}
): Response {
  const headers: Record<string, string> = {
    "Content-Type": "text/calendar; charset=utf-8",
    "Cache-Control": personal ? "private, max-age=0" : "public, s-maxage=3600",
  };
  if (filename) headers["Content-Disposition"] = `attachment; filename="${filename}"`;
  if (personal) headers["X-Robots-Tag"] = "noindex";
  return new Response(body, { status: 200, headers });
}
