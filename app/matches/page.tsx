"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  name: string;
  age: number;
  role: string;
  intensity: string;
  categories: string[];
  verified: boolean;
  online: boolean;
  note: string;
  avatar_color: string;
};

export default function Matches() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [invited, setInvited] = useState<string[]>([]);
  const [passed, setPassed] = useState<string[]>([]);

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) setProfiles(data);
      setLoading(false);
    };
    fetchProfiles();
  }, []);

  const visible = profiles.filter((p) => !passed.includes(p.id));

  const handleInvite = (id: string) => {
    setInvited((prev) => [...prev, id]);
    setTimeout(() => router.push("/messages"), 1500);
  };

  const getScore = (p: Profile) => {
    const base = 75;
    const bonus = (p.categories?.length || 0) * 3;
    return Math.min(99, base + bonus);
  };

  const getShared = (p: Profile) => {
    return (p.categories || []).slice(0, 3);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#08060D] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#C4427E] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#9985B0] text-sm">Chargement de tes matchs...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#08060D] text-white pb-10">
      <div className="sticky top-0 bg-[#08060D] border-b border-[#1A1428] px-5 py-4 flex items-center justify-between z-10">
        <div>
          <h1 className="text-xl font-bold">Pour toi ✦</h1>
          <p className="text-[#9985B0] text-xs">{visible.length} matchs aujourd'hui</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/messages" className="text-xs text-[#9985B0] bg-[#1A1428] px-3 py-1.5 rounded-full">
            💌 Messages
          </Link>
          <Link href="/onboarding" className="text-xs text-[#C4427E] bg-[#1C1228] px-3 py-1.5 rounded-full border border-[#2E2640]">
            Mon profil
          </Link>
        </div>
      </div>

      <div className="max-w-sm mx-auto px-4 pt-4 flex flex-col gap-4">
        <div className="bg-[#120E1C] rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-lg">🔒</span>
          <span className="text-xs text-[#9985B0] leading-relaxed">
            Profils flous jusqu'au match mutuel · Tu inities toujours en premier
          </span>
        </div>

        {visible.length === 0 && (
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <span className="text-5xl">✦</span>
            <p className="text-[#9985B0] text-sm">Tu as vu tous tes matchs du jour.</p>
            <p className="text-[#6B5A7E] text-xs">Reviens demain ou modifie tes filtres.</p>
          </div>
        )}

        {visible.map((p) => {
          const score = getScore(p);
          const shared = getShared(p);
          const isInvited = invited.includes(p.id);

          return (
            <div key={p.id} className="bg-[#120E1C] rounded-3xl p-5 border border-transparent hover:border-[#2E2640] transition-all">
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 border-2"
                  style={{
                    background: p.avatar_color + "22",
                    borderColor: p.avatar_color,
                    color: p.avatar_color,
                    filter: isInvited ? "none" : "blur(6px)",
                  }}
                >
                  {p.name[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-lg font-semibold" style={{ filter: isInvited ? "none" : "blur(5px)" }}>
                      {p.name}
                    </span>
                    <span className="text-[#6B5A7E] text-sm">{p.age} ans</span>
                    {p.verified && (
                      <span className="text-[10px] bg-[#1C3C28] text-[#5DB87A] px-2 py-0.5 rounded-full">✓ vérifié·e</span>
                    )}
                  </div>
                  <p className="text-[#9985B0] text-xs">{p.role}</p>
                </div>
                <div className="bg-[#1C1228] rounded-xl px-3 py-2 text-center flex-shrink-0">
                  <p className="text-[#C4427E] text-2xl font-bold leading-none">{score}%</p>
                  <p className="text-[#6B5A7E] text-[10px] mt-0.5">match</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {(p.categories || []).map((c) => (
                  <span key={c} className="text-[11px] bg-[#1C1228] text-[#9985B0] px-3 py-1 rounded-full">{c}</span>
                ))}
              </div>

              {shared.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] text-[#6B5A7E] uppercase tracking-wider mb-2">Désirs en commun</p>
                  <div className="flex flex-wrap gap-2">
                    {shared.map((s) => (
                      <span key={s} className="text-[11px] bg-[#2E1C3C] text-[#B090D4] px-3 py-1 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-4 flex flex-col gap-2">
                {[["Intensité", 85, "#C4427E"], ["Compatibilité de rôle", 94, "#7F77DD"], ["Cadre recherché", 88, "#378ADD"]].map(([label, val, color]) => (
                  <div key={label as string}>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-[#9985B0]">{label}</span>
                      <span style={{ color: color as string }}>{val}%</span>
                    </div>
                    <div className="h-1 bg-[#2E2640] rounded-full">
                      <div className="h-1 rounded-full" style={{ width: `${val}%`, background: color as string }} />
                    </div>
                  </div>
                ))}
              </div>

              {p.note && <p className="text-xs text-[#7A6A8A] italic mb-4">"{p.note}"</p>}

              {isInvited ? (
                <div className="w-full py-3 bg-[#1C3C28] rounded-2xl text-[#5DB87A] text-sm font-medium text-center">
                  💌 Invitation envoyée — redirection...
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setPassed((prev) => [...prev, p.id])}
                    className="flex-1 py-3 bg-transparent border border-[#2E2640] rounded-2xl text-[#6B5A7E] text-sm hover:border-[#3C2E55] transition-all"
                  >
                    Passer
                  </button>
                  <button
                    onClick={() => handleInvite(p.id)}
                    className="flex-[2] py-3 bg-[#C4427E] rounded-2xl text-white text-sm font-medium hover:bg-[#B4326E] transition-all"
                  >
                    💌 Envoyer une invitation
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
