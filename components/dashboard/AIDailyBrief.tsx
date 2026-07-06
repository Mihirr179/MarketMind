"use client";

import React, { useEffect, useMemo, useState } from "react";
import { RefreshCw, RotateCw } from "lucide-react";

import GlassCard from "@/components/ui/GlassCard";
import { SkeletonBlock } from "@/components/ui/Skeleton";

type BriefSentiment = "Bullish" | "Neutral" | "Bearish";

type DailyBriefPayload = {
  summary: string;
  sentiment: BriefSentiment;
  drivers: string[];
  watch: string[];
  risk: "Low" | "Medium" | "High";
};

const CACHE_KEY = "marketmind_daily_brief";

function todayLabel(d: Date) {
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function sentimentTone(sentiment: BriefSentiment) {
  switch (sentiment) {
    case "Bullish":
      return {
        badgeText: "text-emerald-400",
        badgeBg: "bg-emerald-400/10",
        badgeBorder: "border-emerald-400/30",
        dot: "bg-emerald-400",
      };
    case "Bearish":
      return {
        badgeText: "text-red-400",
        badgeBg: "bg-red-500/10",
        badgeBorder: "border-red-400/30",
        dot: "bg-red-400",
      };
    case "Neutral":
    default:
      return {
        badgeText: "text-yellow-300",
        badgeBg: "bg-yellow-400/10",
        badgeBorder: "border-yellow-400/30",
        dot: "bg-yellow-300",
      };
  }
}

function riskTone(risk: DailyBriefPayload["risk"]) {
  switch (risk) {
    case "Low":
      return {
        text: "text-emerald-400",
        bg: "bg-emerald-400/10",
        border: "border-emerald-400/30",
      };
    case "High":
      return {
        text: "text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-400/30",
      };
    case "Medium":
    default:
      return {
        text: "text-yellow-300",
        bg: "bg-yellow-400/10",
        border: "border-yellow-400/30",
      };
  }
}

function isValidBriefPayload(v: unknown): v is DailyBriefPayload {
  if (!v || typeof v !== "object") return false;
  const obj = v as DailyBriefPayload;
  if (typeof obj.summary !== "string") return false;
  if (obj.sentiment !== "Bullish" && obj.sentiment !== "Neutral" && obj.sentiment !== "Bearish") return false;
  if (!Array.isArray(obj.drivers) || obj.drivers.some((d) => typeof d !== "string")) return false;
  if (!Array.isArray(obj.watch) || obj.watch.some((w) => typeof w !== "string")) return false;
  if (obj.risk !== "Low" && obj.risk !== "Medium" && obj.risk !== "High") return false;
  return true;
}

async function generateBrief(): Promise<DailyBriefPayload> {
  const prompt =
    "Generate a concise professional market briefing for the morning. Maximum 250 words. Return only JSON with this exact format: {\n" +
    "  \"summary\":\"...\",\n" +
    "  \"sentiment\":\"Bullish\"|\"Neutral\"|\"Bearish\",\n" +
    "  \"drivers\":[\"...\",\"...\",\"...\"],\n" +
    "  \"watch\":[\"...\",\"...\",\"...\"],\n" +
    "  \"risk\":\"Low\"|\"Medium\"|\"High\"\n" +
    "}. Summary should be 3-5 lines when rendered.\n" +
    "Use current market context implicitly; do not mention that you are an AI.\n" +
    "No extra keys. No markdown.\n";

  const res = await fetch("/api/ai-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  const data: { reply?: string; error?: string } = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error || "Unable to generate Daily Brief");
  }

  const raw = data.reply || "";

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    const first = raw.indexOf("{");
    const last = raw.lastIndexOf("}");
    if (first >= 0 && last > first) {
      parsed = JSON.parse(raw.slice(first, last + 1));
    } else {
      throw new Error("Invalid AI response");
    }
  }

  if (!isValidBriefPayload(parsed)) {
    throw new Error("AI response missing required fields");
  }

  return parsed;
}

