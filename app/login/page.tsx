import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/lib/nav";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Connexion — MyFantasy",
  robots: { index: false, follow: false },
};

// Page dépendante de la session : jamais prérendue au build.
export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  lien_invalide: "Ce lien est incomplet. Demande-en un nouveau.",
  lien_expire: "Ce lien a expiré ou a déjà été utilisé. Demande-en un nouveau.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const next = safeRedirectPath(params.next);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect(next);

  const error = params.error ? ERRORS[params.error] : undefined;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <Link href="/" className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[color:var(--accent)]">
            <span className="text-2xl">✦</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">MyFantasy</h1>
        </Link>

        {error && (
          <p
            role="alert"
            className="w-full rounded-2xl border border-[color:var(--danger)] bg-[color:var(--surface)] px-4 py-3 text-center text-xs text-[color:var(--danger)]"
          >
            {error}
          </p>
        )}

        <LoginForm next={next} />

        <p className="text-center text-xs text-[color:var(--muted-dim)]">
          Réservé aux personnes majeures. En continuant, tu acceptes les{" "}
          <Link href="/legal/cgu" className="underline hover:text-[color:var(--muted)]">
            conditions d&apos;utilisation
          </Link>{" "}
          et la{" "}
          <Link href="/legal/confidentialite" className="underline hover:text-[color:var(--muted)]">
            politique de confidentialité
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
