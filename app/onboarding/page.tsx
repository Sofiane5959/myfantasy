"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const categories = [
  { e: "👥", t: "Multi-partenaires", sub: "Trio · Groupe · Orgie" },
  { e: "⛓", t: "Pouvoir & Rough", sub: "BDSM · Dom/Sub · Rough" },
  { e: "✨", t: "Nouveauté & Aventure", sub: "One-shot · Inconnu·e · Surprise" },
  { e: "🎭", t: "Tabou & Fetish", sub: "Roleplay · Fétiche · Interdit" },
  { e: "🌹", t: "Romance & Passion", sub: "Tendre · Intense · Connexion" },
  { e: "🔄", t: "Non-monogamie", sub: "Open · Swing · Polyamour" },
  { e: "🌊", t: "Flexibilité érotique", sub: "Gender-bending · Fluide" },
];

const intensities = [
  { e: "🌱", t: "Curieuse", d: "Je veux explorer doucement, sans pression" },
  { e: "🔥", t: "Ouverte", d: "J'ai des envies précises à concrétiser" },
  { e: "⚡", t: "Assumée", d: "Je sais ce que je veux et je le cherche" },
  { e: "🌑", t: "Experte", d: "Je cherche quelqu'un vraiment à mon niveau" },
];

const roles = ["Dominante", "Soumise", "Switch", "Égalitaire", "Sans rôle défini"];
const targets = ["Une femme", "Un homme", "Peu importe", "Un couple", "Un groupe"];

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [catSel, setCatSel] = useState<number[]>([]);
  const [intensity, setIntensity] = useState<number | null>(null);
  const [role, setRole] = useState<number | null>(null);
  const [targetSel, setTargetSel] = useState<number[]>([]);

  const toggleCat = (i: number) => {
    setCatSel((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );
  };

  const toggleTarget = (i: number) => {
    setTargetSel((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );
  };

  const progress = ((step + 1) / 3) * 100;

  return (
    <main className="min-h-screen bg-[#08060D] flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-sm w-full flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          {step > 0 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="text-[#9985B0] text-2xl leading-none"
            >
              ‹
            </button>
          ) : (
            <div />
          )}
          <span className="text-[#9985B0] text-xs">Étape {step + 1} / 3</span>
          <div />
        </div>

        {/* Progress */}
        <div className="h-0.5 bg-[#1A1428] rounded-full">
          <div
            className="h-0.5 bg-gradient-to-r from-[#7F77DD] to-[#C4427E] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step 0 — Catégories */}
        {step === 0 && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Ton menu 🍽</h2>
              <p className="text-[#9985B0] text-sm">Ce que tu veux explorer (plusieurs choix possibles)</p>
            </div>
            <div className="flex flex-col gap-3">
              {categories.map((c, i) => (
                <button
                  key={i}
                  onClick={() => toggleCat(i)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${
                    catSel.includes(i)
                      ? "bg-[#1C1228] border-[#C4427E]"
                      : "bg-[#120E1C] border-transparent hover:border-[#2E2640]"
                  }`}
                >
                  <div className="w-10 h-10 bg-[#1C1628] rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                    {c.e}
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">{c.t}</div>
                    <div className="text-[#6B5A7E] text-xs mt-0.5">{c.sub}</div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${
                      catSel.includes(i) ? "border-[#C4427E] bg-[#C4427E]" : "border-[#3C2E55]"
                    }`}
                  >
                    {catSel.includes(i) && (
                      <svg width="10" height="10" viewBox="0 0 10 10">
                        <polyline points="2,5 4,7.5 8,2.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(1)}
              disabled={catSel.length === 0}
              className="w-full py-4 bg-[#C4427E] rounded-2xl text-white font-medium disabled:opacity-40 hover:bg-[#B4326E] transition-colors"
            >
              Continuer →
            </button>
          </div>
        )}

        {/* Step 1 — Intensité & Rôle */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Ton intensité</h2>
              <p className="text-[#9985B0] text-sm">Où tu en es aujourd'hui</p>
            </div>
            <div className="flex flex-col gap-3">
              {intensities.map((item, i) => (
                <button
                  key={i}
                  onClick={() => setIntensity(i)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${
                    intensity === i
                      ? "bg-[#1C1228] border-[#C4427E]"
                      : "bg-[#120E1C] border-transparent hover:border-[#2E2640]"
                  }`}
                >
                  <span className="text-2xl">{item.e}</span>
                  <div>
                    <div className="text-white text-sm font-medium">{item.t}</div>
                    <div className="text-[#6B5A7E] text-xs mt-0.5">{item.d}</div>
                  </div>
                </button>
              ))}
            </div>

            <div>
              <p className="text-white text-sm font-medium mb-2">Ton énergie naturelle</p>
              <div className="flex flex-wrap gap-2">
                {roles.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => setRole(i)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                      role === i
                        ? "bg-[#C4427E] border-[#C4427E] text-white"
                        : "border-[#2E2640] text-[#9985B0] hover:border-[#7F77DD]"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-white text-sm font-medium mb-2">Tu cherches...</p>
              <div className="flex flex-wrap gap-2">
                {targets.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => toggleTarget(i)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                      targetSel.includes(i)
                        ? "bg-[#C4427E] border-[#C4427E] text-white"
                        : "border-[#2E2640] text-[#9985B0] hover:border-[#7F77DD]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={intensity === null}
              className="w-full py-4 bg-[#C4427E] rounded-2xl text-white font-medium disabled:opacity-40 hover:bg-[#B4326E] transition-colors"
            >
              Continuer →
            </button>
          </div>
        )}

        {/* Step 2 — Limites */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Tes limites</h2>
              <p className="text-[#9985B0] text-sm">
                Ce que tu ne veux <span className="text-[#C4427E] font-medium">jamais</span> voir dans tes matchs
              </p>
            </div>

            <div className="bg-[#120E1C] rounded-2xl p-4">
              <p className="text-[#7F77DD] text-xs font-medium mb-3">🔒 Ces préférences sont privées et chiffrées</p>
              <div className="flex flex-wrap gap-2">
                {["Pénétration", "Fluides corporels", "Douleur physique", "Humiliation", "Vidéo/Photo", "Nuits entières", "Contacts post-rencontre", "Âge gap"].map((l) => (
                  <button
                    key={l}
                    className="px-3 py-1.5 rounded-full text-xs border border-[#2E2640] text-[#9985B0] hover:border-[#C4427E] hover:text-[#C4427E] transition-all"
                    onClick={(e) => {
                      e.currentTarget.classList.toggle("border-[#C4427E]");
                      e.currentTarget.classList.toggle("text-[#C4427E]");
                      e.currentTarget.classList.toggle("bg-[#1C1228]");
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#1A1428] rounded-2xl p-4 border border-[#2E2640]">
              <p className="text-[#C4427E] text-xs font-medium mb-2">✦ Règle MyFantasy</p>
              <p className="text-[#9985B0] text-xs leading-relaxed">
                Tu es invisible par défaut. Personne ne peut te voir ni te contacter si tu n'as pas activé ton profil.
              </p>
            </div>

            <button
              onClick={() => router.push("/matches")}
              className="w-full py-4 bg-[#C4427E] rounded-2xl text-white font-medium hover:bg-[#B4326E] transition-colors"
            >
              Voir mes matchs ✦
            </button>
          </div>
        )}

      </div>
    </main>
  );
}
