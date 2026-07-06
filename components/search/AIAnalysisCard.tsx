"use client";

import React, { useMemo, useState } from "react";


type Stock = {
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

type ParsedAI = {
  summary?: string;
  strengths?: string;
  risks?: string;
  technicalObservation?: string;
  shortTermOutlook?: string;
  longTermOutlook?: string;
  conclusion?: string;
};

function extractSection(text: string, heading: string) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(
    `\\b${escaped}\\b\\s*([\\s\\S]*?)(?=(\\n\\s*\\b(?:AI Summary|Strengths|Risks|Technical Observation|Short Term Outlook|Long Term Outlook|Conclusion|Summary)\\b\\b)|$)`,
    "i"
  );
  const match = text.match(re);
  return match?.[1]?.trim();
}

function parseAIReply(reply: string): ParsedAI {
  const r = reply.trim();

  // Best-effort parsing by headings. Gemini output may vary slightly.
  const parsed: ParsedAI = {
    summary: extractSection(r, "AI Summary") || extractSection(r, "Summary"),
    strengths: extractSection(r, "Strengths"),
    risks: extractSection(r, "Risks"),
    technicalObservation:
      extractSection(r, "Technical Observation") ||
      extractSection(r, "Technical"),
    shortTermOutlook: extractSection(r, "Short Term Outlook"),
    longTermOutlook: extractSection(r, "Long Term Outlook"),
    conclusion: extractSection(r, "Conclusion"),
  };

  // If nothing parsed, treat whole reply as summary.
  const hasAny =
    parsed.summary ||
    parsed.strengths ||
    parsed.risks ||
    parsed.technicalObservation ||
    parsed.shortTermOutlook ||
    parsed.longTermOutlook ||
    parsed.conclusion;

  if (!hasAny) parsed.summary = r;

  // Remove trailing Not financial advice if present (we still show it in conclusion).
  if (parsed.conclusion?.includes("Not financial advice.")) {
    // keep as-is
  }

  return parsed;
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-5 w-5 text-[#FACC15]"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label="loading"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="#FACC15"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

export default function AIAnalysisCard({ stock }: { stock: Stock }) {
  const symbol = useMemo(() => stock?.symbol?.toUpperCase?.() ?? "", [stock]);

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [cache, setCache] = useState<Record<string, { replyText: string; parsed: ParsedAI }>>(() => ({}));

  const [activeReply, setActiveReply] = useState<string | null>(null);
  const [activeParsed, setActiveParsed] = useState<ParsedAI | null>(null);

  // Clear current display when searched stock changes.
  // UseEffect would trigger setState-in-effect lint; instead do it during event handlers
  // and keep active content untouched unless user explicitly generates.




  const canUseCache = !!cache[symbol]?.replyText;

  const prompt = useMemo(() => {
    const changePercent = stock.changePercent ?? "—";
    const recommendation = stock.recommendation;
    const confidence = stock.confidence;

    return `Company Symbol: ${stock.symbol}\nCurrent Price: ${stock.price}\nOpen: ${stock.open ?? "—"}\nHigh: ${stock.high ?? "—"}\nLow: ${stock.low ?? "—"}\nPrevious Close: ${stock.previousClose ?? "—"}\nDaily Change %: ${changePercent}\nRecommendation: ${recommendation}\nConfidence: ${confidence}%\n\nGenerate a SHORT stock update in EXACTLY this format (no extra text, no markdown, no ##, no **):\n\nSummary:\n(2-3 sentences)\n\nStrengths:\n- Maximum 3 bullet points\n\nRisks:\n- Maximum 3 bullet points\n\nTechnical View:\n(2 sentences)\n\nShort-Term Outlook:\n(1 sentence)\n\nLong-Term Outlook:\n(1 sentence)\n\nDisclaimer:\nNot financial advice.`;
  }, [stock]);

  const handleGenerate = async () => {

    const currentSymbol = symbol;
    if (!currentSymbol) return;
    setError(null);

    if (cache[currentSymbol]?.replyText) {
      setActiveReply(cache[currentSymbol].replyText);
      setActiveParsed(cache[currentSymbol].parsed);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Analyze this stock:\n${prompt}`,
            },
          ],
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.reply) {
        throw new Error(data?.error || "AI service failed");
      }

      const replyText = String(data.reply ?? "").trim();
      const parsed = parseAIReply(replyText);

      setCache((prev) => ({
        ...prev,
        [currentSymbol]: { replyText, parsed },
      }));

      setActiveReply(replyText);
      setActiveParsed(parsed);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "AI analysis unavailable.");

      setActiveReply(null);
      setActiveParsed(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mb-10">
      <h3 className="text-2xl font-bold text-[#FACC15] mb-5">AI Stock Analysis</h3>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-7 sm:p-8 backdrop-blur">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="text-zinc-200/90 font-semibold">AI Research Report</div>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2 font-bold transition border focus:outline-none focus:ring-2 focus:ring-[#FACC15]/50 ${
              isLoading
                ? "bg-white/5 border-white/10 text-zinc-400 cursor-not-allowed"
                : "bg-[#FACC15] text-black hover:bg-yellow-300 border-[#FACC15]"
            }`}
          >
            {isLoading ? <Spinner /> : null}
            {isLoading ? "Generating..." : canUseCache ? "Regenerate" : "Generate"}
          </button>
        </div>

        {isLoading ? (
          <div className="mt-6 space-y-4 animate-[skeleton-shimmer_1.3s_ease-in-out_infinite">
            <div className="text-zinc-200/90 font-semibold">Generating AI Analysis...</div>

            <div className="rounded-xl border border-white/5 bg-black/10 p-5">
              <p className="text-zinc-300/90 text-sm">Summary</p>
              <div className="mt-3 space-y-2">
                <div className="h-4 w-11/12 rounded bg-white/10" />
                <div className="h-4 w-9/12 rounded bg-white/10" />
              </div>
            </div>

            <div className="space-y-4">
              {(["Strengths", "Risks", "Technical View"] as const).map((h) => (
                <div key={h} className="rounded-xl border border-white/5 bg-black/10 p-5">
                  <p className="text-zinc-300/90 text-sm">{h}</p>
                  <div className="mt-3 space-y-2">
                    <div className="h-4 w-10/12 rounded bg-white/10" />
                    <div className="h-4 w-9/12 rounded bg-white/10" />
                    <div className="h-4 w-8/12 rounded bg-white/10" />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(["Short-Term Outlook", "Long-Term Outlook"] as const).map((h) => (
                <div key={h} className="rounded-xl border border-white/5 bg-black/10 p-5">
                  <p className="text-zinc-300/90 text-sm">{h}</p>
                  <div className="mt-3 h-4 w-11/12 rounded bg-white/10" />
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-white/5 bg-black/10 p-5">
              <p className="text-zinc-300/90 text-sm">Disclaimer</p>
              <div className="mt-3 h-4 w-10/12 rounded bg-white/10" />
            </div>
          </div>
        ) : error ? (
          <div className="mt-5">
            <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-5">
              <p className="text-red-200 font-semibold">{error}</p>
              <p className="text-zinc-300/90 text-sm mt-2">
                Please try again.
              </p>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="bg-[#FACC15] text-black px-6 py-3 rounded-xl font-bold hover:bg-yellow-300 transition"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        ) : activeParsed ? (
          <div className="mt-5">
            <div className="space-y-6">
              <div className="rounded-xl border border-white/5 bg-black/10 p-5">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-zinc-200/90 text-sm font-semibold">Summary</p>
                </div>
                <p className="text-white/90 mt-3 whitespace-pre-wrap leading-relaxed">{activeParsed.summary ?? "—"}</p>
              </div>

              <div className="h-px bg-white/10" />

              <div className="rounded-xl border border-white/5 bg-black/10 p-5">
                <p className="text-zinc-200/90 text-sm font-semibold mb-3">Strengths</p>
                <p className="text-white/90 whitespace-pre-wrap leading-relaxed">{activeParsed.strengths ?? "—"}</p>
              </div>

              <div className="rounded-xl border border-white/5 bg-black/10 p-5">
                <p className="text-zinc-200/90 text-sm font-semibold mb-3">Risks</p>
                <p className="text-white/90 whitespace-pre-wrap leading-relaxed">{activeParsed.risks ?? "—"}</p>
              </div>

              <div className="h-px bg-white/10" />

              <div className="rounded-xl border border-white/5 bg-black/10 p-5">
                <p className="text-zinc-200/90 text-sm font-semibold mb-3">Technical View</p>
                <p className="text-white/90 whitespace-pre-wrap leading-relaxed">{activeParsed.technicalObservation ?? "—"}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-white/5 bg-black/10 p-5">
                  <p className="text-zinc-200/90 text-sm font-semibold mb-3">Short-Term Outlook</p>
                  <p className="text-white/90 whitespace-pre-wrap leading-relaxed">{activeParsed.shortTermOutlook ?? "—"}</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-black/10 p-5">
                  <p className="text-zinc-200/90 text-sm font-semibold mb-3">Long-Term Outlook</p>
                  <p className="text-white/90 whitespace-pre-wrap leading-relaxed">{activeParsed.longTermOutlook ?? "—"}</p>
                </div>
              </div>

              <div className="h-px bg-white/10" />

              <div className="rounded-xl border border-white/5 bg-black/10 p-5">
                <p className="text-zinc-200/90 text-sm font-semibold mb-3">Disclaimer</p>
                <p className="text-white/90 whitespace-pre-wrap leading-relaxed">{activeParsed.conclusion ?? activeReply ?? "—"}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-5">
            <p className="text-zinc-300 mt-2">
              Click <span className="text-[#FACC15] font-semibold">🤖 AI Analysis</span> to generate a report.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

