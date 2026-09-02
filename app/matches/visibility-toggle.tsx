"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setVisibility } from "@/app/actions";

export default function VisibilityToggle({ initial }: { initial: boolean }) {
  const router = useRouter();
  const [visible, setVisible] = useState(initial);
  const [pending, startTransition] = useTransition();

  const onChange = (next: boolean) => {
    setVisible(next);
    startTransition(async () => {
      const res = await setVisibility(next);
      if (res.ok) router.refresh();
      else setVisible(!next); // rollback
    });
  };

  return (
    <div className="flex items-center justify-between rounded-2xl bg-[color:var(--surface)] px-4 py-3">
      <div className="pr-3">
        <p className="text-xs font-medium">
          {visible ? "Ton profil est visible" : "Ton profil est invisible"}
        </p>
        <p className="mt-0.5 text-xs text-[color:var(--muted-dim)]">
          {visible
            ? "D'autres personnes peuvent te découvrir et t'inviter."
            : "Personne ne peut te découvrir. Tu vois quand même les profils."}
        </p>
      </div>
      <label className="flex shrink-0 cursor-pointer items-center gap-2">
        <span className="sr-only">Rendre mon profil visible</span>
        <input
          type="checkbox"
          checked={visible}
          disabled={pending}
          onChange={(e) => onChange(e.target.checked)}
          className="h-5 w-5 accent-[color:var(--accent)] disabled:opacity-40"
        />
      </label>
    </div>
  );
}
