"use client";

import React from "react";

import TradingTerminalChart from "@/components/dashboard/TradingTerminalChart";
import MarketMovers from "@/components/dashboard/MarketMovers";
import MarketHeatmap from "@/components/dashboard/MarketHeatmap";
import GlobalMarketsGrid from "@/components/dashboard/GlobalMarketsGrid";
import LatestNewsGrid from "@/components/dashboard/LatestNewsGrid";
import AIDailyBrief from "@/components/dashboard/AIDailyBrief";
import AINewsInsights from "@/components/dashboard/AINewsInsights";

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
  // marketLoading/newsLoading are kept for parity with existing widget props.
  // Some widgets don't currently use them, which is fine for now.

  return (
    <section className="min-w-0 w-full space-y-6">
      <div className="min-w-0 overflow-hidden">
        <TradingTerminalChart />
      </div>

      <PortfolioDataProvider>
        <div className="min-w-0 overflow-hidden">
          <MarketMovers rows={marketRows} />
        </div>
      </PortfolioDataProvider>

      <div className="min-w-0 overflow-hidden">
        <MarketHeatmap />
      </div>

      <div className="min-w-0 overflow-hidden">
        <GlobalMarketsGrid />
      </div>

      <div className="min-w-0 overflow-hidden">
        <LatestNewsGrid items={news} loading={newsLoading} />
      </div>

      <div className="min-w-0 overflow-hidden">
        <AIDailyBrief />
      </div>


    </section>
  );
}

