"use client";

import React, { useEffect, useMemo, useState } from "react";
import GlassCard from "@/components/ui/GlassCard";
import { RotateCcw, RefreshCw } from "lucide-react";
import { SkeletonBlock } from "@/components/ui/Skeleton";
import type { NewsSentiment } from "./NewsSentimentBadge";

type NewsItem = {
  title?: string;
  source?: {
    name?: string;
  };
  publishedAt?: string;
};

type AiNewsResponse = {
  summary: string;
  sentiment: "Bullish" | "Neutral" | "Bearish";
  topEvent: string;
  sector: string;
  risks: string[];
  opportunities: string[];
};

type Props = {
  items: NewsItem[];
};

const CACHE_KEY = "marketmind_news_ai";

function clampList<T>(arr: T[], max: number) {
  if (!Array.isArray(arr)) return [];
  return arr.slice(0, max);
}

function safeParse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function buildPrompt(items: NewsItem[]) {
  const top = items.slice(0, 10).map((n) => ({
    title: n.title || "",
    source: n.source?.name || "Unknown",
    publishedAt: n.publishedAt || null,
  }));

  return {
    messages: [
      {
        role: "user",
        content:
          "You are MarketMind AI News Intelligence. Summarize today's news. " +
          "Return JSON ONLY with this exact format: {\n" +
          ' "summary":"...",\n' +
          ' "sentiment":"Bullish"|"Neutral"|"Bearish",\n' +
          ' "topEvent":"...",\n' +
          ' "sector":"...",\n' +
          ' "risks":[...],\n' +
          ' "opportunities":[...]\n' +
          "}. Do not wrap in markdown. No extra keys.\n\n" +
          `News items:\n${JSON.stringify(top, null, 2)}`,
      },
    ],
  };
}

function parseAiNewsResponse(rawReply: unknown): AiNewsResponse | null {
  if (!rawReply || typeof rawReply !== "object") return null;
  const obj = rawReply as Partial<AiNewsResponse> & Record<string, unknown>;

  const sentiment = obj.sentiment;
  const okSentiment = sentiment === "Bullish" || sentiment === "Neutral" || sentiment === "Bearish";

  if (typeof obj.summary !== "string") return null;
  if (typeof obj.topEvent !== "string") return null;
  if (typeof obj.sector !== "string") return null;
  if (!okSentiment) return null;
  if (!Array.isArray(obj.risks) || obj.risks.some((r) => typeof r !== "string")) return null;
  if (!Array.isArray(obj.opportunities) || obj.opportunities.some((o) => typeof o !== "string")) return null;

  return {
    summary: obj.summary,
    sentiment: sentiment as AiNewsResponse["sentiment"],
    topEvent: obj.topEvent,
    sector: obj.sector,
    risks: obj.risks as string[],
    opportunities: obj.opportunities as string[],
  };
}

function tone(sentiment: NewsSentiment) {
  switch (sentiment) {
    case "Bullish":
      return {
        dot: "bg-emerald-400",
        badgeCls: "text-emerald-300 bg-emerald-500/10 border-emerald-400/30",
      };
    case "Bearish":
      return {
        dot: "bg-red-400",
        badgeCls: "text-red-300 bg-red-500/10 border-red-400/30",
      };
    case "Neutral":
    default:
      return {
        dot: "bg-yellow-300",
        badgeCls: "text-yellow-200 bg-yellow-400/10 border-yellow-400/30",
      };
  }
}

