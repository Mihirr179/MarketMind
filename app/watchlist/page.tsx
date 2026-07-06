"use client";


import { useState } from "react";

type WatchlistItem = {
  symbol: string;
  recommendation?: "BUY" | "SELL";
  price?: string;
  confidence?: number;
  changePercent?: string;
};

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    // Lazy initialization avoids the lint rule about setState in effects.
    if (typeof window === "undefined") return [];

    try {
      const storedRaw = localStorage.getItem("watchlist") || "[]";
      const parsed: unknown = JSON.parse(storedRaw);
      if (!Array.isArray(parsed)) return [];

      return parsed
        .map((x) => x as Partial<WatchlistItem>)
        .filter((x) => typeof x.symbol === "string" && x.symbol.length > 0)
        .map((x) => ({
          symbol: x.symbol as string,
          recommendation: x.recommendation,
          price: x.price,
          confidence: x.confidence,
          changePercent: x.changePercent,
        }));
    } catch {
      return [];
    }
  });

  const removeStock = (symbol: string) => {
    const updated = watchlist.filter(
      (item) => item.symbol !== symbol
    );

    setWatchlist(updated);

    localStorage.setItem(
      "watchlist",
      JSON.stringify(updated)
    );
  };

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">

              

        <h1 className="text-5xl font-bold text-yellow-400 mb-8">
          Your Watchlist
        </h1>

        {watchlist.length === 0 ? (
          <div className="bg-zinc-900 p-10 rounded-2xl border border-zinc-800 text-center">
            <p className="text-zinc-400 text-lg">
              No stocks in watchlist ⭐
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {watchlist.map((stock, index) => (
              <div
                key={index}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-yellow-400 transition"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold text-yellow-400">
                    {stock.symbol}
                  </h2>

                  <span
                    className={`px-3 py-1 rounded-full text-sm font-bold ${
                      stock.recommendation === "BUY"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {stock.recommendation}
                  </span>
                </div>

                <p className="text-green-400 text-2xl mt-4">
                  ${stock.price}
                </p>

                <p className="mt-3 text-zinc-400">
                  Confidence: {stock.confidence}%
                </p>

                <p
                  className={`mt-2 ${
                    stock.changePercent?.includes("-")
                      ? "text-red-400"
                      : "text-green-400"
                  }`}
                >
                  {stock.changePercent ?? "--"}
                </p>

                <button
                  onClick={() => removeStock(stock.symbol)}
                  className="mt-6 w-full bg-red-500 hover:bg-red-600 py-3 rounded-xl font-bold"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}