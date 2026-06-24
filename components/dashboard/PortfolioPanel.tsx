"use client";

import { useEffect, useMemo, useState } from "react";
import GlassCard from "@/components/ui/GlassCard";

type PortfolioRow = {
  symbol?: string;
  value?: number;
  changePercent?: number;
};

export default function PortfolioPanel() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState<{
    totalValue?: number;
    todayPnL?: number;
    todayPnLPercent?: number;
    holdingsCount?: number;
    watchlistCount?: number;
    rows?: PortfolioRow[];
  }>({});

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/portfolio");
        const data = await res.json();
        if (cancelled) return;

        if (data && typeof data === "object") setPortfolio(data);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load portfolio");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const metrics = useMemo(() => {
    const total = typeof portfolio.totalValue === "number" ? portfolio.totalValue : 24580;
    const pnl = typeof portfolio.todayPnL === "number" ? portfolio.todayPnL : 1245;
    const pnlPct = typeof portfolio.todayPnLPercent === "number" ? portfolio.todayPnLPercent : 5.3;

    const rows = Array.isArray(portfolio.rows) ? portfolio.rows : [];
    const normalized = rows
      .filter((r) => typeof r.changePercent === "number")
      .map((r) => ({ symbol: r.symbol || "—", changePercent: r.changePercent as number }));

    const top = normalized.sort((a, b) => b.changePercent - a.changePercent)[0];
    const worst = normalized.sort((a, b) => a.changePercent - b.changePercent)[0];

    const topSym = top?.symbol || "AAPL";
    const worstSym = worst?.symbol || "MSFT";

    return {
      total,
      pnl,
      pnlPct,
      topSym,
      worstSym,
    };
  }, [portfolio]);

  const donut = useMemo(() => {
    // simple allocation donut from holdingsCount/watchlistCount for premium feel
    const h = typeof portfolio.holdingsCount === "number" ? portfolio.holdingsCount : 12;
    const w = typeof portfolio.watchlistCount === "number" ? portfolio.watchlistCount : 8;
    const total = Math.max(1, h + w);
    const holdingsPct = (h / total) * 100;
    const watchPct = 100 - holdingsPct;
    return { holdingsPct, watchPct };
  }, [portfolio]);

  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs text-zinc-400 font-medium">Portfolio</div>
          <h2 className="text-xl font-semibold mt-1">Total Value</h2>
        </div>
        <div className="text-xs text-zinc-500">Live allocation</div>
      </div>

      {loading ? (
        <div className="mt-5 space-y-3">
          <div className="h-10 w-36 rounded-xl bg-white/5 animate-[skeleton-shimmer_1.3s_ease-in-out_infinite]" />
          <div className="h-6 w-44 rounded-xl bg-white/5 animate-[skeleton-shimmer_1.3s_ease-in-out_infinite]" />
          <div className="h-24 w-full rounded-2xl bg-white/5 animate-[skeleton-shimmer_1.3s_ease-in-out_infinite]" />
        </div>
      ) : (
        <>
          <div className="mt-4 flex items-baseline justify-between gap-4">
            <div>
              <div className="text-4xl font-bold tabular-nums text-[#FACC15]">
                ${metrics.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div
                className={`mt-2 text-sm font-semibold ${metrics.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}
              >
                {metrics.pnl >= 0 ? "+" : ""}${metrics.pnl.toLocaleString()} ({metrics.pnlPct.toFixed(2)}%)
              </div>
            </div>

            <div className="hidden sm:block">
              <div className="text-xs text-zinc-400">Top Performer</div>
              <div className="mt-1 text-sm font-bold text-white">{metrics.topSym}</div>
              <div className="text-[11px] text-zinc-500 mt-1">Best daily momentum</div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 rounded-2xl border border-zinc-800/70 bg-black/20 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-zinc-400">Allocation</div>
                  <div className="text-sm font-semibold mt-1 text-white">Holdings vs Watchlist</div>
                </div>
                <div className="text-xs text-zinc-500">{donut.holdingsPct.toFixed(0)}% / {donut.watchPct.toFixed(0)}%</div>
              </div>
              <div className="mt-3 flex items-center gap-4">
                <div className="relative h-16 w-16">
                  <svg viewBox="0 0 36 36" className="h-16 w-16">
                    <path
                      d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#FACC15"
                      strokeWidth="3.8"
                      strokeLinecap="round"
                      strokeDasharray={`${(donut.holdingsPct / 100) * 100} 100`}
                    />
                    <path
                      d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#27272A"
                      strokeWidth="3.8"
                      strokeLinecap="round"
                      strokeDasharray={`${(donut.watchPct / 100) * 100} 100`}
                      transform="rotate(180 18 18)"
                    />
                  </svg>
                  <div className="absolute inset-0 grid place-items-center text-[11px] font-bold text-white/90">
                    MIX
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-zinc-800/70 bg-black/20 p-3">
                    <div className="text-[11px] text-zinc-500">Holdings</div>
                    <div className="mt-1 text-sm font-bold text-[#FACC15]">{Math.round(donut.holdingsPct)}%</div>
                  </div>
                  <div className="rounded-xl border border-zinc-800/70 bg-black/20 p-3">
                    <div className="text-[11px] text-zinc-500">Watchlist</div>
                    <div className="mt-1 text-sm font-bold text-white">{Math.round(donut.watchPct)}%</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800/70 bg-black/20 p-4">
              <div className="text-xs text-zinc-400">Worst Performer</div>
              <div className="mt-2 text-sm font-bold text-white">{metrics.worstSym}</div>
              <div className="text-[11px] text-zinc-500 mt-2">Needs attention</div>
            </div>
          </div>
        </>
      )}

      {error ? <div className="mt-3 text-xs text-red-400">{error}</div> : null}
    </GlassCard>
  );
}

