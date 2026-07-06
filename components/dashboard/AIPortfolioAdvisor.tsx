"use client";

import React, { useMemo, useRef, useState } from "react";
import GlassCard from "@/components/ui/GlassCard";
import { Loader2, RefreshCw, RotateCcw, Sparkles } from "lucide-react";
import { usePortfolioData } from "@/components/dashboard/PortfolioDataContext";


type RiskLevel = "Low" | "Medium" | "High";

type PortfolioAdvisorHolding = {
  symbol?: string;
  quantity?: number;
  averagePrice?: number;
  currentPrice?: number;
  totalValue?: number;
  allocationPct?: number;
  riskContribution?: number;
};

type PortfolioAdvisorData = {
  totalValue?: number;
  holdingsCount?: number;
  todayPnLPercent?: number;
  holdings?: PortfolioAdvisorHolding[];
  allocation?: { holdingsPct?: number; watchPct?: number };
};

type AiPortfolioResponse = {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  risk: RiskLevel;
  score: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function riskTone(risk: RiskLevel) {
  switch (risk) {
    case "Low":
      return "text-emerald-300 bg-emerald-500/10 border-emerald-400/30";
    case "High":
      return "text-red-300 bg-red-500/10 border-red-400/30";
    default:
      return "text-yellow-300 bg-yellow-300/10 border-yellow-400/30";
  }
}

function scoreTone(score: number) {
  if (score >= 75) return "text-emerald-400";
  if (score >= 55) return "text-[#FACC15]";
  return "text-red-400";
}

function buildPrompt(portfolio: PortfolioAdvisorData) {
  const holdings = Array.isArray(portfolio.holdings) ? portfolio.holdings : [];

  const normalizedHoldings = holdings.map((h) => ({
    symbol: h.symbol || "—",
    quantity: h.quantity ?? null,
    averagePrice: undefined,
    currentPrice: undefined,
    // PortfolioEnrichedHolding does not provide per-holding allocation% or totalValue.
    totalValue: null,
    portfolioAllocationPct: null,
  }));


  const portfolioAllocation = portfolio.allocation ?? {};
  const riskMetrics = {} as Record<string, unknown>;



  // Ask for JSON only, as required.
  return {
    messages: [
      {
        role: "user",
        content:
          "You are MarketMind AI Portfolio Advisor. Analyze the user's portfolio and respond with JSON ONLY. " +
          "Return this exact schema: { \"summary\": string, \"strengths\": string[], \"weaknesses\": string[], \"recommendations\": string[], \"risk\": \"Low\"|\"Medium\"|\"High\", \"score\": number }. " +
          "Do not wrap in markdown. Do not include any extra keys. \n\n" +
          "Portfolio data (may include nulls if current prices are unavailable):\n" +
          JSON.stringify(
            {
              holdings: normalizedHoldings,
              totalValue: portfolio.totalValue ?? null,
              portfolioAllocation: portfolioAllocation,
              riskMetrics: riskMetrics,
              todayPnLPercent: portfolio.todayPnLPercent ?? null,
              holdingsCount: portfolio.holdingsCount ?? null,
            },
            null,
            2
          ) +
          "\n\nInclude: strengths, weaknesses, and concrete recommendations. Score 0-100 based on diversification and risk-adjusted quality." ,
      },
    ],
  };
}

function parseAiResponse(text: string): AiPortfolioResponse | null {
  try {
    const parsed = JSON.parse(text) as AiPortfolioResponse;
    if (!parsed || typeof parsed !== "object") return null;

    const risk = parsed.risk;
    const score = parsed.score;

    if (
      typeof parsed.summary !== "string" ||
      !Array.isArray(parsed.strengths) ||
      !Array.isArray(parsed.weaknesses) ||
      !Array.isArray(parsed.recommendations) ||
      (risk !== "Low" && risk !== "Medium" && risk !== "High") ||
      typeof score !== "number"
    ) {
      return null;
    }

    return {
      summary: parsed.summary,
      strengths: parsed.strengths.map((s) => String(s)),
      weaknesses: parsed.weaknesses.map((s) => String(s)),
      recommendations: parsed.recommendations.map((s) => String(s)),
      risk,
      score: clamp(Math.round(parsed.score), 0, 100),
    };
  } catch {
    return null;
  }
}

export default function AIPortfolioAdvisor() {
  const { data } = usePortfolioData();

  const portfolio = useMemo(
    () => data ?? ({ holdings: [], holdingsCount: 0 } as unknown as PortfolioAdvisorData),
    [data]
  );


  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const cacheKey = "marketmind_ai_portfolio";
  const attemptedRef = useRef(false);

  const portfolioSignature = useMemo(() => {
    const holdings = Array.isArray(portfolio.holdings) ? portfolio.holdings : [];


    const simplified = holdings
      .map((h: PortfolioAdvisorHolding) => ({
        symbol: h.symbol || "—",
        quantity: h.quantity ?? null,
        averagePrice: undefined,
        currentPrice: undefined,

        totalValue: null,
        portfolioAllocationPct: null,
      }))
      .sort((a: { symbol: string }, b: { symbol: string }) => String(a.symbol).localeCompare(String(b.symbol)));

    return JSON.stringify({
      totalValue: null,
      holdingsCount: portfolio.holdingsCount ?? null,
      todayPnLPercent: null,
      allocation: portfolio.allocation ?? null,
      
      riskMetrics: null,

      holdings: simplified,
    });
  }, [portfolio]);

  const signatureHash = useMemo(() => {
    let hash = 0;
    const s = portfolioSignature;
    for (let i = 0; i < s.length; i += 1) {
      hash = (hash * 31 + s.charCodeAt(i)) % 1_000_000_007;
    }
    return String(hash);
  }, [portfolioSignature]);

  const initialData = useMemo<AiPortfolioResponse | null>(() => {
    try {
      const raw = sessionStorage.getItem(cacheKey);
      if (!raw) return null;
      const parsed: { signature?: string; value?: AiPortfolioResponse } = JSON.parse(raw);
      if (parsed?.signature && parsed.signature === signatureHash && parsed.value) {
        return parsed.value;
      }
    } catch {
      // ignore cache errors
    }
    return null;
  }, [cacheKey, signatureHash]);

  // Renamed state variable (React state ONLY): data -> analysis
  const [analysis, setAnalysis] = useState<AiPortfolioResponse | null>(initialData);


  const callGemini = async () => {
    setError(null);
    setAnalyzing(true);

    try {
      const prompt = buildPrompt(portfolio);

      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prompt),
      });

      const json = await res.json();

      if (!res.ok || json?.error) {
        throw new Error(json?.error || "Unable to analyze portfolio");
      }

      const replyText = typeof json?.reply === "string" ? json.reply.trim() : "";
      const parsed = parseAiResponse(replyText);

      if (!parsed) {
        throw new Error("AI service returned invalid JSON");
      }

      setAnalysis(parsed);

      try {
        sessionStorage.setItem(
          cacheKey,
          JSON.stringify({
            signature: signatureHash,
            value: parsed,
          })
        );
      } catch {
        // ignore storage issues
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to analyze portfolio.");
      setAnalysis(null);
    } finally {
      setAnalyzing(false);
    }
  };

  const analyzePortfolio = async () => {
    if (attemptedRef.current) return;
    attemptedRef.current = true;
    await callGemini();
  };

  const refresh = async () => {
    await callGemini();
  };

  return (
    <GlassCard className="p-5 rounded-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-yellow-400/10 border border-yellow-400/30 text-yellow-300">
              <Sparkles size={16} />
            </span>
            <div>
              <div className="text-sm font-semibold">🤖 AI Portfolio Advisor</div>
              <div className="text-[11px] text-zinc-500 mt-0.5">Portfolio insights generated on demand</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refresh}
            disabled={analyzing}
            className="rounded-xl border border-zinc-800 bg-black/20 p-2 text-zinc-200 hover:border-yellow-400/40 disabled:opacity-60"
            aria-label="Refresh AI analysis"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={analyzePortfolio}
            disabled={analyzing || !!analysis}
            className="rounded-2xl bg-yellow-400 text-black px-4 py-2 font-bold text-sm transition hover:bg-yellow-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {analyzing ? "Analyzing..." : analysis ? "Analyzed" : "Analyze Portfolio"}
          </button>

          {error ? (
            <button
              type="button"
              onClick={analyzePortfolio}
              disabled={analyzing}
              className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-2 font-bold text-sm text-red-300 hover:border-red-400/50 disabled:opacity-60"
            >
              <span className="inline-flex items-center gap-2">
                <RotateCcw size={16} /> Retry
              </span>
            </button>
          ) : null}
        </div>

        <div className="text-right">
          <div className="text-[11px] text-zinc-500">Overall AI Score</div>
          <div className="mt-1 flex items-center justify-end gap-3">
            {analyzing && !analysis ? (
              <div className="inline-flex items-center gap-2 text-zinc-300">
                <Loader2 className="animate-spin" size={16} />
                <span className="text-sm font-bold">Calculating…</span>
              </div>
            ) : (
              <div
                className={`text-3xl font-extrabold tabular-nums ${scoreTone(
                  analysis?.score ?? 0
                )}`}
              >
                {typeof analysis?.score === "number" ? analysis.score : "—"}
              </div>
            )}
          </div>
          <div className="mt-1 text-[11px] text-zinc-500">AI-generated insights. Not financial advice.</div>
        </div>
      </div>

      <div className="mt-4">
        {analyzing && !analysis ? (
          <div className="space-y-3">
            <div className="rounded-xl border border-zinc-800/70 bg-black/20 p-4">
              <div className="h-5 w-56 rounded-lg bg-white/5 animate-[skeleton-shimmer_1.3s_ease-in-out_infinite]" />
              <div className="mt-3 h-4 w-full rounded-lg bg-white/5 animate-[skeleton-shimmer_1.3s_ease-in-out_infinite]" />
              <div className="mt-2 h-4 w-4/5 rounded-lg bg-white/5 animate-[skeleton-shimmer_1.3s_ease-in-out_infinite]" />
            </div>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
            Unable to analyze portfolio.
          </div>
        ) : analysis ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-zinc-800/70 bg-black/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] text-zinc-500">Portfolio Summary</div>
                  <div className="mt-1 text-sm leading-relaxed text-white">{analysis.summary}</div>
                </div>

                <div>
                  <div className="text-[11px] text-zinc-500">Risk</div>
                  <div
                    className={`mt-1 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${riskTone(
                      analysis.risk
                    )}`}
                  >
                    {analysis.risk}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-zinc-800/70 bg-black/20 p-4">
                <div className="text-[11px] text-zinc-500">Strengths</div>
                <ul className="mt-2 space-y-2">
                  {analysis.strengths.slice(0, 5).map((s: string, idx: number) => (
                    <li key={idx} className="text-sm text-white/90">
                      • {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-zinc-800/70 bg-black/20 p-4">
                <div className="text-[11px] text-zinc-500">Weaknesses</div>
                <ul className="mt-2 space-y-2">
                  {analysis.weaknesses.slice(0, 5).map((s: string, idx: number) => (
                    <li key={idx} className="text-sm text-white/90">
                      • {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800/70 bg-black/20 p-4">
              <div className="text-[11px] text-zinc-500">Recommendations</div>
              <ul className="mt-2 space-y-2">
                {analysis.recommendations.slice(0, 6).map((s: string, idx: number) => (
                  <li key={idx} className="text-sm text-white/90">
                    • {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-800/70 bg-black/20 p-4">
            <div className="text-[11px] text-zinc-500">Portfolio Summary</div>
            <div className="mt-2 text-sm text-zinc-300">Click “Analyze Portfolio” to generate insights.</div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

