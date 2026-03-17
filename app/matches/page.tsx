"use client";

import { useState } from "react";
import Link from "next/link";

const matches = [
  {
    id: 1,
    name: "Zoé",
    age: 27,
    dist: "2 km",
    score: 94,
    role: "Switch",
    cats: ["Rough", "Trio"],
    verified: true,
    avatar: "#C4427E",
    init: "Z",
    note: "Cherche complicité + intensité. Très directe, zéro jeu.",
    shared: ["Jeux de rôles", "Rough", "Complicité"],
  },
  {
    id: 2,
    name: "Léa",
    age: 31,
    dist: "5 km",
    score: 88,
    role: "Dominante",
    cats: ["Roleplay", "BDSM"],
    verified: true,
    avatar: "#7F77DD",
    init: "L",
    note: "Expérimentée, aime prendre les rênes. Très safe.",
    shared: ["BDSM", "Roleplay", "Pouvoir"],
  },
  {
    id: 3,
    name: "Mael",
    age: 34,
    dist: "3 km",
    score: 82,
    role: "Soumis",
    cats: ["Rough", "Nouveauté"],
    verified: false,
    avatar: "#378ADD",
    init: "M",
    note: "Cherche quelqu'un d'assumé·e. Ouvert à la découverte.",
    shared: ["Rough", "Nouveauté"],
  },
];

export default function Matches() {
  const [invited, setInvited] = useState<number[]>([]);
  const [passed, setPassed] = useState<number[]>([]);

  const visible = matches.filter((m) => !passed.includes(m.id));

  return (
    <main className="min-h-screen bg-[#08060D] text-white pb-10">

      {/* Header */}
      <div className="sticky top-0 bg-[#08060D] border-b border-[#1A1428] px-5 py-4 flex items-center justify-between z-10">
        <div>
          <h1 className="text-xl font-bold">Pour toi ✦</h1>
          <p className="text-[#9985B0] text-xs">{visible.length} matchs aujourd'hui</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#9985B0] bg-[#1A1428] px-3 py-1.5 rounded-full">
            Filtres
          </span>
          <Link href="/onboarding" className="text-xs text-[#C4427E] bg-[#1C1228] px-3 py-1.5 rounded-full border border-[#2E2640]">
            Mon profil
          </Link>
        </div>
      </div>

      <div className="max-w-sm mx-auto px-4 pt-4 flex flex-col gap-4">

        {/* Safety banner */}
        <div className="bg-[#120E1C] rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-lg">🔒</span>
          <span className="text-xs text-[#9985B0] leading-relaxed">
            Profils flous jusqu'au match mutuel · Tu inities toujours en premier
          </span>
        </div>

        {/* Match cards */}
        {visible.length === 0 && (
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <span className="text-5xl">✦</span>
            <p className="text-[#9985B0] text-sm">Tu as vu tous tes matchs du jour.</p>
            <p className="text-[#6B5A7E] text-xs">Reviens demain ou modifie tes filtres.</p>
          </div>
        )}

        {visible.map((m) => (
          <div key={m.id} className="bg-[#120E1C] rounded-3xl p-5 border border-transparent hover:border-[#2E2640] transition-all">

            {/* Top */}
            <div className="flex items-start gap-3 mb-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 border-2"
                style={{
                  background: m.avatar + "22",
                  borderColor: m.avatar,
                  color: m.avatar,
                  filter: invited.includes(m.id) ? "none" : "blur(6px)",
                }}
              >
                {m.init}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="text-lg font-semibold"
                    style={{ filter: invited.includes(m.id) ? "none" : "blur(5px)" }}
                  >
                    {m.name}
                  </span>
                  <span className="text-[#6B5A7E] text-sm">{m.age} · {m.dist}</span>
                  {m.verified && (
                    <span className="text-[10px] bg-[#1C3C28] text-[#5DB87A] px-2 py-0.5 rounded-full">
                      ✓ vérifié·e
                    </span>
                  )}
                </div>
                <p className="text-[#9985B0] text-xs">{m.role}</p>
              </div>
              <div className="bg-[#1C1228] rounded-xl px-3 py-2 text-center flex-shrink-0">
                <p className="text-[#C4427E] text-2xl font-bold leading-none">{m.score}%</p>
                <p className="text-[#6B5A7E] text-[10px] mt-0.5">match</p>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {m.cats.map((c) => (
                <span key={c} className="text-[11px] bg-[#1C1228] text-[#9985B0] px-3 py-1 rounded-full">
                  {c}
                </span>
              ))}
            </div>

            {/* Shared desires */}
            <div className="mb-3">
              <p className="text-[10px] text-[#6B5A7E] uppercase tracking-wider mb-2">Désirs en commun</p>
              <div className="flex flex-wrap gap-2">
                {m.shared.map((s) => (
                  <span key={s} className="text-[11px] bg-[#2E1C3C] text-[#B090D4] px-3 py-1 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Compatibility bars */}
            <div className="mb-4 flex flex-col gap-2">
              {[
                ["Intensité", 85, "#C4427E"],
                ["Compatibilité de rôle", 94, "#7F77DD"],
                ["Cadre recherché", 88, "#378ADD"],
              ].map(([label, val, color]) => (
                <div key={label as string}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#9985B0]">{label}</span>
                    <span style={{ color: color as string }}>{val}%</span>
                  </div>
                  <div className="h-1 bg-[#2E2640] rounded-full">
                    <div
                      className="h-1 rounded-full"
                      style={{ width: `${val}%`, background: color as string }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Note */}
            <p className="text-xs text-[#7A6A8A] italic mb-4">"{m.note}"</p>

            {/* Actions */}
            {invited.includes(m.id) ? (
              <div className="w-full py-3 bg-[#1C3C28] rounded-2xl text-[#5DB87A] text-sm font-medium text-center">
                💌 Invitation envoyée
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setPassed((p) => [...p, m.id])}
                  className="flex-1 py-3 bg-transparent border border-[#2E2640] rounded-2xl text-[#6B5A7E] text-sm hover:border-[#3C2E55] transition-all"
                >
                  Passer
                </button>
                <button
                  onClick={() => setInvited((p) => [...p, m.id])}
                  className="flex-2 flex-grow-[2] py-3 bg-[#C4427E] rounded-2xl text-white text-sm font-medium hover:bg-[#B4326E] transition-all"
                >
                  💌 Envoyer une invitation
                </button>
              </div>
            )}
          </div>
        ))}

      </div>
    </main>
  );
}
