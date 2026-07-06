"use client";

import React, { useMemo } from "react";
import GlassCard from "@/components/ui/GlassCard";

type RiskInputs = {
  holdingsCount?: number;
  totalValue?: number;
  todayPnL?: number;
  todayPnLPercent?: number;
};

function scoreTone(score: number) {
  if (score >= 70) return "text-emerald-300";
  if (score >= 45) return "text-[#FACC15]";
  return "text-red-300";
}

function riskLabel(level: number) {
  if (level <= 2) return "Low";
  if (level <= 4) return "Moderate";
  if (level <= 6) return "High";
  return "Very High";
}

export default function PortfolioRiskCard({ inputs }: { inputs?: RiskInputs | null }) {
  const computed = useMemo(() => {
    const holdings = typeof inputs?.holdingsCount === "number" && Number.isFinite(inputs.holdingsCount) ? inputs.holdingsCount : 12;
    const total = typeof inputs?.totalValue === "number" && Number.isFinite(inputs.totalValue) ? inputs.totalValue : 24580;
    const pnlPct = typeof inputs?.todayPnLPercent === "number" && Number.isFinite(inputs.todayPnLPercent) ? inputs.todayPnLPercent : 5.3;

    // Diversification score placeholder: higher holdings -> higher score (cap at 90)
    const diversificationScore = Math.min(90, Math.max(20, 18 + holdings * 4));

    // Volatility placeholder: scaled by abs daily move + lower with diversification
    const volatility = Math.min(60, Math.max(8, Math.abs(pnlPct) * 3.2 + 18 - holdings * 0.8));

    // Estimated beta placeholder: moderate depending on volatility.
    const beta = Math.min(2.8, Math.max(0.3, 0.6 + volatility / 70));

    // Sharpe placeholder: crude with assumption rf=1%
    const sharpe = (pnlPct / 100 - 0.01) / (volatility / 100);

    // Risk level derived from volatility
    const riskLevel = Math.min(7, Math.max(1, Math.round(volatility / 9)));

    return {
      riskLevel,
      diversificationScore,
      volatility,
      beta,
      sharpe,
      total,
    };
  }, [inputs]);

  return (
    <GlassCard className="p-5 rounded-2xl">
      <div className="text-xs text-zinc-400 font-medium">Risk Analysis</div>
      <div className="text-sm font-semibold mt-1 text-white">Key risk indicators</div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-zinc-800/70 bg-black/20 p-4">
          <div className="text-[11px] text-zinc-500">Risk Level</div>
          <div className="mt-1 text-sm font-bold text-white">{riskLabel(computed.riskLevel)}</div>
          <div className="text-[11px] text-zinc-500 mt-2">Score: {computed.riskLevel}/7</div>
        </div>

        <div className="rounded-2xl border border-zinc-800/70 bg-black/20 p-4">
          <div className="text-[11px] text-zinc-500">Diversification Score</div>
          <div className={`mt-1 text-sm font-bold ${scoreTone(computed.diversificationScore)}`}>{computed.diversificationScore.toFixed(0)}</div>
          <div className="text-[11px] text-zinc-500 mt-2">Higher is better</div>
        </div>

        <div className="rounded-2xl border border-zinc-800/70 bg-black/20 p-4">
          <div className="text-[11px] text-zinc-500">Volatility</div>
          <div className={`mt-1 text-sm font-bold ${computed.volatility <= 25 ? "text-emerald-300" : computed.volatility <= 45 ? "text-[#FACC15]" : "text-red-300"}`}>{computed.volatility.toFixed(1)}%</div>
          <div className="text-[11px] text-zinc-500 mt-2">Placeholder estimate</div>
        </div>

        <div className="rounded-2xl border border-zinc-800/70 bg-black/20 p-4">
          <div className="text-[11px] text-zinc-500">Estimated Beta</div>
          <div className={`mt-1 text-sm font-bold ${computed.beta <= 1 ? "text-emerald-300" : computed.beta <= 1.5 ? "text-[#FACC15]" : "text-red-300"}`}>{computed.beta.toFixed(2)}</div>
          <div className="text-[11px] text-zinc-500 mt-2">Market sensitivity</div>
        </div>

        <div className="rounded-2xl border border-zinc-800/70 bg-black/20 p-4 sm:col-span-2 xl:col-span-1">
          <div className="text-[11px] text-zinc-500">Sharpe Ratio</div>
          <div className={`mt-1 text-sm font-bold ${computed.sharpe >= 0.5 ? "text-emerald-300" : computed.sharpe >= 0 ? "text-[#FACC15]" : "text-red-300"}`}>{Number.isFinite(computed.sharpe) ? computed.sharpe.toFixed(2) : "—"}</div>
          <div className="text-[11px] text-zinc-500 mt-2">Placeholder if real returns are unavailable</div>
        </div>
      </div>
    </GlassCard>
  );
}

