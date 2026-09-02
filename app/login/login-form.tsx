"use client";

import { useActionState } from "react";
import { sendMagicLink, type LoginState } from "./actions";

const initialState: LoginState = { status: "idle" };

export default function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(
    sendMagicLink,
    initialState,
  );

  if (state.status === "sent") {
    return (
      <div
        role="status"
        className="w-full rounded-2xl border border-[color:var(--ok-border)] bg-[color:var(--ok-bg)] p-5 text-center"
      >
        <p className="mb-1 text-2xl">📬</p>
        <p className="text-sm font-medium text-[color:var(--ok)]">
          Vérifie ta boîte mail
        </p>
        <p className="mt-1 text-xs text-[color:var(--muted)]">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex w-full flex-col gap-3">
      <input type="hidden" name="next" value={next} />

      <label htmlFor="email" className="text-sm font-medium text-white">
        Ton adresse email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="toi@exemple.fr"
        aria-describedby={state.status === "error" ? "login-error" : undefined}
        aria-invalid={state.status === "error"}
        className="w-full rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-[color:var(--muted-dim)] focus:border-[color:var(--accent-2)]"
      />

      {state.status === "error" && (
        <p id="login-error" role="alert" className="text-xs text-[color:var(--danger)]">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-[color:var(--accent)] py-4 text-base font-medium text-white transition-colors hover:bg-[color:var(--accent-hover)] disabled:opacity-40"
      >
        {pending ? "Envoi..." : "Recevoir mon lien de connexion"}
      </button>

      <p className="text-center text-xs text-[color:var(--muted-dim)]">
        Pas de mot de passe. On t&apos;envoie un lien à usage unique.
      </p>
    </form>
  );
}
