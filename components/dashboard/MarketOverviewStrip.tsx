"use client";

import { useMemo } from "react";
import Sparkline from "@/components/ui/Sparkline";
import GlassCard from "@/components/ui/GlassCard";

type MarketCard = {
  key: string;
  name: string;
  symbol: string;
  price?: number | null;
  changePercent?: number | null;
};

const BASE: MarketCard[] = [
  { key: "sp500", name: "S&P 500", symbol: "SPY" },
  { key: "nasdaq", name: "Nasdaq", symbol: "QQQ" },
  { key: "dow", name: "Dow Jones", symbol: "DIA" },
  { key: "nifty", name: "Nifty 50", symbol: "^NSEI" },
  { key: "sensex", name: "Sensex", symbol: "^BSESN" },
  { key: "btc", name: "Bitcoin", symbol: "BTC-USD" },
  { key: "eth", name: "Ethereum", symbol: "ETH-USD" },
];

function toneFor(change?: number | null) {
  if (typeof change !== "number") return "yellow" as const;
  if (change >= 0) return "green" as const;
  return "red" as const;
}

function sparkValues(seed: number) {
  // deterministic small shape for premium feel
  const vals: number[] = [];
  let v = seed;
  for (let i = 0; i < 18; i++) {
    v = v + Math.sin((i + seed) / 3) * 2 + (seed % 7) - 3;
    vals.push(v);
  }
  return vals;
}

export default function MarketOverviewStrip({
  rows,
}: {
  rows: Record<string, { price?: number | null; changePercent?: number | null }>;
}) {
  const items = useMemo(() => {
    return BASE.map((m) => ({
      ...m,
      price: rows[m.symbol]?.price ?? null,
      changePercent: rows[m.symbol]?.changePercent ?? null,
    }));
  }, [rows]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
      {items.map((item, idx) => {
        const change = item.changePercent;
        const tone = toneFor(change);
        const sign = typeof change === "number" && change >= 0 ? "+" : "";
        const displayPrice = typeof item.price === "number" ? item.price.toFixed(2) : "—";
        const changeText = typeof change === "number" ? `${sign}${change.toFixed(2)}%` : "—";

        const seed = (idx + 1) * 17 + (item.symbol.length % 9) * 11;

        return (
          <GlassCard key={item.key} className="p-4 h-[92px]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs text-zinc-400 font-medium truncate">{item.name}</div>
                <div className="text-lg font-bold mt-1 tabular-nums text-white">
                  {displayPrice}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div
                  className={`text-xs font-bold tabular-nums ${
                    tone === "green" ? "text-emerald-400" : tone === "red" ? "text-red-400" : "text-yellow-300"
                  }`}
                >
                  {changeText}
                </div>
                <Sparkline values={sparkValues(seed)} tone={tone === "yellow" ? "yellow" : tone} />
              </div>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}

