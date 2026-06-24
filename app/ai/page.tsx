"use client";

import { useMemo, useState } from "react";

import {
  Brain,
  BarChart3,
  Briefcase,
  FileText,
  Bell,
  User,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

type AlphaVantageGlobalQuoteResponse = {
  "Global Quote"?: {
    "01. symbol"?: string;
    "05. price"?: string;
    "09. changes"?: string;
    "10. change percent"?: string;
  };
  Note?: string;
  Error?: string;
};

function formatUSDOrNumber(value?: string) {
  if (!value) return "—";
  const n = Number(value);
  if (Number.isNaN(n)) return value;
  return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export default function AIPage() {
  const [symbol, setSymbol] = useState("AAPL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<AlphaVantageGlobalQuoteResponse | null>(null);

  const chartData = useMemo(
    () => [
      { day: "Mon", value: 120 },
      { day: "Tue", value: 150 },
      { day: "Wed", value: 140 },
      { day: "Thu", value: 180 },
      { day: "Fri", value: 210 },
      { day: "Sat", value: 190 },
      { day: "Sun", value: 250 },
    ],
    []
  );

  const globalQuote = quote?.["Global Quote"];
  const price = formatUSDOrNumber(globalQuote?.["05. price"]);
  const changes = formatUSDOrNumber(globalQuote?.["09. changes"]);
  const changePercentRaw = globalQuote?.["10. change percent"];
  const changePercent = changePercentRaw ? changePercentRaw.replace("%", "%") : null;

  const handleAnalyze = async () => {
    const trimmed = symbol.trim().toUpperCase();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setQuote(null);

    try {
      const res = await fetch(`/api/search?symbol=${encodeURIComponent(trimmed)}`);
      const data = (await res.json()) as (AlphaVantageGlobalQuoteResponse & { error?: string });

      if (!res.ok || data?.error) {
        setError(data?.error || "Failed to analyze symbol");
        return;
      }

      setQuote(data);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Network error";
      setError(message);
    } finally {
      setLoading(false);
    }

  };

  return (
    <main className="min-h-screen bg-black text-white flex relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,#facc15,transparent_35%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_right,#9333ea,transparent_35%)]"></div>
      </div>

      {/* Main Content */}
      <section className="flex-1 p-8 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-5xl font-bold text-yellow-400">
              AI Research Center
            </h1>
            <p className="text-zinc-400 mt-2">
              Analyze stocks using AI-powered insights.
            </p>
          </div>

          <div className="flex gap-5">
            <Bell />
            <User />
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAnalyze();
            }}
            placeholder="Enter Stock Symbol (AAPL, TSLA, RELIANCE)"
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-4"
          />

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="bg-yellow-400 text-black font-bold px-8 rounded-xl disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>

        {error ? (
          <div className="mb-8 text-red-400 bg-red-950/40 border border-red-800 rounded-xl px-4 py-3">
            {error}
          </div>
        ) : null}

        {/* Portfolio Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900 p-5 rounded-2xl">
            <p className="text-zinc-400">Stock Price</p>
            <h2 className="text-3xl text-green-400 font-bold">{price}</h2>
            <p className="text-zinc-500 mt-1">{globalQuote?.["01. symbol"] || "—"}</p>
          </div>

          <div className="bg-zinc-900 p-5 rounded-2xl">
            <p className="text-zinc-400">Today&apos;s Change</p>
            <h2
              className={`text-3xl font-bold ${
                (globalQuote?.["09. changes"] || "0").startsWith("-")
                  ? "text-red-400"
                  : "text-green-400"
              }`}
            >
              {changes}
            </h2>
            <p className="text-zinc-500 mt-1">{changePercent || "—"}</p>
          </div>

          <div className="bg-zinc-900 p-5 rounded-2xl">
            <p className="text-zinc-400">Risk Score</p>
            <h2 className="text-3xl text-yellow-400 font-bold">Medium</h2>
          </div>

          <div className="bg-zinc-900 p-5 rounded-2xl">
            <p className="text-zinc-400">AI Accuracy</p>
            <h2 className="text-3xl text-green-400 font-bold">98%</h2>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 mb-10">
          <button
            onClick={() => {
              setSymbol("RELIANCE");
              setTimeout(handleAnalyze, 0);
            }}
            className="bg-zinc-900 px-5 py-3 rounded-xl border border-zinc-700"
          >
            Analyze RELIANCE
          </button>

          <button className="bg-zinc-900 px-5 py-3 rounded-xl border border-zinc-700">
            Compare HDFC vs ICICI
          </button>

          <button className="bg-zinc-900 px-5 py-3 rounded-xl border border-zinc-700">
            Top AI Stocks
          </button>

          <button className="bg-zinc-900 px-5 py-3 rounded-xl border border-zinc-700">
            Market Outlook
          </button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-4 gap-6 mb-10">
          <div className="bg-zinc-900 p-6 rounded-3xl">
            <Brain className="text-yellow-400 mb-4" />
            <h3 className="font-bold text-xl">AI Analysis</h3>
          </div>

          <div className="bg-zinc-900 p-6 rounded-3xl">
            <BarChart3 className="text-yellow-400 mb-4" />
            <h3 className="font-bold text-xl">Comparison</h3>
          </div>

          <div className="bg-zinc-900 p-6 rounded-3xl">
            <Briefcase className="text-yellow-400 mb-4" />
            <h3 className="font-bold text-xl">Portfolio</h3>
          </div>

          <div className="bg-zinc-900 p-6 rounded-3xl">
            <FileText className="text-yellow-400 mb-4" />
            <h3 className="font-bold text-xl">Reports</h3>
          </div>
        </div>

        {/* Market Trend Chart */}
        <div className="bg-zinc-900 p-8 rounded-3xl mb-10">
          <h2 className="text-3xl text-yellow-400 font-bold mb-6">
            Market Trend
          </h2>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#facc15"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Market Sentiment */}
        <div className="bg-zinc-900 p-8 rounded-3xl mb-10">
          <h2 className="text-3xl text-yellow-400 font-bold mb-6">
            Market Sentiment
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-zinc-800 p-5 rounded-xl">
              <h3 className="text-green-400 text-4xl font-bold">78%</h3>
              <p>Bullish</p>
            </div>
            <div className="bg-zinc-800 p-5 rounded-xl">
              <h3 className="text-yellow-400 text-4xl font-bold">15%</h3>
              <p>Neutral</p>
            </div>
            <div className="bg-zinc-800 p-5 rounded-xl">
              <h3 className="text-red-400 text-4xl font-bold">7%</h3>
              <p>Bearish</p>
            </div>
          </div>
        </div>

        {/* AI Assistant */}
        <div className="bg-zinc-900 p-8 rounded-3xl mb-10">
          <h2 className="text-3xl font-bold text-yellow-400 mb-6">
            🤖 MarketMind AI Copilot
          </h2>

          <div className="h-80 overflow-y-auto bg-black rounded-2xl p-5 mb-4">
            {quote?.["Global Quote"] ? (
              <div>
                <div className="mb-4">
                  <div className="bg-yellow-400 text-black p-3 rounded-xl inline-block">
                    Analyze {globalQuote?.["01. symbol"]}
                  </div>
                </div>

                <div>
                  <div className="bg-zinc-800 p-4 rounded-xl inline-block max-w-2xl">
                    {globalQuote?.["01. symbol"]} quote loaded. Price: {price}. Change: {changes} ({changePercent || "—"}).
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <div className="bg-yellow-400 text-black p-3 rounded-xl inline-block">
                    Analyze AAPL
                  </div>
                </div>

                <div>
                  <div className="bg-zinc-800 p-4 rounded-xl inline-block max-w-2xl">
                    Run an analysis to fetch live quote data from AlphaVantage.
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <input
              placeholder="Ask AI anything..."
              className="flex-1 bg-black border border-zinc-700 rounded-xl px-4 py-4"
              disabled
            />

            <button className="bg-yellow-400 text-black px-8 rounded-xl font-bold" disabled>
              Send
            </button>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-zinc-900 p-8 rounded-3xl mb-10">
          <h2 className="text-3xl text-yellow-400 font-bold mb-6">
            Recent Reports
          </h2>

          <div className="space-y-3">
            <div className="bg-zinc-800 p-4 rounded-xl">📄 RELIANCE Research Report</div>
            <div className="bg-zinc-800 p-4 rounded-xl">📄 HDFC Risk Analysis</div>
            <div className="bg-zinc-800 p-4 rounded-xl">📄 AI Sector Outlook 2026</div>
          </div>
        </div>

        {/* Latest News */}
        <div className="bg-zinc-900 p-8 rounded-3xl">
          <h2 className="text-3xl text-yellow-400 font-bold mb-6">
            Latest News
          </h2>

          <div className="space-y-4">
            <div className="bg-zinc-800 p-4 rounded-xl">NVIDIA reaches new all-time high.</div>
            <div className="bg-zinc-800 p-4 rounded-xl">Federal Reserve hints at rate cuts.</div>
            <div className="bg-zinc-800 p-4 rounded-xl">AI stocks continue strong rally.</div>
          </div>
        </div>
      </section>
    </main>
  );
}