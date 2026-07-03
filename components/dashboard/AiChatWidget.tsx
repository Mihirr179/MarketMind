"use client";

import { useEffect, useMemo, useState } from "react";
import { Send, Sparkles } from "lucide-react";

type ChatMessage = { role: "user" | "ai"; text: string };

export default function AiChatWidget() {
  const [open, setOpen] = useState(true);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "ai",
      text: "MarketMind AI ready. Ask about price action, portfolio risk, or explain what changed.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const quickPrompts = useMemo(
    () => [
      "Explain AAPL price movement",
      "Portfolio analysis: risks & allocation",
      "Investment suggestions for next 30 days",
    ],
    []
  );

  useEffect(() => {
    // Keep widget state stable across navigations (premium feel)
    const saved = localStorage.getItem("mm_ai_widget_open");
    if (saved) window.setTimeout(() => setOpen(saved === "true"), 0);
  }, []);

  useEffect(() => {
    localStorage.setItem("mm_ai_widget_open", String(open));
  }, [open]);

  const send = async (text: string) => {
  const trimmed = text.trim();
  if (!trimmed || loading) return;

  const updatedMessages = [
    ...messages,
    { role: "user" as const, text: trimmed },
  ];

  setMessages(updatedMessages);
  setInput("");
  setLoading(true);

  try {
    const apiMessages = updatedMessages.map((m) => ({
      role: m.role === "ai" ? "assistant" : "user",
      content: m.text,
    }));

    const res = await fetch("/api/ai-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: apiMessages,
      }),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      throw new Error(data.error || "Request failed");
    }

    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        text: data.reply,
      },
    ]);
  } catch (err: any) {
    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        text: `Couldn't reach MarketMind AI.\n${err.message}`,
      },
    ]);
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open ? (
        <div className="w-[320px] sm:w-[360px] rounded-2xl border border-[#27272A]/80 bg-[#18181B]/70 backdrop-blur-xl shadow-[0_0_60px_rgba(250,204,21,0.10)] overflow-hidden">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-yellow-400/10 border border-yellow-400/30 text-yellow-300">
                <Sparkles size={18} />
              </div>
              <div>
                <div className="font-bold">MarketMind AI</div>
                <div className="text-xs text-zinc-400">Fast explanations • Terminal-grade UI</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl border border-zinc-800 bg-black/20 px-2.5 py-1 text-xs text-zinc-300 hover:text-white hover:border-yellow-400/40"
            >
              Hide
            </button>
          </div>

          <div className="p-4 max-h-[320px] overflow-y-auto space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[85%] rounded-xl bg-yellow-400/15 border border-yellow-400/30 px-3 py-2 text-sm text-white"
                      : "max-w-[85%] rounded-xl bg-black/30 border border-zinc-800 px-3 py-2 text-sm text-zinc-200"
                  }
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-xs text-zinc-400">Thinking…</div>
            )}
          </div>

          <div className="p-4 border-t border-zinc-800">
            <div className="flex flex-wrap gap-2 mb-3">
              {quickPrompts.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => send(p)}
                  className="rounded-full border border-zinc-800 bg-black/20 px-3 py-1 text-xs text-zinc-300 hover:border-yellow-400/40 hover:text-white"
                >
                  {p}
                </button>
              ))}
            </div>

            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask MarketMind AI"
                className="flex-1 rounded-xl border border-zinc-800 bg-black/25 px-3 py-3 text-sm text-white outline-none focus:border-yellow-400/50"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-yellow-400 text-black px-3 py-3 font-bold disabled:opacity-60"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-2xl border border-[#27272A]/80 bg-[#18181B]/70 backdrop-blur-xl px-4 py-3 text-sm font-bold text-white shadow-[0_0_40px_rgba(250,204,21,0.08)] hover:border-yellow-400/40"
        >
          Open MarketMind AI
        </button>
      )}
    </div>
  );
}

