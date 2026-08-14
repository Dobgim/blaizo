import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
} from "@/lib/supabase/env";

/**
 * A request-independent Supabase client for public reads.
 *
 * The cookie-based client in `server.ts` cannot be used everywhere: reading
 * cookies is only legal inside a request, so calling it from
 * generateStaticParams or sitemap.ts fails the build outright. This client
 * carries no session at all.
 *
 * That is the correct choice for the read layer regardless. Every public query
 * runs as `anon` and RLS already limits it to published rows, so a session
 * would buy nothing — and depending on cookies would opt every public page
 * into dynamic rendering for no reason. Anything that genuinely needs the
 * signed-in user (the admin panel, the application insert) keeps using the
 * cookie client.
 */
export function createStaticClient() {
  if (!isSupabaseConfigured) return null;

  return createSupabaseClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
