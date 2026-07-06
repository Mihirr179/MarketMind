"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

type MarketItem = {
  key: string;
  name: string;
  value: string;
  changePct: number;
};

// tone() removed: it was unused and caused a lint warning.


export default function GlobalMarketsGrid() {
  // Dummy values acceptable.
  const items: MarketItem[] = [
    { key: "nifty", name: "NIFTY 50", value: "24,860.12", changePct: 0.72 },
    { key: "sensex", name: "SENSEX", value: "81,443.88", changePct: -0.31 },
    { key: "nasdaq", name: "NASDAQ", value: "18,932.45", changePct: 0.28 },
    { key: "sp", name: "S&P 500", value: "5,572.90", changePct: 0.91 },
    { key: "dow", name: "DOW", value: "40,121.06", changePct: -0.44 },
    { key: "btc", name: "BTC", value: "$67,210", changePct: 1.24 },
    { key: "eth", name: "ETH", value: "$3,420", changePct: -0.18 },
  ];

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs text-zinc-400 font-medium">Global Markets</div>
          <h2 className="text-lg font-semibold mt-1">Index &amp; Crypto Snapshot</h2>
        </div>
        <div className="text-xs text-zinc-500">Dummy feed</div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((it) => {
          const isUp = it.changePct >= 0;
          return (
            <GlassCard
              key={it.key}
              className="p-4 rounded-2xl border border-zinc-800/60 bg-black/20 hover:border-[#FACC15]/40 shadow-none"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-zinc-400 font-medium truncate">{it.name}</div>
                  <div className="text-xl font-bold mt-2 tabular-nums">{it.value}</div>
                </div>
                <div
                  className={`text-sm font-bold tabular-nums flex items-center gap-2 ${
                    isUp ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  <span>{isUp ? "+" : ""}{it.changePct.toFixed(2)}%</span>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </GlassCard>
  );
}

