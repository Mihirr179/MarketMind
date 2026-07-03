import React from "react";

type Stock = {
  symbol: string;
  price: string;
  recommendation: "BUY" | "SELL";
  confidence: number;
  changePercent?: string;
};

export default function SearchHero({
  stock,
  onAddToWatchlist,
  onAiAnalysis,
}: {
  stock: Stock;
  onAddToWatchlist: () => void;
  onAiAnalysis: () => void;
}) {
  const changeNum = Number(String(stock.changePercent ?? "0").replace("%", ""));
  const isGreen = !Number.isNaN(changeNum) && changeNum >= 0;

  return (
    <section className="mb-10">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div>
          <div className="flex items-baseline gap-4">
            <h2 className="text-7xl font-bold text-[#FACC15] tracking-tight">
              {stock.symbol}
            </h2>
            {stock.changePercent ? (
              <span
                className={`px-4 py-2 rounded-full text-sm font-bold border backdrop-blur bg-white/5 border-white/10 ${
                  isGreen
                    ? "text-green-300"
                    : "text-red-300"
                }`}
              >
                Daily Change {stock.changePercent}
              </span>
            ) : null}
          </div>

          <p className={`text-5xl font-bold mt-3 ${isGreen ? "text-green-400" : "text-red-400"}`}>
            ${stock.price}
          </p>

          <div className="flex flex-wrap gap-3 mt-5">
            <span
              className={`px-4 py-2 rounded-full text-sm font-bold border backdrop-blur bg-white/5 border-white/10 ${
                stock.recommendation === "BUY"
                  ? "text-green-300"
                  : "text-red-300"
              }`}
            >
              {stock.recommendation === "BUY" ? "BUY" : "SELL"} badge
            </span>

            <span className="px-4 py-2 rounded-full text-sm font-bold border backdrop-blur bg-white/5 border-white/10 text-yellow-200">
              Confidence {stock.confidence}%
            </span>

            <span className="px-4 py-2 rounded-full text-sm font-bold border backdrop-blur bg-white/5 border-white/10 text-zinc-200">
              Market Status: Live
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 sm:items-center lg:items-end">
          <button
            onClick={onAddToWatchlist}
            className="bg-[#FACC15] text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 transition"
          >
            ⭐ Add To Watchlist
          </button>
          <button
            onClick={onAiAnalysis}
            className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-xl font-bold text-lg hover:border-[#FACC15]/40 hover:text-[#FACC15] transition"
          >
            🤖 AI Analysis
          </button>
        </div>
      </div>
    </section>
  );
}

