import Link from "next/link";

const STATS: [string, string][] = [
  ["97%", "des gens ont des fantasmes sexuels"],
  ["79%", "veulent les concrétiser"],
  ["Seulement 23%", "l'ont fait — tu changes ça"],
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-10">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[color:var(--accent)]">
            <span className="text-3xl" aria-hidden="true">
              ✦
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">MyFantasy</h1>
          <p className="text-sm uppercase tracking-widest text-[color:var(--muted)]">
            Pour toi. Tes désirs. Ton tempo.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 rounded-2xl bg-[color:var(--surface)] p-5">
          <p className="mb-1 text-center text-xs text-[color:var(--muted)]">
            Basé sur la science du désir
          </p>
          {STATS.map(([value, text]) => (
            <div key={value} className="flex items-baseline gap-3">
              <span className="min-w-[110px] text-base font-bold text-[color:var(--accent)]">
                {value}
              </span>
              <span className="text-xs text-[color:var(--muted)]">{text}</span>
            </div>
          ))}
        </div>

        <div className="w-full rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-4">
          <p className="mb-2 text-xs font-medium text-[color:var(--accent-2)]">
            ✦ Conçu pour les femmes
          </p>
          <p className="text-xs leading-relaxed text-[color:var(--muted)]">
            Tu choisis, tu filtres, tu décides. Ton profil est invisible tant que
            tu ne l&apos;actives pas, et ton prénom n&apos;est partagé
            qu&apos;après une invitation acceptée des deux côtés.
          </p>
        </div>

        <Link
          href="/login"
          className="w-full rounded-2xl bg-[color:var(--accent)] py-4 text-center text-base font-medium text-white transition-colors hover:bg-[color:var(--accent-hover)]"
        >
          Créer mon profil →
        </Link>

        {/*
          Les mentions « Données chiffrées » et « RGPD » du prototype ont été
          retirées : rien dans le code ne les justifiait. Voir /legal.
        */}
        <p className="text-center text-xs text-[color:var(--muted-dim)]">
          Réservé aux personnes majeures ·{" "}
          <Link href="/legal/confidentialite" className="underline hover:text-[color:var(--muted)]">
            Confidentialité
          </Link>{" "}
          ·{" "}
          <Link href="/legal/cgu" className="underline hover:text-[color:var(--muted)]">
            CGU
          </Link>
        </p>
      </div>
    </main>
  );
}
