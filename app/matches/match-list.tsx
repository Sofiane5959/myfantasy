"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { DiscoveryProfile } from "@/lib/types";
import { passProfile, sendInvitation } from "@/app/actions";

function Bar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-[11px]">
        <span className="text-[color:var(--muted)]">{label}</span>
        <span style={{ color }}>{value}%</span>
      </div>
      <div className="h-1 rounded-full bg-[color:var(--line)]">
        <div
          className="h-1 rounded-full"
          style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function MatchList({
  profiles,
}: {
  profiles: DiscoveryProfile[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [hidden, setHidden] = useState<string[]>([]);
  const [invited, setInvited] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const visible = profiles.filter((p) => !hidden.includes(p.id));

  const handlePass = (id: string) => {
    setHidden((prev) => [...prev, id]);
    startTransition(async () => {
      const res = await passProfile(id);
      if (!res.ok) {
        setHidden((prev) => prev.filter((x) => x !== id)); // rollback
        setError(res.error);
      }
    });
  };

  const handleInvite = (id: string) => {
    setInvited((prev) => [...prev, id]);
    startTransition(async () => {
      const res = await sendInvitation(id);
      if (res.ok) {
        router.refresh();
      } else {
        setInvited((prev) => prev.filter((x) => x !== id));
        setError(res.error);
      }
    });
  };

  if (visible.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <span className="text-5xl">✦</span>
        <p className="text-sm text-[color:var(--muted)]">
          Aucun profil compatible pour l&apos;instant.
        </p>
        <p className="text-xs text-[color:var(--muted-dim)]">
          Reviens plus tard ou élargis tes catégories.
        </p>
      </div>
    );
  }

  return (
    <>
      {error && (
        <p
          role="alert"
          className="rounded-2xl border border-[color:var(--danger)] bg-[color:var(--surface)] px-4 py-3 text-xs text-[color:var(--danger)]"
        >
          {error}
        </p>
      )}

      {visible.map((p) => {
        const isInvited = invited.includes(p.id);

        return (
          <article
            key={p.id}
            className="rounded-3xl border border-transparent bg-[color:var(--surface)] p-5 transition-all hover:border-[color:var(--line)]"
          >
            <div className="mb-4 flex items-start gap-3">
              {/* Pas d'initiale : avant match mutuel, le prénom n'a jamais
                  quitté la base de données. */}
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 text-xl"
                style={{
                  background: `${p.avatar_color}22`,
                  borderColor: p.avatar_color,
                }}
                aria-hidden="true"
              >
                ✦
              </div>

              <div className="flex-1">
                <div className="mb-0.5 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-[color:var(--muted)]">
                    Profil masqué
                  </span>
                  <span className="text-sm text-[color:var(--muted-dim)]">
                    {p.age} ans
                  </span>
                  {p.verified && (
                    <span className="rounded-full bg-[color:var(--ok-border)] px-2 py-0.5 text-[10px] text-[color:var(--ok)]">
                      ✓ vérifié·e
                    </span>
                  )}
                  {p.online && (
                    <span className="text-[10px] text-[color:var(--ok)]">● en ligne</span>
                  )}
                </div>
                <p className="text-xs text-[color:var(--muted)]">
                  {p.role} · {p.intensity}
                </p>
              </div>

              <div className="shrink-0 rounded-xl bg-[color:var(--surface-2)] px-3 py-2 text-center">
                <p className="text-2xl font-bold leading-none text-[color:var(--accent)]">
                  {p.score}%
                </p>
                <p className="mt-0.5 text-[10px] text-[color:var(--muted-dim)]">match</p>
              </div>
            </div>

            {p.shared_categories.length > 0 && (
              <div className="mb-3">
                <p className="mb-2 text-[10px] uppercase tracking-wider text-[color:var(--muted-dim)]">
                  Désirs en commun
                </p>
                <div className="flex flex-wrap gap-2">
                  {p.shared_categories.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-[#2E1C3C] px-3 py-1 text-[11px] text-[#B090D4]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4 flex flex-col gap-2">
              <Bar label="Désirs partagés" value={p.score_categories} color="var(--accent)" />
              <Bar label="Compatibilité de rôle" value={p.score_role} color="var(--accent-2)" />
              <Bar label="Intensité" value={p.score_intensity} color="var(--accent-3)" />
            </div>

            {p.note && (
              <p className="mb-4 text-xs italic text-[color:var(--muted-dim)]">
                &laquo;&nbsp;{p.note}&nbsp;&raquo;
              </p>
            )}

            {isInvited ? (
              <div
                role="status"
                className="w-full rounded-2xl bg-[color:var(--ok-border)] py-3 text-center text-sm font-medium text-[color:var(--ok)]"
              >
                💌 Invitation envoyée
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handlePass(p.id)}
                  disabled={pending}
                  className="flex-1 rounded-2xl border border-[color:var(--line)] py-3 text-sm text-[color:var(--muted-dim)] transition-all hover:border-[color:var(--line-strong)] disabled:opacity-40"
                >
                  Passer
                </button>
                <button
                  type="button"
                  onClick={() => handleInvite(p.id)}
                  disabled={pending}
                  className="flex-[2] rounded-2xl bg-[color:var(--accent)] py-3 text-sm font-medium text-white transition-all hover:bg-[color:var(--accent-hover)] disabled:opacity-40"
                >
                  💌 Envoyer une invitation
                </button>
              </div>
            )}
          </article>
        );
      })}
    </>
  );
}
