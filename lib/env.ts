/**
 * Lecture des variables d'environnement Supabase.
 *
 * Volontairement paresseux : un `process.env.X!` au niveau module faisait
 * planter l'import avec une page blanche et aucun message exploitable quand
 * `.env.local` était absent. Ici l'erreur est explicite et dit quoi faire.
 */
export function supabaseEnv() {
  // Ces deux références doivent rester littérales pour que Next les inline.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    const missing = [
      !url && "NEXT_PUBLIC_SUPABASE_URL",
      !anonKey && "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ]
      .filter(Boolean)
      .join(", ");

    throw new Error(
      `Configuration Supabase incomplète (${missing} manquant). ` +
        `Copie .env.example vers .env.local et renseigne tes clés ` +
        `(Supabase → Project Settings → API).`,
    );
  }

  return { url, anonKey };
}
