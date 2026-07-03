"use client";

import { useState } from "react";

import SearchHero from "../../components/search/SearchHero";
import PriceCards from "../../components/search/PriceCards";
import ChartCard from "../../components/search/ChartCard";
import CompanyProfile from "../../components/search/CompanyProfile";
import TechnicalCard from "../../components/search/TechnicalCard";
import AIAnalysisCard from "../../components/search/AIAnalysisCard";
import NewsPlaceholder from "../../components/search/NewsPlaceholder";
import Skeleton from "../../components/search/Skeleton";

export default function SearchPage() {
  const [symbol, setSymbol] = useState("");
  type StockState = {
    symbol: string;
    price: string;
    open?: string;
    high?: string;
    low?: string;
    previousClose?: string;
    changePercent?: string;
    recommendation: "BUY" | "SELL";
    confidence: number;
  };

  const [stock, setStock] = useState<StockState | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!symbol) return;

    setLoading(true);

    try {
      const res = await fetch(
        `/api/search?symbol=${encodeURIComponent(symbol.toUpperCase())}&q=${encodeURIComponent(symbol)}`
      );

      const data = await res.json();

      const quote = data?.["Global Quote"];

      if (!quote || !quote["01. symbol"]) {
        alert(data?.error || "Stock not found");
        return;
      }

      const changePercentRaw = quote["10. change percent"];
      const changePercentStr =
        typeof changePercentRaw === "string" ? changePercentRaw : "0.00%";
      const changePercentNum = parseFloat(changePercentStr);

      setStock({
        symbol: quote["01. symbol"],
        price: quote["05. price"],
        open: quote["02. open"],
        high: quote["03. high"],
        low: quote["04. low"],
        previousClose: quote["08. previous close"],
        changePercent: changePercentStr,
        recommendation: changePercentNum > 0 ? "BUY" : "SELL",
        confidence: changePercentNum > 0 ? 84 : 72,
      });
    } catch (error) {
      console.error(error);
      alert("Error fetching stock");
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = () => {
    if (!stock) return;

    const existing: StockState[] = JSON.parse(
      localStorage.getItem("watchlist") || "[]"
    );

    const alreadyExists = existing.find(
      (item: { symbol: string }) => item.symbol === stock.symbol
    );

    if (alreadyExists) {
      alert("Stock already in watchlist");
      return;
    }

    existing.push(stock);

    localStorage.setItem("watchlist", JSON.stringify(existing));

    alert("Added to Watchlist ⭐");
  };

  return (
    <main className="min-h-screen bg-black text-white p-6 sm:p-8">
      <div className="max-w-[1600px] w-full mx-auto px-2 sm:px-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-[#FACC15] mb-8 sm:mb-10">
          Stock Research
        </h1>

        <div className="flex gap-4 mb-8 sm:mb-10">
          <input
            type="text"
            placeholder="Enter Stock Symbol (AAPL)"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 rounded-xl px-5 py-4 flex-1 text-lg focus:outline-none focus:border-[#FACC15]"
          />

          <button
            onClick={handleSearch}
            className="bg-[#FACC15] text-black px-6 sm:px-8 py-4 rounded-xl font-bold hover:bg-yellow-300 transition"
          >
            {loading ? "Loading..." : "Search"}
          </button>
        </div>

        {!stock && !loading && (
          <div className="w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-[#FACC15]">No Stock Selected</h2>
            <p className="text-zinc-300 mt-2">
              Search any stock to begin.
            </p>
          </div>
        )}

        {loading && <Skeleton />}

        {stock && (
          <div className="w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <SearchHero
              stock={stock}
              onAddToWatchlist={addToWatchlist}
              onAiAnalysis={() => {
                // AI handled inside AIAnalysisCard
              }}
            />

            <PriceCards stock={stock} />

            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
              <div className="lg:col-span-7">
                <ChartCard stock={{ symbol: stock.symbol }} />
              </div>
              <div className="lg:col-span-3">
                <CompanyProfile stock={{ symbol: stock.symbol }} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
              <div className="lg:col-span-3">
                <TechnicalCard stock={stock} />
              </div>
              <div className="lg:col-span-7">
                <AIAnalysisCard stock={stock} />
              </div>
            </div>

            <NewsPlaceholder />
          </div>
        )}
      </div>
    </main>
  );
}

