"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  CATEGORY_LABELS,
  HARD_LIMITS,
  INTENSITY_LABELS,
  ROLES,
  SEEKING,
} from "@/lib/constants";

export type ActionResult = { ok: true } | { ok: false; error: string };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Session expirée. Reconnecte-toi.");
  return { supabase, user };
}

/** Ne garde que les valeurs présentes dans la taxonomie de référence. */
function whitelist(values: unknown, allowed: readonly string[]): string[] {
  if (!Array.isArray(values)) return [];
  return [...new Set(values.filter((v): v is string => typeof v === "string"))]
    .filter((v) => allowed.includes(v))
    .slice(0, allowed.length);
}

function isAdult(birthdate: string): boolean {
  const bd = new Date(`${birthdate}T00:00:00Z`);
  if (Number.isNaN(bd.getTime())) return false;
  const limit = new Date();
  limit.setUTCFullYear(limit.getUTCFullYear() - 18);
  return bd <= limit;
}

export type OnboardingInput = {
  displayName: string;
  birthdate: string; // YYYY-MM-DD
  categories: string[];
  intensity: string;
  role: string;
  seeking: string[];
  hardLimits: string[];
  note: string;
  isVisible: boolean;
};

export async function saveOnboarding(
  input: OnboardingInput,
): Promise<ActionResult> {
  try {
    const { supabase } = await requireUser();

    // Toute cette validation est rejouée côté base (contraintes CHECK +
    // upsert_my_profile). Ici c'est pour un message d'erreur lisible.
    const displayName = input.displayName?.trim() ?? "";
    if (displayName.length < 1 || displayName.length > 40) {
      return { ok: false, error: "Choisis un prénom entre 1 et 40 caractères." };
    }
    if (!isAdult(input.birthdate)) {
      return { ok: false, error: "Tu dois avoir 18 ans ou plus pour t'inscrire." };
    }

    const categories = whitelist(input.categories, CATEGORY_LABELS);
    if (categories.length === 0) {
      return { ok: false, error: "Sélectionne au moins une catégorie." };
    }
    if (!INTENSITY_LABELS.includes(input.intensity)) {
      return { ok: false, error: "Choisis ton intensité." };
    }
    if (!ROLES.includes(input.role as (typeof ROLES)[number])) {
      return { ok: false, error: "Choisis ton énergie naturelle." };
    }

    const note = (input.note ?? "").trim().slice(0, 280);

    const { error } = await supabase.rpc("upsert_my_profile", {
      p_display_name: displayName,
      p_birthdate: input.birthdate,
      p_role: input.role,
      p_intensity: input.intensity,
      p_categories: categories,
      p_seeking: whitelist(input.seeking, SEEKING),
      p_hard_limits: whitelist(input.hardLimits, HARD_LIMITS),
      p_note: note.length > 0 ? note : null,
      p_is_visible: Boolean(input.isVisible),
    });

    if (error) return { ok: false, error: error.message };

    revalidatePath("/matches");
    revalidatePath("/onboarding");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue." };
  }
}

export async function sendInvitation(targetId: string): Promise<ActionResult> {
  try {
    if (!UUID_RE.test(targetId)) return { ok: false, error: "Profil invalide." };
    const { supabase } = await requireUser();

    const { error } = await supabase.rpc("send_invitation", {
      p_target: targetId,
    });
    if (error) return { ok: false, error: error.message };

    revalidatePath("/matches");
    revalidatePath("/messages");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue." };
  }
}

/** « Passer » est désormais persisté : le profil ne réapparaît pas au refresh. */
export async function passProfile(targetId: string): Promise<ActionResult> {
  try {
    if (!UUID_RE.test(targetId)) return { ok: false, error: "Profil invalide." };
    const { supabase, user } = await requireUser();

    const { error } = await supabase
      .from("passes")
      .upsert({ user_id: user.id, target_id: targetId });
    if (error) return { ok: false, error: error.message };

    revalidatePath("/matches");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue." };
  }
}

export async function respondToInvitation(
  invitationId: string,
  accept: boolean,
): Promise<ActionResult> {
  try {
    if (!UUID_RE.test(invitationId)) {
      return { ok: false, error: "Invitation invalide." };
    }
    const { supabase } = await requireUser();

    // La policy `invitations_update_receiver` garantit qu'on ne peut répondre
    // qu'à une invitation qui nous est adressée et encore en attente.
    const { error } = await supabase
      .from("invitations")
      .update({ status: accept ? "accepted" : "declined" })
      .eq("id", invitationId);
    if (error) return { ok: false, error: error.message };

    revalidatePath("/messages");
    revalidatePath("/matches");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue." };
  }
}

export async function sendMessage(
  matchId: string,
  body: string,
): Promise<ActionResult> {
  try {
    if (!UUID_RE.test(matchId)) return { ok: false, error: "Conversation invalide." };
    const trimmed = body.trim();
    if (trimmed.length === 0) return { ok: false, error: "Message vide." };
    if (trimmed.length > 2000) {
      return { ok: false, error: "Message trop long (2000 caractères max)." };
    }

    const { supabase, user } = await requireUser();
    const { error } = await supabase
      .from("messages")
      .insert({ match_id: matchId, sender_id: user.id, body: trimmed });
    if (error) return { ok: false, error: error.message };

    revalidatePath("/messages");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue." };
  }
}

export async function updateSafeWord(
  matchId: string,
  safeWord: string,
): Promise<ActionResult> {
  try {
    if (!UUID_RE.test(matchId)) return { ok: false, error: "Conversation invalide." };
    const trimmed = safeWord.trim();
    if (trimmed.length < 1 || trimmed.length > 40) {
      return { ok: false, error: "Le safe word doit faire entre 1 et 40 caractères." };
    }

    const { supabase } = await requireUser();
    const { error } = await supabase
      .from("matches")
      .update({ safe_word: trimmed })
      .eq("id", matchId);
    if (error) return { ok: false, error: error.message };

    revalidatePath("/messages");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue." };
  }
}

/** « Tu es invisible par défaut » — l'interrupteur qui rend la phrase vraie. */
export async function setVisibility(isVisible: boolean): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireUser();
    const { error } = await supabase
      .from("profiles")
      .update({ is_visible: isVisible })
      .eq("id", user.id);
    if (error) return { ok: false, error: error.message };

    revalidatePath("/matches");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue." };
  }
}