export default function AIDailyBrief() {
  const [brief, setBrief] = useState<DailyBriefPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const dateText = useMemo(() => todayLabel(new Date()), []);



  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      try {
        const raw = sessionStorage.getItem(CACHE_KEY);
        if (raw) {
          const parsed: unknown = JSON.parse(raw);
          if (isValidBriefPayload(parsed)) {
            setBrief(parsed);
            return;
          }
        }
      } catch {
        // ignore cache parse errors
      }

      setLoading(true);
      setError(null);

      try {
        const generated = await generateBrief();
        if (cancelled) return;
        setBrief(generated);
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(generated));
        } catch {
          // ignore storage errors
        }
      } catch {
        if (cancelled) return;
        setError("Unable to generate Daily Brief.");
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    };

    void boot();

    return () => {
      cancelled = true;
    };

  }, [refreshTick]);


  const onRefresh = async () => {
    if (loading) return;
    setRefreshTick((t) => t + 1);
    setError(null);

    try {
      sessionStorage.removeItem(CACHE_KEY);
    } catch {
      // ignore
    }
  };

  const sentiment = brief?.sentiment;
  const risk = brief?.risk;

  const sentimentStyles = sentiment ? sentimentTone(sentiment) : null;
  const riskStyles = risk ? riskTone(risk) : null;

  return (
    <GlassCard className="p-5 sm:p-6 transition-all duration-300 hover:border-[#FACC15]/45">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-yellow-400/10 border border-yellow-400/30 text-yellow-300">
              🧠
            </span>
            <h2 className="text-base sm:text-lg font-semibold">AI Daily Market Brief</h2>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-3">
          <div className="text-right">
Today&apos;s Date
            <div className="text-sm font-semibold text-white/90 mt-1 tabular-nums">{dateText}</div>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="rounded-xl border border-zinc-800 bg-black/20 px-3 py-2 text-xs sm:text-sm font-bold text-white/90 hover:text-white hover:border-yellow-400/40 disabled:opacity-60"
            aria-label="Refresh Daily Brief"
          >
            <span className="inline-flex items-center gap-2">
              {loading ? <RotateCw className="animate-spin" size={16} /> : <RefreshCw size={16} />}
              Refresh
            </span>
          </button>
        </div>
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="space-y-4">
            <SkeletonBlock className="h-20 w-full" />
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <SkeletonBlock className="h-10 w-56" />
              <SkeletonBlock className="h-10 w-40 sm:w-48" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <SkeletonBlock className="h-5 w-44" />
                <SkeletonBlock className="h-10 w-full" />
                <SkeletonBlock className="h-10 w-full" />
                <SkeletonBlock className="h-10 w-full" />
              </div>
              <div className="space-y-3">
                <SkeletonBlock className="h-5 w-52" />
                <SkeletonBlock className="h-10 w-full" />
                <SkeletonBlock className="h-10 w-full" />
                <SkeletonBlock className="h-10 w-full" />
              </div>
            </div>
            <SkeletonBlock className="h-8 w-64" />
          </div>
        ) : error ? (
          <div className="space-y-3">
            <div className="text-sm text-red-300 font-semibold">{error}</div>
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 text-black px-4 py-2 font-bold disabled:opacity-60"
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        ) : brief ? (
          <div className="space-y-4">
            <div className="text-zinc-200 text-sm sm:text-[15px] leading-relaxed">
              {brief.summary}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="text-xs text-zinc-500 font-medium">Market Sentiment</div>
                <div className="mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs sm:text-sm font-bold">
                  <span className={`size-2.5 rounded-full ${sentimentStyles?.dot ?? "bg-zinc-400"}`} />
                  <span className={`${sentimentStyles?.badgeText ?? "text-white"} ${sentimentStyles?.badgeBg ?? "bg-black/20"} `}>
                    <span className={`${sentimentStyles?.badgeBorder ? "" : ""}`} />
                    <span className="sr-only">Sentiment:</span>
                    {brief.sentiment}
                  </span>
                </div>
              </div>

              <div className="min-w-[180px]">
                <div className="text-xs text-zinc-500 font-medium">Risk Level</div>
                <div
                  className={`mt-2 inline-flex w-full items-center justify-between rounded-xl border px-3 py-2 text-sm font-bold ${
                    riskStyles?.text ?? "text-white"
                  } ${riskStyles?.bg ?? "bg-black/20"} ${riskStyles?.border ?? "border-zinc-800"}`}
                >
                  <span>{brief.risk}</span>
                  <span className="text-xs text-white/70">Today</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-zinc-800/70 bg-black/20 p-4">
                <div className="text-xs text-zinc-500 font-medium">Key Drivers</div>
                <ul className="mt-3 space-y-2">
                  {brief.drivers.slice(0, 5).map((d, i) => (
                    <li key={i} className="text-sm text-zinc-200 flex gap-2">
                      <span className="text-[#FACC15]">•</span>
                      <span className="leading-relaxed">{d}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-zinc-800/70 bg-black/20 p-4">
                <div className="text-xs text-zinc-500 font-medium">What To Watch Today</div>
                <ul className="mt-3 space-y-2">
                  {brief.watch.slice(0, 5).map((w, i) => (
                    <li key={i} className="text-sm text-zinc-200 flex gap-2">
                      <span className="text-[#FACC15]">•</span>
                      <span className="leading-relaxed">{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-xs text-zinc-500 border-t border-zinc-800/60 pt-3">
AI generated summary. Not financial advice.
            </div>

          </div>
        ) : (
          <div className="space-y-4">
            <SkeletonBlock className="h-20 w-full" />
            <SkeletonBlock className="h-32 w-full" />
          </div>
        )}
      </div>
    </GlassCard>
  );
}

