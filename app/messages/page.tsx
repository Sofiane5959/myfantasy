import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Conversation } from "@/lib/types";
import MessagesClient from "./messages-client";

export const metadata: Metadata = {
  title: "Messages — MyFantasy",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function ageFrom(birthdate: string): number {
  const bd = new Date(`${birthdate}T00:00:00Z`);
  const diff = Date.now() - bd.getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

/** Extrait en helper : `Date.now()` en corps de composant viole react-hooks/purity. */
function isOnline(lastSeenAt: string): boolean {
  return new Date(lastSeenAt).getTime() > Date.now() - 5 * 60 * 1000;
}

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/messages");

  // RLS : ne renvoie que les matchs dont l'utilisatrice fait partie.
  const { data: matches } = await supabase
    .from("matches")
    .select("id, user_a, user_b, safe_word")
    .order("created_at", { ascending: false });

  const matchRows = matches ?? [];
  const peerIds = matchRows.map((m) => (m.user_a === user.id ? m.user_b : m.user_a));

  // Lisible uniquement grâce au match mutuel (policy profiles_select_self_or_matched).
  const { data: peers } = peerIds.length
    ? await supabase
        .from("profiles")
        .select("id, display_name, birthdate, avatar_color, verified, last_seen_at")
        .in("id", peerIds)
    : { data: [] };

  // Derniers messages. À ce volume, une seule requête suffit ; passer à une
  // vue matérialisée si le nombre de matchs par utilisatrice devient grand.
  const { data: recent } = matchRows.length
    ? await supabase
        .from("messages")
        .select("match_id, body, created_at")
        .in(
          "match_id",
          matchRows.map((m) => m.id),
        )
        .order("created_at", { ascending: false })
        .limit(200)
    : { data: [] };

  const lastByMatch = new Map<string, { body: string; createdAt: string }>();
  for (const m of recent ?? []) {
    if (!lastByMatch.has(m.match_id)) {
      lastByMatch.set(m.match_id, { body: m.body, createdAt: m.created_at });
    }
  }

  const peerById = new Map((peers ?? []).map((p) => [p.id, p]));

  const conversations: Conversation[] = matchRows.flatMap((m) => {
    const peerId = m.user_a === user.id ? m.user_b : m.user_a;
    const peer = peerById.get(peerId);
    if (!peer) return [];
    return [
      {
        matchId: m.id,
        safeWord: m.safe_word,
        peer: {
          id: peer.id,
          displayName: peer.display_name,
          age: ageFrom(peer.birthdate),
          avatarColor: peer.avatar_color,
          verified: peer.verified,
          online: isOnline(peer.last_seen_at),
        },
        lastMessage: lastByMatch.get(m.id) ?? null,
      },
    ];
  });

  // Invitations reçues : l'expéditrice reste masquée tant qu'on n'a pas accepté.
  const { data: pending } = await supabase
    .from("invitations")
    .select("id, created_at")
    .eq("receiver_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return (
    <MessagesClient
      conversations={conversations}
      pendingInvitations={pending ?? []}
      currentUserId={user.id}
    />
  );
}
