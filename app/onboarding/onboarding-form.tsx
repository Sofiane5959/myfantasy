"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CATEGORIES,
  HARD_LIMITS,
  INTENSITIES,
  ROLES,
  SEEKING,
} from "@/lib/constants";
import { saveOnboarding, type OnboardingInput } from "@/app/actions";

const STEPS = 4;

export type OnboardingDefaults = Partial<OnboardingInput>;

function toggle(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

/** Bornes de l'input date : entre 100 ans et 18 ans. */
function dateBounds() {
  const now = new Date();
  const max = new Date(now);
  max.setUTCFullYear(max.getUTCFullYear() - 18);
  const min = new Date(now);
  min.setUTCFullYear(min.getUTCFullYear() - 100);
  return { min: min.toISOString().slice(0, 10), max: max.toISOString().slice(0, 10) };
}

const chip = (active: boolean) =>
  `rounded-full border px-3 py-1.5 text-xs transition-all ${
    active
      ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white"
      : "border-[color:var(--line)] text-[color:var(--muted)] hover:border-[color:var(--accent-2)]"
  }`;

const card = (active: boolean) =>
  `flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${
    active
      ? "border-[color:var(--accent)] bg-[color:var(--surface-2)]"
      : "border-transparent bg-[color:var(--surface)] hover:border-[color:var(--line)]"
  }`;

const primaryBtn =
  "w-full rounded-2xl bg-[color:var(--accent)] py-4 font-medium text-white transition-colors hover:bg-[color:var(--accent-hover)] disabled:opacity-40";

export default function OnboardingForm({
  defaults,
  isEditing,
}: {
  defaults: OnboardingDefaults;
  isEditing: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState(defaults.displayName ?? "");
  const [birthdate, setBirthdate] = useState(defaults.birthdate ?? "");
  const [categories, setCategories] = useState<string[]>(defaults.categories ?? []);
  const [intensity, setIntensity] = useState<string | null>(defaults.intensity ?? null);
  const [role, setRole] = useState<string | null>(defaults.role ?? null);
  const [seeking, setSeeking] = useState<string[]>(defaults.seeking ?? []);
  // Corrige le bug du prototype : les limites étaient togglées via classList
  // et n'étaient donc jamais enregistrées.
  const [hardLimits, setHardLimits] = useState<string[]>(defaults.hardLimits ?? []);
  const [note, setNote] = useState(defaults.note ?? "");
  const [isVisible, setIsVisible] = useState(defaults.isVisible ?? false);

  const bounds = dateBounds();
  const progress = ((step + 1) / STEPS) * 100;

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const result = await saveOnboarding({
        displayName,
        birthdate,
        categories,
        intensity: intensity ?? "",
        role: role ?? "",
        seeking,
        hardLimits,
        note,
        isVisible,
      });
      if (result.ok) {
        router.push("/matches");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center justify-between">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              aria-label="Étape précédente"
              className="text-2xl leading-none text-[color:var(--muted)]"
            >
              ‹
            </button>
          ) : (
            <div />
          )}
          <span className="text-xs text-[color:var(--muted)]">
            Étape {step + 1} / {STEPS}
          </span>
          <div />
        </div>

        <div
          className="h-0.5 rounded-full bg-[color:var(--surface-3)]"
          role="progressbar"
          aria-valuenow={step + 1}
          aria-valuemin={1}
          aria-valuemax={STEPS}
          aria-label="Progression de l'inscription"
        >
          <div
            className="h-0.5 rounded-full bg-gradient-to-r from-[color:var(--accent-2)] to-[color:var(--accent)] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* ---------- Étape 0 — Identité ---------- */}
        {step === 0 && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="mb-1 text-2xl font-bold">Toi, en deux champs</h2>
              <p className="text-sm text-[color:var(--muted)]">
                Ton prénom n&apos;est visible qu&apos;après un match mutuel.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="displayName" className="text-sm font-medium">
                Prénom ou pseudo
              </label>
              <input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={40}
                autoComplete="nickname"
                placeholder="Comment on t'appelle ?"
                className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-3 text-sm outline-none transition-colors placeholder:text-[color:var(--muted-dim)] focus:border-[color:var(--accent-2)]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="birthdate" className="text-sm font-medium">
                Date de naissance
              </label>
              <input
                id="birthdate"
                type="date"
                value={birthdate}
                min={bounds.min}
                max={bounds.max}
                onChange={(e) => setBirthdate(e.target.value)}
                className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-3 text-sm outline-none transition-colors focus:border-[color:var(--accent-2)] [color-scheme:dark]"
              />
              <p className="text-xs text-[color:var(--muted-dim)]">
                Vérifiée par déclaration : le service est interdit aux mineurs.
                Seul ton âge est montré, jamais ta date exacte.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={displayName.trim().length === 0 || birthdate === ""}
              className={primaryBtn}
            >
              Continuer →
            </button>
          </div>
        )}

        {/* ---------- Étape 1 — Catégories ---------- */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="mb-1 text-2xl font-bold">Ton menu 🍽</h2>
              <p className="text-sm text-[color:var(--muted)]">
                Ce que tu veux explorer (plusieurs choix possibles)
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {CATEGORIES.map((c) => {
                const active = categories.includes(c.label);
                return (
                  <button
                    key={c.label}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setCategories((p) => toggle(p, c.label))}
                    className={card(active)}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color:var(--surface-2)] text-xl">
                      {c.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{c.label}</div>
                      <div className="mt-0.5 text-xs text-[color:var(--muted-dim)]">
                        {c.hint}
                      </div>
                    </div>
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                        active
                          ? "border-[color:var(--accent)] bg-[color:var(--accent)]"
                          : "border-[color:var(--line-strong)]"
                      }`}
                    >
                      {active && (
                        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                          <polyline
                            points="2,5 4,7.5 8,2.5"
                            stroke="white"
                            strokeWidth="1.5"
                            fill="none"
                            strokeLinecap="round"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={categories.length === 0}
              className={primaryBtn}
            >
              Continuer →
            </button>
          </div>
        )}

        {/* ---------- Étape 2 — Intensité, rôle, cible ---------- */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="mb-1 text-2xl font-bold">Ton intensité</h2>
              <p className="text-sm text-[color:var(--muted)]">Où tu en es aujourd&apos;hui</p>
            </div>

            <div className="flex flex-col gap-3">
              {INTENSITIES.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  aria-pressed={intensity === item.label}
                  onClick={() => setIntensity(item.label)}
                  className={card(intensity === item.label)}
                >
                  <span className="text-2xl">{item.emoji}</span>
                  <div>
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className="mt-0.5 text-xs text-[color:var(--muted-dim)]">
                      {item.hint}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <fieldset>
              <legend className="mb-2 text-sm font-medium">Ton énergie naturelle</legend>
              <div className="flex flex-wrap gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    aria-pressed={role === r}
                    onClick={() => setRole(r)}
                    className={chip(role === r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-sm font-medium">Tu cherches...</legend>
              <div className="flex flex-wrap gap-2">
                {SEEKING.map((t) => (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={seeking.includes(t)}
                    onClick={() => setSeeking((p) => toggle(p, t))}
                    className={chip(seeking.includes(t))}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </fieldset>

            <button
              type="button"
              onClick={() => setStep(3)}
              disabled={intensity === null || role === null}
              className={primaryBtn}
            >
              Continuer →
            </button>
          </div>
        )}

        {/* ---------- Étape 3 — Limites & visibilité ---------- */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="mb-1 text-2xl font-bold">Tes limites</h2>
              <p className="text-sm text-[color:var(--muted)]">
                Ce que tu ne veux{" "}
                <span className="font-medium text-[color:var(--accent)]">jamais</span> voir
                dans tes matchs
              </p>
            </div>

            <div className="rounded-2xl bg-[color:var(--surface)] p-4">
              <p className="mb-3 text-xs font-medium text-[color:var(--accent-2)]">
                🔒 Stockées à part, lisibles par toi seule — même après un match
              </p>
              <div className="flex flex-wrap gap-2">
                {HARD_LIMITS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    aria-pressed={hardLimits.includes(l)}
                    onClick={() => setHardLimits((p) => toggle(p, l))}
                    className={chip(hardLimits.includes(l))}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="note" className="text-sm font-medium">
                Un mot pour te présenter{" "}
                <span className="text-[color:var(--muted-dim)]">(optionnel)</span>
              </label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 280))}
                rows={3}
                placeholder="Ce que tu cherches, ton état d'esprit..."
                className="resize-none rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-3 text-sm outline-none transition-colors placeholder:text-[color:var(--muted-dim)] focus:border-[color:var(--accent-2)]"
              />
              <span className="self-end text-xs text-[color:var(--muted-dim)]">
                {note.length}/280
              </span>
            </div>

            <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-3)] p-4">
              <p className="mb-2 text-xs font-medium text-[color:var(--accent)]">
                ✦ Règle MyFantasy
              </p>
              <p className="mb-3 text-xs leading-relaxed text-[color:var(--muted)]">
                Ton profil est invisible tant que tu ne l&apos;actives pas. Personne ne
                peut te découvrir ni t&apos;inviter avant.
              </p>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={(e) => setIsVisible(e.target.checked)}
                  className="h-4 w-4 accent-[color:var(--accent)]"
                />
                <span className="text-sm">Rendre mon profil visible maintenant</span>
              </label>
            </div>

            {error && (
              <p role="alert" className="text-xs text-[color:var(--danger)]">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={submit}
              disabled={pending}
              className={primaryBtn}
            >
              {pending
                ? "Enregistrement..."
                : isEditing
                  ? "Enregistrer mes modifications ✦"
                  : "Voir mes matchs ✦"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
