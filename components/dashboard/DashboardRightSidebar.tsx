"use client";

import React from "react";

import WatchlistPanel from "@/components/dashboard/WatchlistPanel";
import TrendingStocksCard from "@/components/dashboard/TrendingStocksCard";
import AiResearchCard from "@/components/dashboard/AiResearchCard";
import PortfolioConditionalLayout from "@/components/dashboard/PortfolioConditionalLayout";

export default function DashboardRightSidebar() {
  return (
    <aside className="w-[300px] shrink-0" aria-label="Right sidebar">
      <div className="space-y-4">
        {/* Watchlist */}
        <section className="rounded-2xl border border-[#27272A]/70 bg-[#18181B]/35 backdrop-blur-xl p-4">
          <header className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] text-zinc-400 font-medium tracking-wider">WATCHLIST</div>
              <div className="text-sm font-semibold mt-1">Your focus list</div>
            </div>
          </header>
          <div className="mt-4 min-w-0 overflow-hidden">
            <WatchlistPanel />
          </div>
        </section>

        {/* AI Research */}
        <section className="rounded-2xl border border-[#27272A]/70 bg-[#18181B]/35 backdrop-blur-xl p-4">
          <header className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] text-zinc-400 font-medium tracking-wider">AI RESEARCH</div>
              <div className="text-sm font-semibold mt-1">Signals & summaries</div>
            </div>
          </header>

          <div className="mt-4 grid grid-cols-1 gap-4">
            <div className="min-w-0 overflow-hidden">
              <TrendingStocksCard />
            </div>
            <div className="min-w-0 overflow-hidden">
              <AiResearchCard symbol={"SPY"} />
            </div>

          </div>
        </section>

        {/* Portfolio */}
        <section className="rounded-2xl border border-[#27272A]/70 bg-[#18181B]/35 backdrop-blur-xl p-4">
          <header className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] text-zinc-400 font-medium tracking-wider">PORTFOLIO</div>
              <div className="text-sm font-semibold mt-1">Allocation & risk</div>
            </div>
          </header>

          <div className="mt-4 min-w-0 overflow-hidden">
            <PortfolioConditionalLayout />
          </div>
        </section>
      </div>
    </aside>
  );
}