export default function AINewsInsights({ items }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AiNewsResponse | null>(null);
  const [tick, setTick] = useState(0);

  const digest = useMemo(() => {
    // small signature so cache invalidates when the list changes
    const t = items
      .slice(0, 10)
      .map((n) => `${n.title || ""}::${n.source?.name || ""}`)
      .join("|");
    let h = 0;
    for (let i = 0; i < t.length; i += 1) h = (h * 33 + t.charCodeAt(i)) % 1_000_000_007;
    return String(h);
  }, [items]);

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      setError(null);

      try {
        const raw = sessionStorage.getItem(CACHE_KEY);
        if (raw) {
          const parsed = safeParse<{ signature?: string; value?: AiNewsResponse }>(raw);
          if (parsed?.signature === digest && parsed?.value) {
            if (!cancelled) setData(parsed.value);
            return;
          }
        }
      } catch {
        // ignore
      }

      setLoading(true);
      try {
        const res = await fetch("/api/news");
        const news = Array.isArray(res?.ok ? await res.json() : []) ? await res.json() : [];
        // Ensure we have items; prefer prop items if provided.
        const useItems = Array.isArray(items) && items.length ? items : news;

        const prompt = buildPrompt(useItems);

        const ai = await fetch("/api/ai-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(prompt),
        });

        const json = await ai.json();
        if (!ai.ok || json?.error) throw new Error(json?.error || "Unable to generate AI insights");

        const replyText = typeof json?.reply === "string" ? json.reply.trim() : "";
        const parsed = safeParse<unknown>(replyText);
        const final = parseAiNewsResponse(parsed);

        if (!final) throw new Error("Invalid AI JSON response");
        if (!cancelled) {
          setData(final);
          try {
            sessionStorage.setItem(
              CACHE_KEY,
              JSON.stringify({ signature: digest, value: final })
            );
          } catch {
            // ignore
          }
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Unable to analyze news");
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void boot();
    return () => {
      cancelled = true;
    };
  }, [digest, tick, items]);

  const onRetry = () => {
    setTick((t) => t + 1);
  };

  const onRefresh = () => {
    try {
      sessionStorage.removeItem(CACHE_KEY);
    } catch {
      // ignore
    }
    setTick((t) => t + 1);
  };

  const s = data?.sentiment;
  const st = s ? tone(s) : null;

  return (
    <GlassCard className="p-5 sm:p-6 transition-all duration-300 hover:border-[#FACC15]/45 rounded-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-yellow-400/10 border border-yellow-400/30 text-yellow-300">
              🧠
            </span>
            <h2 className="text-base sm:text-lg font-semibold">AI News Intelligence</h2>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Market snapshot generated from today&apos;s headlines</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="rounded-xl border border-zinc-800 bg-black/20 px-3 py-2 text-xs font-bold text-white/90 hover:text-white hover:border-yellow-400/40 disabled:opacity-60"
          >
            <RefreshCw size={16} />
            <span className="ml-2 hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      <div className="mt-4">
        {loading && !data ? (
          <div className="space-y-4">
            <SkeletonBlock className="h-6 w-56" />
            <SkeletonBlock className="h-20 w-full" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SkeletonBlock className="h-24 w-full" />
              <SkeletonBlock className="h-24 w-full" />
            </div>
          </div>
        ) : error && !data ? (
          <div className="space-y-3">
            <div className="text-sm text-red-300 font-semibold">Unable to analyze news.</div>
            <button
              type="button"
              onClick={onRetry}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 text-black px-4 py-2 font-bold disabled:opacity-60"
            >
              <RotateCcw size={16} />
              Retry
            </button>
          </div>
        ) : data ? (
          <div className="space-y-4">
            <div className="text-zinc-200 text-sm sm:text-[15px] leading-relaxed">{data.summary}</div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-[180px]">
                <div className="text-xs text-zinc-500 font-medium">Market Sentiment</div>
                <div
                  className={`mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs sm:text-sm font-bold ${st?.badgeCls ?? "bg-black/20 border-zinc-800 text-white"}`}
                >
                  <span className={`size-2.5 rounded-full ${st?.dot ?? "bg-zinc-400"}`} />
                  {data.sentiment}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="rounded-xl border border-zinc-800/70 bg-black/20 px-4 py-3">
                  <div className="text-xs text-zinc-500 font-medium">Most Important Event</div>
                  <div className="mt-1 text-sm font-semibold text-white/95">{data.topEvent}</div>
                </div>
                <div className="rounded-xl border border-zinc-800/70 bg-black/20 px-4 py-3">
                  <div className="text-xs text-zinc-500 font-medium">Sector Most Affected</div>
                  <div className="mt-1 text-sm font-semibold text-white/95">{data.sector}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-zinc-800/70 bg-black/20 p-4">
                <div className="text-xs text-zinc-500 font-medium">Top 3 Risks</div>
                <ul className="mt-3 space-y-2">
                  {clampList(data.risks, 3).map((r, i) => (
                    <li key={i} className="text-sm text-zinc-200 flex gap-2">
                      <span className="text-red-300">•</span>
                      <span className="leading-relaxed">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-zinc-800/70 bg-black/20 p-4">
                <div className="text-xs text-zinc-500 font-medium">Top 3 Opportunities</div>
                <ul className="mt-3 space-y-2">
                  {clampList(data.opportunities, 3).map((o, i) => (
                    <li key={i} className="text-sm text-zinc-200 flex gap-2">
                      <span className="text-emerald-300">•</span>
                      <span className="leading-relaxed">{o}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-xs text-zinc-500 border-t border-zinc-800/60 pt-3">
              AI-generated insights. Not financial advice.
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <SkeletonBlock className="h-20 w-full" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        {error && (
          <button
            type="button"
            onClick={onRetry}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 text-black px-4 py-2 font-bold disabled:opacity-60"
          >
            <RotateCcw size={16} /> Retry
          </button>
        )}
      </div>
    </GlassCard>
  );
}

