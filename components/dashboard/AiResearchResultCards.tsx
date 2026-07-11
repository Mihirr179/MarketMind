"use client";

import GlassCard from "@/components/ui/GlassCard";

type Recommendation = "BUY" | "HOLD" | "SELL";

export type AiResearchStructuredResult = {
  recommendation: Recommendation;
  confidencePercent: number;
  risk: string;
  technicalSummary: string;
  fundamentalSummary: string;
  positiveSignals: string[];
  negativeSignals: string[];
  catalysts: string[];
  risks: string[];
  investmentHorizon: string;
  supportLevels: string[];
  resistanceLevels: string[];
};

function recommendationTone(r: Recommendation) {
  switch (r) {
    case "BUY":
      return { text: "text-emerald-300", bg: "bg-emerald-500/10", border: "border-emerald-400/30" };
    case "HOLD":
      return { text: "text-yellow-200", bg: "bg-yellow-400/10", border: "border-yellow-400/30" };
    case "SELL":
      return { text: "text-red-300", bg: "bg-red-500/10", border: "border-red-400/30" };
  }
}

function riskTone(risk: string) {
  const r = risk.toLowerCase();
  if (r.includes("low")) return "text-emerald-300";
  if (r.includes("high")) return "text-red-300";
  return "text-yellow-200";
}

export default function AiResearchResultCards({
  result,
}: {
  result: AiResearchStructuredResult;
}) {
  const tone = recommendationTone(result.recommendation);

  const listOrEmpty = (arr: string[] | undefined, fallbackLabel: string) => {
    if (!arr || arr.length === 0) return <div className="text-zinc-500">{fallbackLabel}</div>;
    return (
      <ul className="space-y-1">
        {arr.slice(0, 8).map((x, idx) => (
          <li key={idx} className="text-zinc-200/90 text-sm">
            • {x}
          </li>
        ))}
      </ul>
    );
  };

  const mkLevelsCard = (title: string, levels?: string[]) => (
    <GlassCard className="p-5 rounded-2xl border border-zinc-800/70 bg-black/20">
      <div className="text-sm font-bold text-white/90">{title}</div>
      <div className="mt-3">{listOrEmpty(levels, "No levels available")}</div>
    </GlassCard>
  );

  return (
    <div className="space-y-4">
      <GlassCard className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-yellow-400/10 border border-yellow-400/30 text-yellow-300">
                🤖
              </span>
              <h2 className="text-base sm:text-lg font-semibold">AI Research Result</h2>
            </div>
            <div className="mt-2 text-xs text-zinc-500">Structured analysis (live APIs)</div>
          </div>

          <div className="text-right">
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${tone.text} ${tone.bg} ${tone.border}`}
            >
              {result.recommendation}
            </div>
            <div className="mt-2 text-sm text-zinc-400">Confidence</div>
            <div className="text-2xl font-bold tabular-nums text-white">{result.confidencePercent}%</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-zinc-800 bg-black/30 p-3">
            <div className="text-xs text-zinc-400">Risk</div>
            <div className={`text-sm font-bold ${riskTone(result.risk)}`}>{result.risk}</div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-black/30 p-3">
            <div className="text-xs text-zinc-400">Investment Horizon</div>
            <div className="text-sm font-bold text-white/95">{result.investmentHorizon}</div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-black/30 p-3">
            <div className="text-xs text-zinc-400">Signal Quality</div>
            <div className="text-sm font-bold text-zinc-200/95">
              {result.confidencePercent >= 75 ? "High" : result.confidencePercent >= 55 ? "Medium" : "Low"}
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid md:grid-cols-2 gap-4">
        <GlassCard className="p-5">
          <div className="text-sm font-bold text-white/90">Technical Summary</div>
          <div className="mt-3 text-sm text-zinc-200/90 whitespace-pre-wrap">{result.technicalSummary || ""}</div>
        </GlassCard>
        <GlassCard className="p-5">
          <div className="text-sm font-bold text-white/90">Fundamental Summary</div>
          <div className="mt-3 text-sm text-zinc-200/90 whitespace-pre-wrap">{result.fundamentalSummary || ""}</div>
        </GlassCard>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <GlassCard className="p-5">
          <div className="text-sm font-bold text-white/90">Positive Signals</div>
          <div className="mt-3">{listOrEmpty(result.positiveSignals, "No positive signals")}</div>
        </GlassCard>
        <GlassCard className="p-5">
          <div className="text-sm font-bold text-white/90">Negative Signals</div>
          <div className="mt-3">{listOrEmpty(result.negativeSignals, "No negative signals")}</div>
        </GlassCard>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <GlassCard className="p-5">
          <div className="text-sm font-bold text-white/90">Catalysts</div>
          <div className="mt-3">{listOrEmpty(result.catalysts, "No catalysts")}</div>
        </GlassCard>
        <GlassCard className="p-5">
          <div className="text-sm font-bold text-white/90">Risks</div>
          <div className="mt-3">{listOrEmpty(result.risks, "No risks")}</div>
        </GlassCard>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {mkLevelsCard("Support Levels", result.supportLevels)}
        {mkLevelsCard("Resistance Levels", result.resistanceLevels)}
      </div>
    </div>
  );
}

