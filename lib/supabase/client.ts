import { createBrowserClient } from "@supabase/ssr";
import { supabaseEnv } from "@/lib/env";

/** Client Supabase côté navigateur — utilisé pour le realtime uniquement. */
export function createClient() {
  const { url, anonKey } = supabaseEnv();
  return createBrowserClient(url, anonKey);
}
