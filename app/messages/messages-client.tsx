"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { ChatMessage, Conversation } from "@/lib/types";
import { respondToInvitation, sendMessage, updateSafeWord } from "@/app/actions";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelative(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours} h`;
  return `il y a ${Math.floor(hours / 24)} j`;
}

export default function MessagesClient({
  conversations,
  pendingInvitations,
  currentUserId,
}: {
  conversations: Conversation[];
  pendingInvitations: { id: string; created_at: string }[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  const active = conversations.find((c) => c.matchId === activeId) ?? null;

  // Le vidage de `messages` se fait dans les handlers, pas dans l'effet :
  // react-hooks/set-state-in-effect interdit un setState en corps d'effet.
  const openConversation = (matchId: string) => {
    setMessages([]);
    setError(null);
    setLoading(true);
    setActiveId(matchId);
  };

  const closeConversation = () => {
    setMessages([]);
    setLoading(false);
    setActiveId(null);
  };

  // Chargement + abonnement temps réel de la conversation active.
  useEffect(() => {
    if (!activeId) return;

    let cancelled = false;
    const supabase = createClient();

    supabase
      .from("messages")
      .select("id, match_id, sender_id, body, created_at")
      .eq("match_id", activeId)
      .order("created_at", { ascending: true })
      .limit(500)
      .then(({ data, error: err }) => {
        if (cancelled) return;
        if (err) setError("Impossible de charger la conversation.");
        else setMessages((data ?? []) as ChatMessage[]);
        setLoading(false);
      });

    const channel = supabase
      .channel(`messages:${activeId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${activeId}`,
        },
        (payload) => {
          const msg = payload.new as ChatMessage;
          setMessages((prev) =>
            prev.some((m) => m.id === msg.id) ? prev : [...prev, msg],
          );
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  const submit = useCallback(() => {
    const body = input.trim();
    if (!body || !activeId || pending) return;
    setInput("");
    setError(null);
    startTransition(async () => {
      const res = await sendMessage(activeId, body);
      if (!res.ok) {
        setInput(body); // restitue la saisie
        setError(res.error);
      }
    });
  }, [input, activeId, pending]);

  const respond = (invitationId: string, accept: boolean) => {
    startTransition(async () => {
      const res = await respondToInvitation(invitationId, accept);
      if (res.ok) router.refresh();
      else setError(res.error);
    });
  };

  const changeSafeWord = () => {
    if (!active) return;
    const next = window.prompt(
      "Nouveau safe word pour cette conversation :",
      active.safeWord,
    );
    if (next === null) return;
    startTransition(async () => {
      const res = await updateSafeWord(active.matchId, next);
      if (res.ok) router.refresh();
      else setError(res.error);
    });
  };

  return (
    <main className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[color:var(--surface-3)] bg-[color:var(--bg)] px-5 py-4">
        <div className="flex items-center gap-3">
          {active && (
            <button
              type="button"
              onClick={closeConversation}
              aria-label="Retour à la liste des conversations"
              className="mr-1 text-2xl leading-none text-[color:var(--muted)]"
            >
              ‹
            </button>
          )}
          <div>
            <h1 className="text-xl font-bold">
              {active ? active.peer.displayName : "Messages"}
            </h1>
            <p className="text-xs text-[color:var(--muted)]">
              {active
                ? active.peer.online
                  ? "En ligne"
                  : "Hors ligne"
                : `${conversations.length} conversation${conversations.length > 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
        {!active && (
          <Link
            href="/matches"
            className="rounded-full border border-[color:var(--line)] bg-[color:var(--surface-2)] px-3 py-1.5 text-xs text-[color:var(--accent)]"
          >
            ← Matchs
          </Link>
        )}
      </header>

      {error && (
        <p
          role="alert"
          className="mx-auto mt-3 w-full max-w-sm rounded-2xl border border-[color:var(--danger)] bg-[color:var(--surface)] px-4 py-3 text-xs text-[color:var(--danger)]"
        >
          {error}
        </p>
      )}

      {/* ---------- Liste ---------- */}
      {!active && (
        <div className="mx-auto flex w-full max-w-sm flex-col gap-3 px-4 pt-4">
          {pendingInvitations.length > 0 && (
            <section className="flex flex-col gap-2">
              <h2 className="text-xs uppercase tracking-wider text-[color:var(--muted-dim)]">
                Invitations reçues
              </h2>
              {pendingInvitations.map((inv) => (
                <div
                  key={inv.id}
                  className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-4"
                >
                  <p className="text-sm font-medium">Profil masqué</p>
                  <p className="mb-3 mt-0.5 text-xs text-[color:var(--muted-dim)]">
                    Reçue {formatRelative(inv.created_at)} · le prénom
                    n&apos;apparaît qu&apos;après acceptation
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => respond(inv.id, false)}
                      disabled={pending}
                      className="flex-1 rounded-2xl border border-[color:var(--line)] py-2.5 text-sm text-[color:var(--muted-dim)] disabled:opacity-40"
                    >
                      Refuser
                    </button>
                    <button
                      type="button"
                      onClick={() => respond(inv.id, true)}
                      disabled={pending}
                      className="flex-[2] rounded-2xl bg-[color:var(--accent)] py-2.5 text-sm font-medium text-white disabled:opacity-40"
                    >
                      Accepter ✦
                    </button>
                  </div>
                </div>
              ))}
            </section>
          )}

          {conversations.length === 0 && pendingInvitations.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-20 text-center">
              <span className="text-5xl">💌</span>
              <p className="text-sm text-[color:var(--muted)]">
                Pas encore de conversation.
              </p>
              <Link href="/matches" className="text-xs text-[color:var(--accent)] underline">
                Découvrir des profils
              </Link>
            </div>
          )}

          {conversations.map((c) => (
            <button
              key={c.matchId}
              type="button"
              onClick={() => openConversation(c.matchId)}
              className="flex w-full items-center gap-3 rounded-2xl border border-transparent bg-[color:var(--surface)] p-4 text-left transition-all hover:border-[color:var(--line)]"
            >
              <div className="relative shrink-0">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full border-2 text-lg font-bold"
                  style={{
                    background: `${c.peer.avatarColor}22`,
                    borderColor: c.peer.avatarColor,
                    color: c.peer.avatarColor,
                  }}
                >
                  {/* Match mutuel : le prénom est légitimement connu. */}
                  {c.peer.displayName.charAt(0).toUpperCase() || "✦"}
                </div>
                {c.peer.online && (
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[color:var(--surface)] bg-[color:var(--ok)]" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center gap-2">
                  <span className="text-sm font-medium">{c.peer.displayName}</span>
                  <span className="text-xs text-[color:var(--muted-dim)]">
                    {c.peer.age}
                  </span>
                  {c.peer.verified && (
                    <span className="rounded-full bg-[color:var(--ok-border)] px-1.5 py-0.5 text-[10px] text-[color:var(--ok)]">
                      ✓
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-[color:var(--muted)]">
                  {c.lastMessage?.body ?? "Dites-vous bonjour ✦"}
                </p>
              </div>
              {c.lastMessage && (
                <span className="shrink-0 text-[10px] text-[color:var(--muted-dim)]">
                  {formatRelative(c.lastMessage.createdAt)}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ---------- Conversation ---------- */}
      {active && (
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-[color:var(--surface-3)] bg-[#0F0B18] px-4 py-2">
            <span className="text-xs text-[color:var(--muted-dim)]">
              Safe word :{" "}
              <strong className="text-[color:var(--accent-2)]">{active.safeWord}</strong>
            </span>
            <button
              type="button"
              onClick={changeSafeWord}
              disabled={pending}
              className="rounded-full border border-[color:var(--line)] px-2 py-0.5 text-xs text-[color:var(--muted)] disabled:opacity-40"
            >
              Modifier
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
            {loading && (
              <p className="py-8 text-center text-xs text-[color:var(--muted-dim)]">
                Chargement...
              </p>
            )}
            {!loading && messages.length === 0 && (
              <p className="py-8 text-center text-xs text-[color:var(--muted-dim)]">
                Vous avez matché. À toi d&apos;ouvrir la conversation.
              </p>
            )}
            {messages.map((msg) => {
              const mine = msg.sender_id === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      mine
                        ? "rounded-br-sm bg-[color:var(--accent)] text-white"
                        : "rounded-bl-sm bg-[color:var(--surface-2)] text-[#EDE6F5]"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                    <p
                      className={`mt-1 text-[10px] ${
                        mine ? "text-pink-200" : "text-[color:var(--muted-dim)]"
                      }`}
                    >
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <div className="flex items-center gap-2 border-t border-[color:var(--surface-3)] bg-[color:var(--bg)] px-4 py-3">
            <label htmlFor="chat-input" className="sr-only">
              Écrire un message
            </label>
            <input
              id="chat-input"
              type="text"
              value={input}
              maxLength={2000}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder="Écris un message..."
              className="flex-1 rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-3 text-sm outline-none transition-colors placeholder:text-[color:var(--muted-dim)] focus:border-[color:var(--accent-2)]"
            />
            <button
              type="button"
              onClick={submit}
              disabled={!input.trim() || pending}
              aria-label="Envoyer le message"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)] transition-colors hover:bg-[color:var(--accent-hover)] disabled:opacity-40"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
