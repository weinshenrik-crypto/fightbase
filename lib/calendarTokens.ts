// Gemeinsames der Routen api/calendar/token und api/calendar/u/[token].

/** 32 Byte als base64url, ohne Auffuellung: genau 43 Zeichen. */
export const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

/**
 * Ob ein Supabase-Fehler bedeutet, dass migration-calendar-tokens.sql noch
 * nicht gelaufen ist. 42P01 kommt von Postgres, PGRST205 von PostgREST, wenn
 * die Tabelle nicht im Schema-Cache steht.
 */
export function isMissingTable(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    /calendar_tokens/.test(error.message ?? "")
  );
}
