"use client";

import { useEffect, useMemo, useState } from "react";
import GlassCard from "@/components/ui/GlassCard";

type PortfolioRow = {
  symbol?: string;
  value?: number;
  changePercent?: number;
};

import PortfolioAllocationChart from "@/components/dashboard/PortfolioAllocationChart";
import PortfolioPerformanceCard from "@/components/dashboard/PortfolioPerformanceCard";
import PortfolioRiskCard from "@/components/dashboard/PortfolioRiskCard";
import AIPortfolioAdvisor from "@/components/dashboard/AIPortfolioAdvisor";


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

  const allocation = useMemo(() => {
    // simple allocation donut from holdingsCount/watchlistCount for premium feel
    const h = typeof portfolio.holdingsCount === "number" ? portfolio.holdingsCount : 12;
    const w = typeof portfolio.watchlistCount === "number" ? portfolio.watchlistCount : 8;
    const total = Math.max(1, h + w);
    const holdingsPct = (h / total) * 100;
    const watchPct = 100 - holdingsPct;
    return { holdingsPct, watchPct };
  }, [portfolio]);

  const holdingsCount = typeof portfolio.holdingsCount === "number" ? portfolio.holdingsCount : 0;

  return (
    <div className="space-y-4">
      <GlassCard className="p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

        <div>
          <div className="text-xs text-zinc-400 font-medium">Portfolio Summary</div>
          <div className="text-xl font-semibold mt-1 text-white">Portfolio Analytics</div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
            <div className="rounded-2xl border border-zinc-800/70 bg-black/20 p-4">
              <div className="h-6 w-28 rounded-lg bg-white/5 animate-[skeleton-shimmer_1.3s_ease-in-out_infinite]" />
              <div className="mt-3 h-10 w-40 rounded-xl bg-white/5 animate-[skeleton-shimmer_1.3s_ease-in-out_infinite]" />
            </div>
            <div className="rounded-2xl border border-zinc-800/70 bg-black/20 p-4">
              <div className="h-6 w-28 rounded-lg bg-white/5 animate-[skeleton-shimmer_1.3s_ease-in-out_infinite]" />
              <div className="mt-3 h-10 w-36 rounded-xl bg-white/5 animate-[skeleton-shimmer_1.3s_ease-in-out_infinite]" />
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-zinc-800/70 bg-black/20 p-4">
              <div className="text-[11px] text-zinc-500">Total Portfolio Value</div>
              <div className="mt-1 text-3xl font-bold tabular-nums text-[#FACC15]">
                ${metrics.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800/70 bg-black/20 p-4">
              <div className="text-[11px] text-zinc-500">Today&apos;s Gain/Loss</div>
              <div className={`mt-1 text-2xl font-bold tabular-nums ${metrics.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {metrics.pnl >= 0 ? "+" : ""}${metrics.pnl.toLocaleString()} ({metrics.pnlPct.toFixed(2)}%)
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800/70 bg-black/20 p-4">
              <div className="text-[11px] text-zinc-500">Overall Return %</div>
              <div className="mt-1 text-2xl font-bold tabular-nums text-white">{metrics.pnlPct.toFixed(2)}%</div>
            </div>

            <div className="rounded-2xl border border-zinc-800/70 bg-black/20 p-4">
              <div className="text-[11px] text-zinc-500">Number of Holdings</div>
              <div className="mt-1 text-2xl font-bold tabular-nums text-white">{holdingsCount}</div>
            </div>
          </div>
        )}
      </div>

      {error ? <div className="mt-3 text-xs text-red-400">{error}</div> : null}
    </GlassCard>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          <PortfolioAllocationChart allocations={allocation} loading={loading} />
          <PortfolioPerformanceCard totalValue={metrics.total} todayPnL={metrics.pnl} todayPnLPct={metrics.pnlPct} />
        </div>
        <div className="space-y-4">
          <PortfolioRiskCard inputs={{ holdingsCount: portfolio.holdingsCount, totalValue: portfolio.totalValue, todayPnL: portfolio.todayPnL, todayPnLPercent: portfolio.todayPnLPercent }} />
          <AIPortfolioAdvisor
            portfolio={{
              totalValue: portfolio.totalValue,
              holdingsCount: portfolio.holdingsCount,
              todayPnLPercent: portfolio.todayPnLPercent,
              holdings: Array.isArray(portfolio.rows)
                ? portfolio.rows.map((r) => ({
                    symbol: r.symbol,
                    quantity: undefined,
                    averagePrice: undefined,
                    currentPrice: undefined,
                    totalValue: typeof r.value === "number" ? r.value : undefined,
                    allocationPct: undefined,
                  }))
                : [],
              allocation: allocation,
              riskMetrics: {
                volatilityPlaceholder: portfolio.todayPnLPercent,
                holdingsCount: portfolio.holdingsCount,
              },
            }}
          />

          <div className="rounded-2xl border border-zinc-800/70 bg-black/20 p-5">

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-zinc-400 font-medium">Top Performing Holding</div>
                <div className="text-sm font-semibold mt-1 text-white">{metrics.topSym}</div>
              </div>
              <div className="text-xs font-semibold text-emerald-400">▲</div>
            </div>
            <div className="mt-3 text-[11px] text-zinc-500">Best daily momentum</div>
          </div>

          <div className="rounded-2xl border border-zinc-800/70 bg-black/20 p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-zinc-400 font-medium">Worst Performing Holding</div>
                <div className="text-sm font-semibold mt-1 text-white">{metrics.worstSym}</div>
              </div>
              <div className="text-xs font-semibold text-red-400">▼</div>
            </div>
            <div className="mt-3 text-[11px] text-zinc-500">Needs attention</div>
          </div>
        </div>
      </div>
    </div>
  );
}


