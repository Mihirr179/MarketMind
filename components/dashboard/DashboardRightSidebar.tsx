"use client";

import React from "react";

import WatchlistPanel from "@/components/dashboard/WatchlistPanel";
import TrendingStocksCard from "@/components/dashboard/TrendingStocksCard";
import AiResearchCard from "@/components/dashboard/AiResearchCard";
import PortfolioConditionalLayout from "@/components/dashboard/PortfolioConditionalLayout";

export default function DashboardRightSidebar() {
  return (
    <aside className="w-[350px] shrink-0 space-y-5" aria-label="Right sidebar">
      <div className="min-w-0 overflow-hidden">
        <WatchlistPanel />
      </div>
      <div className="min-w-0 overflow-hidden">
        <TrendingStocksCard />
      </div>
      <div className="min-w-0 overflow-hidden">
        <AiResearchCard symbol={"SPY"} confidence={86} risk={"Medium"} />
      </div>
      <div className="min-w-0 overflow-hidden">
        <PortfolioConditionalLayout />
      </div>
    </aside>
  );
}


