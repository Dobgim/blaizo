/**
 * Supabase environment.
 *
 * The site has to build and render before the client has a Supabase project,
 * so a missing configuration is a supported state rather than a crash: the
 * query layer falls back to placeholder content and every listing shows its
 * empty state. `isSupabaseConfigured` is the single place that decides.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured =
  SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
