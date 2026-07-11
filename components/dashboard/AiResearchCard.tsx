"use client";

import GlassCard from "@/components/ui/GlassCard";

export default function AiResearchCard({
  symbol,
}: {
  symbol: string;
  confidence?: number;
  risk?: "Low" | "Medium" | "High";
}) {
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
            Run analysis for <span className="text-white font-semibold">{symbol}</span>.
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-zinc-400">Status</div>
          <div className="text-2xl font-bold tabular-nums text-white">—</div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-zinc-800 bg-black/25 p-4">
        <div className="text-sm font-semibold text-white">How it works</div>
        <p className="text-zinc-300 text-sm mt-2 leading-relaxed">
          This card updates when you run <span className="text-white font-semibold">Analyze</span> in the AI Research page.
        </p>
      </div>
    </GlassCard>
  );
}

