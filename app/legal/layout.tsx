import Link from "next/link";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-10">
      <Link
        href="/"
        className="text-xs text-[color:var(--muted)] underline hover:text-white"
      >
        ← Retour
      </Link>

      <div
        role="note"
        className="my-6 rounded-2xl border border-[color:var(--danger)] bg-[color:var(--surface)] p-4 text-xs leading-relaxed text-[color:var(--muted)]"
      >
        <strong className="text-[color:var(--danger)]">
          Brouillon non validé juridiquement.
        </strong>{" "}
        Ce texte est un canevas de travail. MyFantasy traite des données
        relatives à la vie sexuelle, catégorie particulière au sens de
        l&apos;article 9 du RGPD. Le document définitif doit être rédigé ou
        relu par un professionnel du droit avant toute mise en production.
      </div>

      <article className="prose-invert flex flex-col gap-4 text-sm leading-relaxed text-[color:var(--muted)] [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-white [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-white [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-white">
        {children}
      </article>
    </main>
  );
}
