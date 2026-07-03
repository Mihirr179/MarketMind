"use client";

import { TrendingDown, TrendingUp, ArrowUpRight } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

type TrendingItem = {
  symbol: string;
  price: string;
  changePct: number;
};

export default function TrendingStocksCard() {
  const items: TrendingItem[] = [
    { symbol: "NVDA", price: "$124.65", changePct: 2.18 },
    { symbol: "AAPL", price: "$219.10", changePct: -0.62 },
    { symbol: "TSLA", price: "$236.44", changePct: 1.07 },
    { symbol: "META", price: "$530.22", changePct: -1.24 },
    { symbol: "AMZN", price: "$191.88", changePct: 0.41 },
  ];

  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-zinc-400 font-medium">Trending Stocks</div>
          <h2 className="text-lg font-semibold mt-1">Momentum Watch</h2>
        </div>
        <div className="text-xs text-zinc-500">Placeholder</div>
      </div>

      <div className="mt-4 space-y-2">
        {items.map((it, idx) => {
          const isUp = it.changePct >= 0;
          return (
            <div
              key={`${it.symbol}-${idx}`}
              className="group flex items-center justify-between gap-3 rounded-2xl border border-zinc-800/70 bg-black/20 px-3 py-3 transition hover:border-[#FACC15]/40"
            >
              <div className="min-w-0 flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-[#FACC15]/10 border border-[#FACC15]/30">
                  <span className="text-[11px] font-bold text-[#FACC15]">{it.symbol}</span>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white/95 truncate">{it.symbol}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">Price {it.price}</div>
                </div>
              </div>

              <div className={`flex items-center gap-2 ${isUp ? "text-emerald-400" : "text-red-400"}`}>
                {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <div className="text-sm font-bold tabular-nums">
                  {isUp ? "+" : ""}{it.changePct.toFixed(2)}%
                </div>
                <span className="opacity-0 group-hover:opacity-100 transition text-[#FACC15]">
                  <ArrowUpRight size={16} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

