import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { DiscoveryProfile } from "@/lib/types";
import MatchList from "./match-list";
import VisibilityToggle from "./visibility-toggle";

export const metadata: Metadata = {
  title: "Pour toi — MyFantasy",
  robots: { index: false, follow: false },
};

// Feed personnalisé : jamais mis en cache.
export const dynamic = "force-dynamic";

export default async function MatchesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/matches");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_visible")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) redirect("/onboarding");

  // Le scoring et le filtrage sont faits en base. Le navigateur ne reçoit
  // que des profils déjà anonymisés.
  // `touch_last_seen` est dans le Promise.all et non en `void` : les builders
  // Supabase sont paresseux, un appel non attendu ne part jamais.
  const [{ data, error }, { count: pendingCount }] = await Promise.all([
    supabase.rpc("discovery_feed", { limit_count: 20 }),
    supabase
      .from("invitations")
      .select("id", { count: "exact", head: true })
      .eq("receiver_id", user.id)
      .eq("status", "pending"),
    supabase.rpc("touch_last_seen"),
  ]);

  const profiles = (data ?? []) as DiscoveryProfile[];

  return (
    <main className="min-h-screen pb-10">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[color:var(--surface-3)] bg-[color:var(--bg)] px-5 py-4">
        <div>
          <h1 className="text-xl font-bold">Pour toi ✦</h1>
          <p className="text-xs text-[color:var(--muted)]">
            {profiles.length} profil{profiles.length > 1 ? "s" : ""} compatible
            {profiles.length > 1 ? "s" : ""}
          </p>
        </div>
        <nav className="flex items-center gap-2">
          <Link
            href="/messages"
            className="relative rounded-full bg-[color:var(--surface-3)] px-3 py-1.5 text-xs text-[color:var(--muted)]"
          >
            💌 Messages
            {pendingCount ? (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[color:var(--accent)] px-1 text-[10px] font-bold text-white">
                {pendingCount}
              </span>
            ) : null}
          </Link>
          <Link
            href="/onboarding"
            className="rounded-full border border-[color:var(--line)] bg-[color:var(--surface-2)] px-3 py-1.5 text-xs text-[color:var(--accent)]"
          >
            Mon profil
          </Link>
        </nav>
      </header>

      <div className="mx-auto flex max-w-sm flex-col gap-4 px-4 pt-4">
        <VisibilityToggle initial={profile.is_visible} />

        <div className="flex items-center gap-3 rounded-2xl bg-[color:var(--surface)] px-4 py-3">
          <span className="text-lg" aria-hidden="true">
            🔒
          </span>
          <span className="text-xs leading-relaxed text-[color:var(--muted)]">
            Les prénoms ne sont échangés qu&apos;après acceptation mutuelle de
            l&apos;invitation.
          </span>
        </div>

        {error ? (
          <p
            role="alert"
            className="rounded-2xl border border-[color:var(--danger)] bg-[color:var(--surface)] px-4 py-3 text-xs text-[color:var(--danger)]"
          >
            Impossible de charger tes matchs pour le moment. Réessaie dans un
            instant.
          </p>
        ) : (
          <MatchList profiles={profiles} />
        )}
      </div>
    </main>
  );
}
