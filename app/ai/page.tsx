"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, User, RotateCcw, Send } from "lucide-react";

import TradingTerminalChart from "@/components/dashboard/TradingTerminalChart";
import { ChartStateProvider } from "@/components/dashboard/ChartStateContext";

import SkeletonSection from "@/components/dashboard/SkeletonSection";
import NewsCardList, { type NewsArticle } from "@/components/dashboard/NewsCardList";
import AiResearchResultCards, {
  type AiResearchStructuredResult,
} from "@/components/dashboard/AiResearchResultCards";

type MarketDetails = {
  symbol: string;
  currency?: string;
  name?: string;

  price: number;
  dailyChange: number;
  dailyChangePercent: number;
  volume: number;

  week52High: number;
  week52Low: number;

  marketCap: number;
  peRatio: number | null;
  eps: number | null;
  beta: number | null;

  sector: string | null;
  industry: string | null;
};

function formatNumber(v: number | null | undefined) {
  if (v == null || !Number.isFinite(v)) return "—";
  return v.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

function formatMoney(v: number | null | undefined) {
  if (v == null || !Number.isFinite(v)) return "—";
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(v);
}

function normalizeNewsImpactSentiment(articles: unknown[]): NewsArticle[] {
  return (Array.isArray(articles) ? articles : []).map((a) => {
    const item = a as Record<string, unknown>;
    return {
      source: (item?.source as NewsArticle["source"]) ?? undefined,
      publishedAt: typeof item?.publishedAt === "string" ? item.publishedAt : undefined,
      title: typeof item?.title === "string" ? item.title : undefined,
      url: typeof item?.url === "string" ? item.url : undefined,
    };
  });
}

function validateTicker(raw: string) {
  const s = raw.trim().toUpperCase();
  if (!s) return { ok: false as const, error: "Ticker is required" };
  if (!/^[A-Z0-9.-]{1,12}$/.test(s)) return { ok: false as const, error: "Invalid ticker" };
  return { ok: true as const, symbol: s };
}

type ChatMessage = { role: "user" | "ai"; text: string };

export default function AIPage() {
  const [symbolInput, setSymbolInput] = useState("AAPL");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [marketDetails, setMarketDetails] = useState<MarketDetails | null>(null);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState<string | null>(null);

  const [result, setResult] = useState<AiResearchStructuredResult | null>(null);
  const [reports, setReports] = useState<
    Array<{
      ticker: string;
      recommendation: string;
      confidence: number;
      risk: string;
      timestamp: string;
      summary: string;
    }>
  >([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState<string | null>(null);

  const [chatOpen] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "ai",
      text: "Ask about today’s movement, fundamentals (PE/EPS), technical levels, or risk factors. Your last analysis context is used automatically.",
    },
  ]);

  const lastContext = useMemo(() => {
    if (!marketDetails || !result) return null;
    return {
      marketDetails,
      news,
      technicalFromChart: null,
      aiResult: result,
    };
  }, [marketDetails, news, result]);

  useEffect(() => {
    let cancelled = false;
    async function loadReports() {
      setReportsLoading(true);
      setReportsError(null);
      try {
        const res = await fetch("/api/reports");
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok || data?.error) throw new Error(data?.error || "Failed to load reports");

        const items: unknown[] = Array.isArray(data?.items) ? data.items : [];
        const mapped = (items as Array<Record<string, unknown>>).map((it) => ({
          ticker: typeof it?.ticker === "string" ? it.ticker : "",
          recommendation: typeof it?.recommendation === "string" ? it.recommendation : "",
          confidence: typeof it?.confidence === "number" ? it.confidence : 0,
          risk: typeof it?.risk === "string" ? it.risk : "",
          timestamp: typeof it?.timestamp === "string" ? it.timestamp : "",
          summary: typeof it?.summary === "string" ? it.summary : "",
        }));

        setReports(mapped.filter((m) => m.ticker));
      } catch (e: unknown) {
        if (cancelled) return;
        setReportsError(e instanceof Error ? e.message : "Failed to load reports");
      } finally {
        if (!cancelled) setReportsLoading(false);
      }
    }

    void loadReports();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadNews = async (sym: string) => {
    setNewsLoading(true);
    setNewsError(null);
    try {
      const res = await fetch("/api/news");
      const data = await res.json();
      if (!res.ok || data?.error) throw new Error(data?.error || "Failed to load news");

      const articles =
        Array.isArray(data?.articles) ? data.articles : Array.isArray(data) ? data : [];

      setNews(normalizeNewsImpactSentiment(articles).slice(0, 8));
      if (!articles || articles.length === 0) setNews([]);
    } catch (e: unknown) {
      setNewsError(e instanceof Error ? e.message : "Failed to load news");
      setNews([]);
    } finally {
      setNewsLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (analyzing) return;

    const validation = validateTicker(symbolInput);
    if (!validation.ok) {
      setAnalysisError(validation.error);
      return;
    }

    setAnalysisError(null);

    const sym = validation.symbol;
    void sym;




    setResult(null);
    setMarketDetails(null);
    setNews([]);
    setNewsError(null);

    setAnalyzing(true);
    try {
      const mdRes = await fetch(`/api/market-details?symbol=${encodeURIComponent(sym)}`);
      const mdData = await mdRes.json();
      if (!mdRes.ok || mdData?.error) throw new Error(mdData?.error || "Failed to load market details");
      setMarketDetails(mdData as MarketDetails);

      await loadNews(sym);

      const aiRes = await fetch("/api/ai-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: sym }),
      });
      const aiData = await aiRes.json();

      if (!aiRes.ok || aiData?.error) throw new Error(aiData?.error || "AI analysis failed");

      setResult(aiData?.result as AiResearchStructuredResult);

      const repRes = await fetch("/api/reports");
      const repData = await repRes.json();
      if (repRes.ok && !repData?.error && Array.isArray(repData?.items)) {
        setReports(
          repData.items.map((it: unknown) => {
            const item = it as Record<string, unknown>;
            return {
              ticker: typeof item?.ticker === "string" ? item.ticker : "",
              recommendation: typeof item?.recommendation === "string" ? item.recommendation : "",
              confidence: typeof item?.confidence === "number" ? item.confidence : 0,
              risk: typeof item?.risk === "string" ? item.risk : "",
              timestamp: typeof item?.timestamp === "string" ? item.timestamp : "",
              summary: typeof item?.summary === "string" ? item.summary : "",
            };
          })
        );
      }
    } catch (e: unknown) {
      setAnalysisError(e instanceof Error ? e.message : "Analyze failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const sendChat = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || chatLoading) return;

    setChatError(null);
    setChatLoading(true);

    const userMsg: ChatMessage = { role: "user", text: trimmed };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");

    try {
      const contextText = lastContext
        ? `Context:\nMARKET_DETAILS: ${JSON.stringify(lastContext.marketDetails)}\nNEWS: ${JSON.stringify(lastContext.news)}\nAI_RESULT: ${JSON.stringify(lastContext.aiResult)}\n`
        : `Context: no analysis context available yet. Ask for a new analysis first.`;

      const apiMessages = [
        { role: "user", content: `${contextText}\nUser question: ${trimmed}` },
      ];

      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await res.json();
      if (!res.ok || data?.error) throw new Error(data?.error || "AI chat failed");

      const reply = String(data?.reply || "").trim();
      if (!reply) throw new Error("AI returned empty reply");

      setChatMessages((prev) => [...prev, { role: "ai", text: reply }]);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setChatError(message || "AI chat error");
      setChatMessages((prev) => [
        ...prev,
        { role: "ai", text: `Couldn't reach MarketMind AI.\n${message || "Unknown error"}` },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,#facc15,transparent_35%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_right,#9333ea,transparent_35%)]"></div>
      </div>

      <section className="flex-1 p-8 relative z-10 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-bold text-yellow-400">AI Research Center</h1>
            <p className="text-zinc-400 mt-2">Market details + live news + AI structured research.</p>
          </div>
          <div className="flex gap-5">
            <Bell />
            <User />
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <input
            type="text"
            value={symbolInput}
            onChange={(e) => setSymbolInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleAnalyze();
            }}
            placeholder="Enter Stock Symbol (AAPL, TSLA, RELIANCE)"
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-4 outline-none focus:border-yellow-400/50"
            disabled={analyzing}
          />

          <button
            onClick={() => void handleAnalyze()}
            disabled={analyzing}
            className="bg-yellow-400 text-black font-bold px-8 rounded-xl disabled:opacity-60 inline-flex items-center justify-center gap-2"
            aria-disabled={analyzing}
          >
            {analyzing ? (
              <>
                <span className="h-2.5 w-2.5 rounded-full bg-black animate-pulse" />
                Analyzing…
              </>
            ) : (
              <>Analyze</>
            )}
          </button>
        </div>

        {analysisError ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {analysisError}
          </div>
        ) : null}

        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800/70">
            <p className="text-zinc-400 text-xs">Current Price</p>
            <h2 className="text-3xl text-green-400 font-bold mt-1">{formatMoney(marketDetails?.price)}</h2>
            <p className="text-zinc-500 mt-1 text-xs">{marketDetails?.name || "—"}</p>
          </div>
          <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800/70">
            <p className="text-zinc-400 text-xs">Daily Change</p>
            <h2
              className={`text-3xl font-bold mt-1 ${
                marketDetails?.dailyChange != null && marketDetails.dailyChange >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {marketDetails?.dailyChange != null
                ? `${marketDetails.dailyChange >= 0 ? "+" : ""}${marketDetails.dailyChange}`
                : "—"}
            </h2>
            <p className="text-zinc-500 mt-1 text-xs">
              {marketDetails?.dailyChangePercent != null
                ? `${marketDetails.dailyChangePercent >= 0 ? "+" : ""}${marketDetails.dailyChangePercent}%`
                : "—"}
            </p>
          </div>
          <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800/70">
            <p className="text-zinc-400 text-xs">Market Cap</p>
            <h2 className="text-3xl text-yellow-400 font-bold mt-1">{formatNumber(marketDetails?.marketCap)}</h2>
            <p className="text-zinc-500 mt-1 text-xs">
              52W: {formatNumber(marketDetails?.week52Low)} - {formatNumber(marketDetails?.week52High)}
            </p>
          </div>
          <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800/70">
            <p className="text-zinc-400 text-xs">Volume</p>
            <h2 className="text-3xl font-bold mt-1">{formatNumber(marketDetails?.volume)}</h2>
            <p className="text-zinc-500 mt-1 text-xs">Sector: {marketDetails?.sector || "—"}</p>
          </div>
        </div>

        {analyzing && !marketDetails ? (
          <SkeletonSection title="Loading market metrics" subtitle="Fetching /api/market-details…" />
        ) : null}

        {marketDetails ? (
          <div className="grid md:grid-cols-6 gap-4">
            <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800/70">
              <p className="text-zinc-400 text-xs">PE Ratio</p>
              <h3 className="text-xl font-bold mt-1">
                {marketDetails.peRatio == null ? "—" : formatNumber(marketDetails.peRatio)}
              </h3>
            </div>
            <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800/70">
              <p className="text-zinc-400 text-xs">EPS</p>
              <h3 className="text-xl font-bold mt-1">
                {marketDetails.eps == null ? "—" : formatNumber(marketDetails.eps)}
              </h3>
            </div>
            <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800/70">
              <p className="text-zinc-400 text-xs">Beta</p>
              <h3 className="text-xl font-bold mt-1">
                {marketDetails.beta == null ? "—" : formatNumber(marketDetails.beta)}
              </h3>
            </div>
            <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800/70 md:col-span-3">
              <p className="text-zinc-400 text-xs">Industry</p>
              <h3 className="text-xl font-bold mt-1">{marketDetails.industry || "—"}</h3>
            </div>
          </div>
        ) : null}

        <div className="rounded-3xl overflow-hidden">
          <ChartStateProvider initialSymbol={symbolInput.trim().toUpperCase() || "SPY"}>
            <TradingTerminalChart />
          </ChartStateProvider>
        </div>

        <NewsCardList
          loading={newsLoading}
          error={newsError}
          items={news}
          onRetry={() => void loadNews(symbolInput.trim().toUpperCase())}
        />

        {analyzing ? null : result ? (
          <AiResearchResultCards result={result} />
        ) : (
          <section className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800/70">
            <div className="text-sm font-bold text-yellow-400">No analysis yet</div>
            <div className="text-zinc-400 mt-2">Run Analyze to generate structured premium cards.</div>
          </section>
        )}

        <section className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800/70">
          <h2 className="text-2xl text-yellow-400 font-bold mb-2">Recent Reports</h2>
          {reportsLoading ? (
            <div className="space-y-2 mt-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 rounded-xl bg-zinc-800 animate-pulse" />
              ))}
            </div>
          ) : reportsError ? (
            <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-200 text-sm">
              {reportsError}
              <div className="mt-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold"
                  onClick={() => window.location.reload()}
                >
                  <RotateCcw size={14} /> Retry
                </button>
              </div>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-zinc-500 mt-4 text-sm">No reports saved yet.</div>
          ) : (
            <div className="space-y-3 mt-4">
              {reports.map((r, idx) => (
                <div key={idx} className="bg-zinc-800 p-4 rounded-xl border border-zinc-700/60">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-bold text-white/95">📄 {r.ticker} Research Report</div>
                    <div className="text-sm text-yellow-300 font-bold">{r.recommendation}</div>
                  </div>
                  <div className="text-xs text-zinc-400 mt-2">{r.summary}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800/70">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">🤖 MarketMind AI Copilot</h2>

          {chatError ? (
            <div className="mb-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-200 text-sm">
              {chatError}
            </div>
          ) : null}

          <div className="h-80 overflow-y-auto bg-black rounded-2xl p-5 space-y-3">
            {chatMessages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[85%] rounded-xl bg-yellow-400/15 border border-yellow-400/30 px-3 py-2 text-sm text-white"
                      : "max-w-[85%] rounded-xl bg-black/30 border border-zinc-800 px-3 py-2 text-sm text-zinc-200"
                  }
                >
                  {m.text}
                </div>
              </div>
            ))}
            {chatLoading ? <div className="text-xs text-zinc-400">Thinking…</div> : null}
          </div>

          <form
            className="flex gap-3 mt-4"
            onSubmit={(e) => {
              e.preventDefault();
              void sendChat(chatInput);
            }}
          >
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Explain today's movement, compare with Microsoft, why PE high, should I buy…"
              className="flex-1 bg-black border border-zinc-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-yellow-400/50"
              disabled={chatLoading || !chatOpen}
            />
            <button
              type="submit"
              disabled={chatLoading || !chatOpen}
              className="bg-yellow-400 text-black px-5 rounded-xl font-bold disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >
              <Send size={16} />
              Send
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}

