import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseEnv } from "@/lib/env";

/**
 * Client Supabase côté serveur (Server Components, Server Actions, Route
 * Handlers). C'est le chemin par défaut : les données de profil ne transitent
 * plus par le navigateur avant d'avoir été filtrées.
 */
export async function createClient() {
  const { url, anonKey } = supabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Appelé depuis un Server Component : le rafraîchissement de session
          // est déjà assuré par le proxy (proxy.ts), on peut ignorer.
        }
      },
    },
  });
}
