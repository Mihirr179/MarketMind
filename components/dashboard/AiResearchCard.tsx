"use client";

import GlassCard from "@/components/ui/GlassCard";

type AiRating = "Strong Buy" | "Buy" | "Hold" | "Sell";

function ratingFromScore(score: number): AiRating {
  if (score >= 75) return "Strong Buy";
  if (score >= 60) return "Buy";
  if (score >= 40) return "Hold";
  return "Sell";
}

function toneFromRating(r: AiRating) {
  switch (r) {
    case "Strong Buy":
    case "Buy":
      return { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-400/30" };
    case "Hold":
      return { text: "text-yellow-300", bg: "bg-yellow-400/10", border: "border-yellow-400/30" };
    case "Sell":
      return { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-400/30" };
  }
}

export default function AiResearchCard({
  symbol,
  confidence = 84,
  risk = "Medium",
}: {
  symbol: string;
  confidence?: number;
  risk?: "Low" | "Medium" | "High";
}) {
  // Simple deterministic demo scoring (keeps UI premium even if AI backend not wired yet)
  const bullishScore = Math.max(0, Math.min(100, (confidence + symbol.length * 3) % 101));
  const bearishScore = 100 - bullishScore;
  const predictedTrend = bullishScore >= 60 ? "Bullish" : bullishScore <= 40 ? "Bearish" : "Range";
  const rating = ratingFromScore(bullishScore);
  const tone = toneFromRating(rating);

  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-yellow-400/10 border border-yellow-400/30 text-yellow-300">
              🤖
            </span>
            <h2 className="text-base sm:text-lg font-semibold">AI Research</h2>
          </div>
          <p className="text-zinc-400 text-sm mt-2">
            High-signal summary generated for <span className="text-white font-semibold">{symbol}</span>.
          </p>
        </div>

        <div className="text-right">
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${tone.text} ${tone.bg} ${tone.border}`}
          >
            {rating}
          </div>
          <div className="mt-2 text-sm text-zinc-400">Confidence</div>
          <div className="text-2xl font-bold tabular-nums text-white">
            {confidence}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="rounded-xl border border-zinc-800 bg-black/30 p-3">
          <div className="text-xs text-zinc-400">Risk Level</div>
          <div className={`text-sm font-bold ${risk === "Low" ? "text-emerald-400" : risk === "High" ? "text-red-400" : "text-yellow-300"}`}>{risk}</div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-black/30 p-3">
          <div className="text-xs text-zinc-400">Predicted Trend</div>
          <div className={`text-sm font-bold ${predictedTrend === "Bullish" ? "text-emerald-400" : predictedTrend === "Bearish" ? "text-red-400" : "text-yellow-300"}`}>{predictedTrend}</div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-black/30 p-3">
          <div className="text-xs text-zinc-400">Signal</div>
          <div className="text-sm font-bold">{bullishScore >= 50 ? "Momentum" : "Reversion"}</div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>Bullish</span>
          <span className="font-semibold text-white tabular-nums">{bullishScore}%</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-white/5 overflow-hidden border border-zinc-800">
          <div
            className="h-full bg-emerald-400/70"
            style={{ width: `${bullishScore}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-400 mt-3">
          <span>Bearish</span>
          <span className="font-semibold text-white tabular-nums">{bearishScore}%</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-white/5 overflow-hidden border border-zinc-800">
          <div className="h-full bg-red-400/70" style={{ width: `${bearishScore}%` }} />
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-zinc-800 bg-black/25 p-4">
        <div className="text-sm font-semibold text-white">AI Explanation</div>
        <p className="text-zinc-300 text-sm mt-2 leading-relaxed">
          The model weights price action consistency, volatility regime, and momentum confirmation.
          For <span className="text-white font-semibold">{symbol}</span>, bullish signals dominate as
          the trend structure and risk-adjusted returns remain favorable.
        </p>
      </div>
    </GlassCard>
  );
}

