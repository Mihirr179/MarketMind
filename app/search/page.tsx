"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import { useState } from "react";
import Link from "next/link";

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

  const chartData = [
    { day: "Mon", price: 180 },
    { day: "Tue", price: 185 },
    { day: "Wed", price: 182 },
    { day: "Thu", price: 190 },
    { day: "Fri", price: 195 },
    { day: "Sat", price: 193 },
    { day: "Sun", price: 200 },
  ];

  const handleSearch = async () => {
    if (!symbol) return;

    setLoading(true);

    try {
      const res = await fetch(
        `/api/search?symbol=${symbol.toUpperCase()}`
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

    localStorage.setItem(
      "watchlist",
      JSON.stringify(existing)
    );

    alert("Added to Watchlist ⭐");
  };

  return (
    <main className="min-h-screen bg-black text-white p-8">
     

      {/* Heading */}
      <h1 className="text-5xl font-bold text-yellow-400 mb-10">
        Stock Search
      </h1>

      {/* Search Bar */}
      <div className="flex gap-4 mb-10 max-w-4xl">
        <input
          type="text"
          placeholder="Enter Stock Symbol (AAPL)"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 rounded-xl px-5 py-4 flex-1 text-lg focus:outline-none focus:border-yellow-400"
        />

        <button
          onClick={handleSearch}
          className="bg-yellow-400 text-black px-8 py-4 rounded-xl font-bold hover:bg-yellow-300 transition"
        >
          {loading ? "Loading..." : "Search"}
        </button>
      </div>

      {/* Stock Result */}
      {stock && (
        <div className="w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-xl">
          {/* Header */}
          <div className="flex justify-between items-start mb-10">
            <div>
              <h2 className="text-7xl font-bold text-yellow-400">
                {stock.symbol}
              </h2>

              <p className="text-5xl font-bold text-green-400 mt-3">
                ${stock.price}
              </p>
            </div>

            <div className="text-right">
              <p className="text-zinc-400 text-lg">
                Confidence
              </p>

              <p className="text-green-400 text-6xl font-bold">
                {stock.confidence}%
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-zinc-800 rounded-2xl p-5">
              <p className="text-zinc-400 text-sm">Open</p>
              <p className="text-2xl font-semibold mt-2">
                {stock.open}
              </p>
            </div>

            <div className="bg-zinc-800 rounded-2xl p-5">
              <p className="text-zinc-400 text-sm">
                Previous Close
              </p>
              <p className="text-2xl font-semibold mt-2">
                {stock.previousClose}
              </p>
            </div>

            <div className="bg-zinc-800 rounded-2xl p-5">
              <p className="text-zinc-400 text-sm">High</p>
              <p className="text-2xl font-semibold mt-2">
                {stock.high}
              </p>
            </div>

            <div className="bg-zinc-800 rounded-2xl p-5">
              <p className="text-zinc-400 text-sm">Low</p>
              <p className="text-2xl font-semibold mt-2">
                {stock.low}
              </p>
            </div>
          </div>

          {/* Recommendation */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="bg-zinc-800 rounded-2xl p-6">
              <p className="text-zinc-400 mb-3">
                Recommendation
              </p>

              <span
                className={`px-5 py-2 rounded-full font-bold text-lg ${
                  stock.recommendation === "BUY"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {stock.recommendation}
              </span>
            </div>

            <div className="bg-zinc-800 rounded-2xl p-6">
              <p className="text-zinc-400 mb-3">
                Change %
              </p>

              <p
                className={`text-3xl font-bold ${
                  String(stock.changePercent ?? "").includes("-")
                    ? "text-red-400"
                    : "text-green-400"
                }`}
              >
                {stock.changePercent}
              </p>
            </div>
          </div>

          {/* Chart */}
          <div className="mt-10">
            <h3 className="text-2xl font-bold text-yellow-400 mb-4">
              7-Day Price Trend
            </h3>

            <div className="bg-zinc-800 p-4 rounded-2xl">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#facc15"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Watchlist Button */}
          <button
            onClick={addToWatchlist}
            className="mt-8 bg-yellow-400 text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 transition"
          >
            ⭐ Add To Watchlist
          </button>
        </div>
      )}
    </main>
  );
}