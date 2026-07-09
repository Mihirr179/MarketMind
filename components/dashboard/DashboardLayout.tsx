"use client";

import React, { useEffect, useState } from "react";

import TerminalTopNav from "@/components/dashboard/TerminalTopNav";
import DashboardHeaderSection from "@/components/dashboard/DashboardHeaderSection";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import DashboardMain from "@/components/dashboard/DashboardMain";
import DashboardRightSidebar from "@/components/dashboard/DashboardRightSidebar";
import AiChatWidget from "@/components/dashboard/AiChatWidget";


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

export default function DashboardLayout() {
  const [marketRows, setMarketRows] = useState<MarketRow[]>([]);
  const [marketLoading, setMarketLoading] = useState(true);

  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

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

  useEffect(() => {
    let cancelled = false;

    async function loadNews() {
      setNewsLoading(true);
      try {
        const res = await fetch("/api/news");
        const data = await res.json();
        if (cancelled) return;
        if (Array.isArray(data)) setNews(data.slice(0, 8));
        else setNews([]);
      } catch {
        if (!cancelled) setNews([]);
      } finally {
        if (!cancelled) setNewsLoading(false);
      }
    }

    void loadNews();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="bg-[#09090B] text-white">
      <TerminalTopNav />

      <div className="mx-auto w-full max-w-[1700px] px-6">
        <div className="space-y-5 py-4 sm:py-6">
          <DashboardHeaderSection />
          <DashboardMetrics />

          <div className="grid grid-cols-[280px_minmax(0,1fr)_350px] gap-5 items-start">
            {/* Left rail: Market Watch + Alerts */}
            <aside className="w-[280px] shrink-0" aria-label="Dashboard sidebar">
              <div className="rounded-2xl border border-[#27272A]/80 bg-[#18181B]/50 backdrop-blur-xl p-4 space-y-4 shadow-[0_0_0_1px_rgba(250,204,21,0.0)] hover:border-[#FACC15]/40">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-zinc-400 font-medium">Market Watch</div>
                    <div className="text-sm font-semibold mt-1">Quick movers</div>
                  </div>
                  <div className="text-[11px] text-zinc-500">Live</div>
                </div>

                <div className="space-y-2">
                  {[
                    { symbol: "AAPL", tone: "#34D399", dir: "+" },
                    { symbol: "NVDA", tone: "#34D399", dir: "+" },
                    { symbol: "TSLA", tone: "#F87171", dir: "-" },
                  ].map((x) => (
                    <button
                      key={x.symbol}
                      type="button"
                      className="w-full text-left rounded-xl border border-zinc-800/70 bg-black/20 px-3 py-2 hover:border-[#FACC15]/40 transition"
                      onClick={() => (window.location.href = `/dashboard?symbol=${encodeURIComponent(x.symbol)}`)}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-xs text-zinc-500">{x.symbol}</div>
                          <div className="text-sm font-semibold text-white/95 truncate">{x.dir} Trend</div>
                        </div>
                        <div
                          className="grid size-7 place-items-center rounded-lg border border-zinc-800/70"
                          style={{ color: x.tone }}
                        >
                          {x.dir === "+" ? "↗" : "↘"}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-[#27272A]/60">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div>
                      <div className="text-xs text-zinc-400 font-medium">Alerts</div>
                      <div className="text-sm font-semibold mt-1">3 triggers</div>
                    </div>
                    <div className="text-[11px] text-[#FACC15] font-bold">Focus</div>
                  </div>

                  <div className="space-y-2">
                    {["Price cross", "High volatility", "Volume spike"].map((t) => (
                      <div
                        key={t}
                        className="rounded-xl border border-zinc-800/70 bg-black/20 px-3 py-2 text-xs text-zinc-300 flex items-center justify-between"
                      >
                        <span className="truncate">{t}</span>
                        <span className="text-[#FACC15] font-bold">●</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>


            <div className="min-w-0">
              <DashboardMain
                marketLoading={marketLoading}
                marketRows={marketRows}
                newsLoading={newsLoading}
                news={news}
              />
            </div>

            <div className="min-w-0">
              <DashboardRightSidebar />
            </div>
          </div>


          <AiChatWidget />
        </div>
      </div>
    </main>
  );
}


