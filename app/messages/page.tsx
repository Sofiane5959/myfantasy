"use client";

import { useState } from "react";
import Link from "next/link";

const conversations = [
  {
    id: 1,
    name: "Zoé",
    age: 27,
    score: 94,
    avatar: "#C4427E",
    init: "Z",
    verified: true,
    last: "Ok pour samedi soir 🌹",
    time: "Il y a 5 min",
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: "Léa",
    age: 31,
    score: 88,
    avatar: "#7F77DD",
    init: "L",
    verified: true,
    last: "Ton invitation a été acceptée ✦",
    time: "Il y a 1h",
    unread: 0,
    online: false,
  },
];

const initialMessages: Record<number, { from: "me" | "them"; text: string; time: string }[]> = {
  1: [
    { from: "them", text: "Ton invitation a été acceptée ✦ Je suis curieuse d'en savoir plus sur toi.", time: "14:32" },
    { from: "me", text: "Super ! Je suis contente que ça matche. Tu es dispo quand ?", time: "14:35" },
    { from: "them", text: "Ok pour samedi soir 🌹", time: "14:36" },
  ],
  2: [
    { from: "them", text: "Ton invitation a été acceptée ✦", time: "13:10" },
  ],
};

export default function Messages() {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");

  const active = conversations.find((c) => c.id === activeId);

  const sendMessage = () => {
    if (!input.trim() || !activeId) return;
    const now = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => ({
      ...prev,
      [activeId]: [...(prev[activeId] || []), { from: "me", text: input.trim(), time: now }],
    }));
    setInput("");
  };

  return (
    <main className="min-h-screen bg-[#08060D] text-white flex flex-col">

      {/* Header */}
      <div className="sticky top-0 bg-[#08060D] border-b border-[#1A1428] px-5 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          {activeId && (
            <button onClick={() => setActiveId(null)} className="text-[#9985B0] text-2xl leading-none mr-1">
              ‹
            </button>
          )}
          <div>
            <h1 className="text-xl font-bold">
              {active ? active.name : "Messages"}
            </h1>
            <p className="text-[#9985B0] text-xs">
              {active ? (active.online ? "En ligne" : "Hors ligne") : `${conversations.length} conversations`}
            </p>
          </div>
        </div>
        {!activeId && (
          <Link href="/matches" className="text-xs text-[#C4427E] bg-[#1C1228] px-3 py-1.5 rounded-full border border-[#2E2640]">
            ← Matchs
          </Link>
        )}
      </div>

      {/* Liste des conversations */}
      {!activeId && (
        <div className="max-w-sm mx-auto w-full px-4 pt-4 flex flex-col gap-3">

          {/* Safe word reminder */}
          <div className="bg-[#120E1C] rounded-2xl px-4 py-3 flex items-center gap-3">
            <span>🔒</span>
            <span className="text-xs text-[#9985B0]">Safe word par défaut : <strong className="text-[#7F77DD]">"Velvet"</strong> — modifiable dans chaque conversation</span>
          </div>

          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className="bg-[#120E1C] rounded-2xl p-4 flex items-center gap-3 text-left hover:border hover:border-[#2E2640] transition-all w-full"
            >
              <div className="relative flex-shrink-0">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-2"
                  style={{ background: c.avatar + "22", borderColor: c.avatar, color: c.avatar }}
                >
                  {c.init}
                </div>
                {c.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#5DB87A] rounded-full border-2 border-[#120E1C]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-medium text-sm">{c.name}</span>
                  <span className="text-[#6B5A7E] text-xs">{c.age}</span>
                  {c.verified && <span className="text-[10px] bg-[#1C3C28] text-[#5DB87A] px-1.5 py-0.5 rounded-full">✓</span>}
                  <span className="text-[#C4427E] text-xs ml-auto">{c.score}%</span>
                </div>
                <p className="text-[#9985B0] text-xs truncate">{c.last}</p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-[10px] text-[#6B5A7E]">{c.time}</span>
                {c.unread > 0 && (
                  <span className="w-5 h-5 bg-[#C4427E] rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                    {c.unread}
                  </span>
                )}
              </div>
            </button>
          ))}

        </div>
      )}

      {/* Conversation active */}
      {activeId && active && (
        <div className="flex flex-col flex-1 max-w-sm mx-auto w-full">

          {/* Safe word bar */}
          <div className="px-4 py-2 bg-[#0F0B18] border-b border-[#1A1428] flex items-center justify-between">
            <span className="text-xs text-[#6B5A7E]">Safe word : <strong className="text-[#7F77DD]">Velvet</strong></span>
            <button className="text-xs text-[#9985B0] border border-[#2E2640] px-2 py-0.5 rounded-full">Modifier</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
            {(messages[activeId] || []).map((msg, i) => (
              <div key={i} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.from === "me"
                      ? "bg-[#C4427E] text-white rounded-br-sm"
                      : "bg-[#1C1628] text-[#EDE6F5] rounded-bl-sm"
                  }`}
                >
                  <p>{msg.text}</p>
                  <p className={`text-[10px] mt-1 ${msg.from === "me" ? "text-pink-200" : "text-[#6B5A7E]"}`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-[#1A1428] flex items-center gap-2 bg-[#08060D]">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Écris un message..."
              className="flex-1 bg-[#120E1C] border border-[#2E2640] rounded-2xl px-4 py-3 text-sm text-white placeholder-[#6B5A7E] outline-none focus:border-[#7F77DD] transition-colors"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="w-11 h-11 bg-[#C4427E] rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:bg-[#B4326E] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
