"use client";

import GlassCard from "@/components/ui/GlassCard";
import PortfolioAllocationChart from "@/components/dashboard/PortfolioAllocationChart";
import PortfolioPerformanceCard from "@/components/dashboard/PortfolioPerformanceCard";
import PortfolioRiskCard from "@/components/dashboard/PortfolioRiskCard";
import AIPortfolioAdvisor from "@/components/dashboard/AIPortfolioAdvisor";

import { usePortfolioData } from "@/components/dashboard/PortfolioDataContext";

export default function PortfolioPanel() {
  const { data, loading, error } = usePortfolioData();

  const allocation = data?.allocation ?? null;
  const holdingsCount = data?.holdingsCount ?? 0;

  const metrics = {
    total: data?.portfolioValue ?? null,
    pnl: data?.dailyPnL ?? null,
    pnlPct: data?.dailyPnLPct ?? null,
    topSym: data?.topHolding?.symbol ?? "--",
    worstSym: data?.worstHolding?.symbol ?? "--",
  };

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
                {metrics.total == null ? "--" : `$${metrics.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              </div>

            </div>

            <div className="rounded-2xl border border-zinc-800/70 bg-black/20 p-4">
              <div className="text-[11px] text-zinc-500">Today&apos;s Gain/Loss</div>
              <div
                className={`mt-1 text-2xl font-bold tabular-nums ${
                  metrics.pnl == null
                    ? "text-zinc-300"
                    : metrics.pnl >= 0
                      ? "text-emerald-400"
                      : "text-red-400"
                }`}
              >
                {metrics.pnl == null || metrics.pnlPct == null
                  ? "--"
                  : `${metrics.pnl >= 0 ? "+" : ""}$${metrics.pnl.toLocaleString()} (${metrics.pnlPct.toFixed(2)}%)`}
              </div>
            </div>


            <div className="rounded-2xl border border-zinc-800/70 bg-black/20 p-4">
              <div className="text-[11px] text-zinc-500">Overall Return %</div>
              <div className="mt-1 text-2xl font-bold tabular-nums text-white">
                {metrics.pnlPct == null ? "--" : `${metrics.pnlPct.toFixed(2)}%`}
              </div>
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
          <PortfolioPerformanceCard
            totalValue={metrics.total ?? undefined}
            todayPnL={metrics.pnl ?? undefined}
            todayPnLPct={metrics.pnlPct ?? undefined}
          />

        </div>
        <div className="space-y-4">
          <PortfolioRiskCard />

          <AIPortfolioAdvisor />


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


