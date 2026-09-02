import { createClient } from "@supabase/supabase-js";

// Server-only client using the service-role key, which bypasses Row Level
// Security. Never import this from a client component — it must only run
// in API routes / server code.
export function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
