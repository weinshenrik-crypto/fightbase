import { createClient } from "@supabase/supabase-js";

// Server-only client using the service-role key, which bypasses Row Level
// Security. Never import this from a client component — it must only run
// in API routes / server code.
//
// Next.js patches the global fetch() and can cache its responses even in a
// force-dynamic route handler, which would silently freeze query results
// across cron runs. Force every request this client makes to bypass that.
export function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false },
      global: {
        fetch: (url, options = {}) =>
          fetch(url, { ...options, cache: "no-store" }),
      },
    }
  );
}
