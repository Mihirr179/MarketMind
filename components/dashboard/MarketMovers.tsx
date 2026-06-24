"use client";

import GlassCard from "@/components/ui/GlassCard";

type Row = {
  symbol: string;
  company?: string;
  price: number | null;
  changePercent: number | null;
  changeAbs: number | null;
};

export default function MarketMovers({ rows }: { rows: Row[] }) {
  const normalized = Array.isArray(rows) ? rows : [];

  const gainers = normalized
    .filter((r) => typeof r.changePercent === "number")
    .sort((a, b) => (b.changePercent ?? 0) - (a.changePercent ?? 0))
    .slice(0, 6);

  const losers = normalized
    .filter((r) => typeof r.changePercent === "number")
    .sort((a, b) => (a.changePercent ?? 0) - (b.changePercent ?? 0))
    .slice(0, 6);

  const Cell = ({
    symbol,
    changePercent,
    volume,
  }: {
    symbol: string;
    changePercent: number | null;
    volume?: number | null;
  }) => {
    const cp = typeof changePercent === "number" ? changePercent : 0;
    const isDown = cp < 0;
    return (
      <div className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800/70 bg-black/20 px-3 py-2">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white truncate">{symbol}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Volume {typeof volume === "number" ? volume.toLocaleString() : "—"}</div>
        </div>
        <div className={`text-sm font-bold tabular-nums ${isDown ? "text-red-400" : "text-emerald-400"}`}>
          {cp >= 0 ? "+" : ""}{cp.toFixed(2)}%
        </div>
      </div>
    );
  };

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-zinc-400 font-medium">Market Movers</div>
          <h2 className="text-lg font-semibold mt-1">Top Gainers & Losers</h2>
        </div>
        <div className="text-xs text-zinc-500">Live ranking</div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">Top Gainers</div>
          <div className="space-y-2">
            {gainers.length === 0 ? (
              <div className="text-sm text-zinc-500">No data</div>
            ) : (
              gainers.map((r) => <Cell key={r.symbol} symbol={r.symbol} changePercent={r.changePercent} />)
            )}
          </div>
        </div>

        <div>
          <div className="text-xs font-bold text-red-300 uppercase tracking-wider mb-2">Top Losers</div>
          <div className="space-y-2">
            {losers.length === 0 ? (
              <div className="text-sm text-zinc-500">No data</div>
            ) : (
              losers.map((r) => <Cell key={r.symbol} symbol={r.symbol} changePercent={r.changePercent} />)
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

