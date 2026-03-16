export default function Home() {
  return (
    <main className="min-h-screen bg-[#08060D] flex flex-col items-center justify-center px-6 text-white">
      <div className="max-w-sm w-full flex flex-col items-center gap-8">

        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 bg-[#C4427E] rounded-2xl flex items-center justify-center">
            <span className="text-3xl">✦</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">MyFantasy</h1>
          <p className="text-[#9985B0] text-sm tracking-widest uppercase">Pour toi. Tes désirs. Ton tempo.</p>
        </div>

        {/* Stats */}
        <div className="w-full bg-[#120E1C] rounded-2xl p-5 flex flex-col gap-3">
          <p className="text-[#9985B0] text-xs text-center mb-1">Basé sur la science du désir</p>
          {[
            ["97%", "des gens ont des fantasmes sexuels"],
            ["79%", "veulent les concrétiser"],
            ["Seulement 23%", "l'ont fait — tu changes ça"],
          ].map(([v, t]) => (
            <div key={v} className="flex items-baseline gap-3">
              <span className="text-[#C4427E] font-bold text-base min-w-[110px]">{v}</span>
              <span className="text-[#9985B0] text-xs">{t}</span>
            </div>
          ))}
        </div>

        {/* Women first */}
        <div className="w-full bg-[#120E1C] rounded-2xl p-4 border border-[#2E2640]">
          <p className="text-[#7F77DD] text-xs font-medium mb-2">✦ Conçu pour les femmes</p>
          <p className="text-[#9985B0] text-xs leading-relaxed">
            Tu choisis, tu filtres, tu décides. Les hommes ne peuvent pas initier sans ton accord.
          </p>
        </div>

        {/* CTA */}
        <button className="w-full py-4 bg-[#C4427E] rounded-2xl text-white font-medium text-base hover:bg-[#B4326E] transition-colors">
          Créer mon profil →
        </button>

        <p className="text-[#3A2E4A] text-xs text-center">
          Réservé aux +18 ans · Données chiffrées · RGPD
        </p>
      </div>
    </main>
  );
}
