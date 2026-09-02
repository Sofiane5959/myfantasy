import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OnboardingForm, { type OnboardingDefaults } from "./onboarding-form";

export const metadata: Metadata = {
  title: "Mon profil — MyFantasy",
  robots: { index: false, follow: false },
};

// Page dépendante de la session : jamais prérendue au build.
export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/onboarding");

  // RLS : ces deux requêtes ne peuvent renvoyer que les lignes de l'utilisatrice.
  const [{ data: profile }, { data: priv }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "display_name, birthdate, role, intensity, categories, seeking, note, is_visible",
      )
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("profile_private")
      .select("hard_limits")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const defaults: OnboardingDefaults = profile
    ? {
        displayName: profile.display_name,
        birthdate: profile.birthdate,
        role: profile.role,
        intensity: profile.intensity,
        categories: profile.categories ?? [],
        seeking: profile.seeking ?? [],
        note: profile.note ?? "",
        isVisible: profile.is_visible,
        hardLimits: priv?.hard_limits ?? [],
      }
    : {};

  return <OnboardingForm defaults={defaults} isEditing={Boolean(profile)} />;
}
