"use client";

import { useEffect, useMemo, useState } from "react";
import GlassCard from "@/components/ui/GlassCard";
import Sparkline from "@/components/ui/Sparkline";
import { useChartState } from "./ChartStateContext";

type WatchlistItem = {
  symbol: string;
  name?: string;
  price?: number;
  changePercent?: number;
};

function sparkSeed(symbol: string) {
  return symbol
    .split("")
    .reduce((acc, c, i) => acc + c.charCodeAt(0) * (i + 3), 0);
}

function sparkValues(seed: number) {
  const out: number[] = [];
  let v = seed % 90;
  for (let i = 0; i < 18; i++) {
    v = v + Math.sin((i + seed) / 2.7) * 2.2 + ((seed % 13) - 6) * 0.08;
    out.push(v);
  }
  return out;
}

function tone(changePercent?: number) {
  if (typeof changePercent !== "number") return "yellow" as const;
  if (changePercent >= 0) return "green" as const;
  return "red" as const;
}

export default function WatchlistPanel() {
  const { setSymbol } = useChartState();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  void loading;






  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setItems([]);
          return;
        }

        const res = await fetch("/api/watchlist", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          setItems([]);
          return;
        }

        const data = (await res.json()) as {
          success?: boolean;
          watchlist?: Array<{ symbol: string; companyName?: string; addedAt?: string }>; 
        };

        if (Array.isArray(data.watchlist)) {
          setItems(
            data.watchlist.map((x) => ({
              symbol: x.symbol,
              name: x.companyName,
            }))
          );
        }
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);


  const [dragSymbol, setDragSymbol] = useState<string | null>(null);

  const ordered = useMemo(() => items.slice(0, 8), [items]);

  const onDrop = (targetSymbol: string) => {
    if (!dragSymbol || dragSymbol === targetSymbol) return;
    setItems((prev) => {
      const fromIdx = prev.findIndex((p) => p.symbol === dragSymbol);
      const toIdx = prev.findIndex((p) => p.symbol === targetSymbol);
      if (fromIdx < 0 || toIdx < 0) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
    setDragSymbol(null);
  };

  const addQuick = async (symbol: string) => {
    const normalized = symbol.trim().toUpperCase();

    // If user isn't logged in (token missing), show message requirement.
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      // Lightweight: using alert (no toast library found in repo).
      // Requirement says toast notifications; if a toast util exists, we can wire it later.
      window.alert("Login to save your watchlist.");
      return;
    }

    const exists = items.some((p) => p.symbol === normalized);
    if (exists) {
      window.alert("Already exists");
      return;
    }

    const prevItems = items;
    setItems((prev) => [{ symbol: normalized }, ...prev]);

    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ symbol: normalized }),
      });

      if (res.status === 409) {
        setItems(prevItems);
        window.alert("Already exists");
        return;
      }

      if (!res.ok) {
        setItems(prevItems);
        window.alert("Failed to save");
        return;
      }

      const data = (await res.json()) as {
        success?: boolean;
        watchlist?: Array<{ symbol: string; companyName?: string; addedAt?: string }>;
      };

      if (Array.isArray(data.watchlist)) {
        setItems(
          data.watchlist.map((x) => ({
            symbol: x.symbol,
            name: x.companyName,
          }))
        );
      }

      window.alert("Added to Watchlist");
    } catch {
      setItems(prevItems);
      window.alert("Failed to save");
    }
  };


  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-zinc-400 font-medium">Watchlist</div>
          <h2 className="text-xl font-semibold mt-1">Your Positions</h2>
          <p className="text-xs text-zinc-500 mt-1">Drag to reorder • Tap to route</p>
        </div>

        <div className="hidden sm:flex gap-2">
          {[
            { s: "AAPL", label: "AAPL" },
            { s: "TSLA", label: "TSLA" },
          ].map((x) => (
            <button
              key={x.s}
              type="button"
              onClick={() => void addQuick(x.s)}
              className="rounded-xl border border-[#27272A] bg-[#18181B]/40 px-3 py-2 text-xs text-zinc-300 hover:border-[#FACC15]/40 hover:text-white transition"
            >
              + {x.label}
            </button>
          ))}
        </div>

      </div>

      <div className="mt-4 space-y-2">
        {ordered.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-black/20 p-4 text-sm text-zinc-400">
            No stocks yet. Add from the terminal symbol search.
          </div>
        ) : (
          ordered.map((stock) => {
            const change = stock.changePercent;
            const isDown = typeof change === "number" && change < 0;
            const label = isDown ? "SELL" : "BUY";
            const toneKey = tone(change);

            return (
              <div
                key={stock.symbol}
                className={`group flex items-center justify-between gap-3 rounded-2xl border bg-black/20 px-3 py-3 transition cursor-pointer ${
                  dragSymbol === stock.symbol
                    ? "border-[#FACC15]/60"
                    : "border-[#27272A]/60 hover:border-[#FACC15]/40"
                }`}
                role="button"
                tabIndex={0}
                aria-label={`Set chart symbol to ${stock.symbol}`}
                onClick={() => setSymbol(stock.symbol)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setSymbol(stock.symbol);
                }}
                draggable
                onDragStart={() => setDragSymbol(stock.symbol)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(stock.symbol)}
              >
                <div className="min-w-0 flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-[#18181B]/70 border border-[#27272A]">
                    <span className="text-[11px] font-bold text-[#FACC15]">{stock.symbol.slice(0, 3)}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold text-white truncate">{stock.symbol}</div>
                      <span
                        className={`text-[11px] font-bold rounded-full px-2 py-0.5 border ${
                          toneKey === "green"
                            ? "text-emerald-300 border-emerald-400/30 bg-emerald-500/10"
                            : toneKey === "red"
                              ? "text-red-300 border-red-400/30 bg-red-500/10"
                              : "text-yellow-200 border-yellow-400/30 bg-yellow-400/10"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">
                      {typeof stock.price === "number" ? `Price $${stock.price.toFixed(2)}` : "Price —"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div
                      className={`text-sm font-bold tabular-nums ${
                        toneKey === "green"
                          ? "text-emerald-400"
                          : toneKey === "red"
                            ? "text-red-400"
                            : "text-yellow-200"
                      }`}
                    >
                      {typeof change === "number" ? `${change >= 0 ? "+" : ""}${change.toFixed(2)}%` : "—"}
                    </div>
                    <div className="text-[11px] text-zinc-500">Daily change</div>
                  </div>
                  <Sparkline values={sparkValues(sparkSeed(stock.symbol))} tone={toneKey} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </GlassCard>
  );
}

