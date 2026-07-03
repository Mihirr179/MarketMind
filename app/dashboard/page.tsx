"use client";

import { useEffect, useState } from "react";
import TradingTerminalChart from "@/components/dashboard/TradingTerminalChart";
import { ChartStateProvider } from "@/components/dashboard/ChartStateContext";
import TerminalTopNav from "@/components/dashboard/TerminalTopNav";
import WatchlistPanel from "@/components/dashboard/WatchlistPanel";
import AiResearchCard from "@/components/dashboard/AiResearchCard";
import PortfolioPanel from "@/components/dashboard/PortfolioPanel";

import MarketMovers from "@/components/dashboard/MarketMovers";
import AiChatWidget from "@/components/dashboard/AiChatWidget";
import GlassCard from "@/components/ui/GlassCard";
import { SkeletonBlock } from "@/components/ui/Skeleton";
import { useRouter, useSearchParams } from "next/navigation";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import TerminalMetricCards from "@/components/dashboard/TerminalMetricCards";
import GlobalMarketsGrid from "@/components/dashboard/GlobalMarketsGrid";
import TrendingStocksCard from "@/components/dashboard/TrendingStocksCard";
import LatestNewsGrid from "@/components/dashboard/LatestNewsGrid";



export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();


  type User = {
    name: string;
    email: string;
  };

  type NewsItem = {
    title: string;
    source?: {
      id?: string;
      name?: string;
    };
  };

  type MarketRow = {
    symbol: string;
    price: number | null;
    changePercent: number | null;
    changeAbs: number | null;
    error?: string;
  };

  const [user, setUser] = useState<User | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [marketRows, setMarketRows] = useState<MarketRow[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [marketLoading, setMarketLoading] = useState(true);

  useEffect(() => {
    const init = () => {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        router.push("/login");
        return;
      }

      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
        router.push("/login");
        return;
      }

      fetch("/api/news")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setNews(data.slice(0, 8));
          else setNews([]);
        })
        .catch(() => setNews([]))
        .finally(() => setNewsLoading(false));
    };

    const t = window.setTimeout(init, 0);
    return () => window.clearTimeout(t);
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    async function refreshMarket() {
      try {
        const res = await fetch(
          "/api/market?symbols=AAPL,MSFT,NVDA,TSLA,AMZN,GOOGL,META,AMD,NFLX,SPY"
        );
        const data = (await res.json()) as MarketRow[];
        if (!cancelled) setMarketRows(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setMarketRows([]);
      } finally {
        if (!cancelled) setMarketLoading(false);
      }
    }

    refreshMarket();
    const id = window.setInterval(refreshMarket, 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#09090B] text-white p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-16 left-10 w-96 h-96 bg-[#FACC15]/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FACC15]/10 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10">
        <TerminalTopNav />

        <div className="mt-4">
          <DashboardHeader />


          {/* Row 1: Terminal metric cards */}
          <div className="mt-4">
            <TerminalMetricCards />
          </div>

          {/* Row 2: Global Markets */}
          <div className="mt-4">
            <GlobalMarketsGrid />
          </div>

          {/* Terminal main area (keeps existing chart / movers logic) */}
          <div className="mt-4">
            <ChartStateProvider initialSymbol={(searchParams.get("symbol") || "SPY").toUpperCase()}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                  {/* Trading Terminal */}
                  <TradingTerminalChart />

                  {/* Market Movers (kept for continuity; premium terminal vibe) */}
                  {marketLoading ? (
                    <GlassCard className="p-5">
                      <SkeletonBlock className="h-72 w-full" />
                    </GlassCard>
                  ) : (
                    <MarketMovers
                      rows={marketRows as unknown as Array<{
                        symbol: string;
                        company?: string;
                        price: number | null;
                        changePercent: number | null;
                        changeAbs: number | null;
                      }>}
                    />
                  )}
                </div>

                {/* Row 3 right column (30%): Trending Stocks */}
                <div className="space-y-4">
                  <WatchlistPanel />

                  <TrendingStocksCard />

                  {/* Keep existing portfolio + AI research so dashboard remains feature-complete */}
                  <AiResearchCard
                    symbol={(searchParams.get("symbol") || "SPY").toUpperCase()}
                    confidence={86}
                    risk="Medium"
                  />
                  <PortfolioPanel />
                </div>
              </div>
            </ChartStateProvider>
          </div>

          {/* Row 4: Latest Market News (reuse existing news UI) */}
          <div className="mt-4">
            {newsLoading ? (
              <GlassCard className="p-5">
                <SkeletonBlock className="h-96 w-full" />
              </GlassCard>
            ) : (
              <LatestNewsGrid
                items={news as unknown as Array<{
                  title: string;
                  source?: { id?: string; name?: string };
                }>}
                loading={false}
              />
            )}
          </div>

          <AiChatWidget />
        </div>
      </div>
    </main>
  );
}



