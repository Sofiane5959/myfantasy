"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/lib/nav";

export type LoginState = {
  status: "idle" | "sent" | "error";
  message?: string;
};

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;

export async function sendMagicLink(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const next = safeRedirectPath(String(formData.get("next") ?? ""));

  if (!EMAIL_RE.test(email)) {
    return { status: "error", message: "Cette adresse email n'est pas valide." };
  }

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (await headers()).get("origin") ??
    "http://localhost:3000";

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    // Message générique : ne pas révéler si l'adresse existe déjà en base.
    return {
      status: "error",
      message: "Envoi impossible pour le moment. Réessaie dans un instant.",
    };
  }

  return {
    status: "sent",
    message: `Lien envoyé à ${email}. Il expire dans 1 heure.`,
  };
}
