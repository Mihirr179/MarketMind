"use client";

import React from "react";

import TradingTerminalChart from "@/components/dashboard/TradingTerminalChart";
import MarketMovers from "@/components/dashboard/MarketMovers";

import GlobalMarketsGrid from "@/components/dashboard/GlobalMarketsGrid";
import LatestNewsGrid from "@/components/dashboard/LatestNewsGrid";
import AIDailyBrief from "@/components/dashboard/AIDailyBrief";

import { PortfolioDataProvider } from "@/components/dashboard/PortfolioDataContext";

// Note: The dashboard page currently fetches market/news data in the old layout.
// To preserve functionality without modifying business logic/widgets, we keep those
// same stubs here. PortfolioDataProvider is required by some nested widgets.

export default function DashboardMain({
  marketRows,
  newsLoading,
  news,
}: {
  marketLoading: boolean;
  marketRows: Array<{
    symbol: string;
    company?: string;
    price: number | null;
    changePercent: number | null;
    changeAbs: number | null;
  }>;
  newsLoading: boolean;
  news: Array<{
    title: string;
    source?: {
      id?: string;
      name?: string;
    };
  }>;
}) {
  void marketRows;

  return (
    <section className="min-w-0 w-full space-y-6">
      {/* Workspace row A: Chart dominates attention */}
      <div className="min-w-0 overflow-hidden">
        <TradingTerminalChart />
      </div>

      {/* Workspace row B: Market Intelligence (single, larger area) */}
      <section className="min-w-0 overflow-hidden rounded-3xl border border-zinc-800/70 bg-[#0F0F12]/30 backdrop-blur-xl">
        <div className="px-5 py-4 border-b border-zinc-800/60">
          <h3 className="text-sm font-bold tracking-wide text-white/90">Market Intelligence</h3>
          <p className="text-xs text-zinc-500 mt-1">From live movers to AI-driven context—one flow.</p>
        </div>

        <div className="p-5 space-y-5">
          {/* Market Pulse */}
          <div className="min-w-0 overflow-hidden rounded-2xl border border-zinc-800/60 bg-black/20">
            <div className="px-5 py-3 border-b border-zinc-800/60">
              <div className="text-xs font-bold tracking-wider text-white/90">Market Pulse</div>
              <div className="text-[11px] text-zinc-500 mt-1">Movers + global positioning.</div>
            </div>
            <div className="p-5 space-y-5">
              <PortfolioDataProvider>
                <div className="min-w-0 overflow-hidden">
                  <MarketMovers rows={marketRows} />
                </div>
              </PortfolioDataProvider>
              <div className="min-w-0 overflow-hidden">
                <GlobalMarketsGrid />
              </div>
            </div>
          </div>

          {/* News & AI Briefing */}
          <div className="min-w-0 overflow-hidden rounded-2xl border border-zinc-800/60 bg-black/20">
            <div className="px-5 py-3 border-b border-zinc-800/60">
              <div className="text-xs font-bold tracking-wider text-white/90">News & AI Briefing</div>
              <div className="text-[11px] text-zinc-500 mt-1">Headlines + daily insight.</div>
            </div>
            <div className="p-5 space-y-5">
              <div className="min-w-0 overflow-hidden">
                <LatestNewsGrid items={news} loading={newsLoading} />
              </div>
              <div className="min-w-0 overflow-hidden">
                <AIDailyBrief />
              </div>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}


