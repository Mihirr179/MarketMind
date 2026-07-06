"use client";

import React, { useMemo } from "react";
import GlassCard from "@/components/ui/GlassCard";
import { usePortfolioData } from "@/components/dashboard/PortfolioDataContext";
import { calculatePortfolioRisk } from "@/utils/portfolioMetrics";


export default function PortfolioRiskCard() {
  const { data } = usePortfolioData();

  const risk = useMemo(() => calculatePortfolioRisk(data), [data]);

  const riskToneClass =
    risk?.riskLevel === "Low"
      ? "text-emerald-300"
      : risk?.riskLevel === "High"
        ? "text-red-300"
        : risk?.riskLevel === "Moderate"
          ? "text-[#FACC15]"
          : "text-zinc-300";

  return (
    <GlassCard className="p-5 rounded-2xl">
      <div className="text-xs text-zinc-400 font-medium">Risk Analysis</div>
      <div className="text-sm font-semibold mt-1 text-white">Key risk indicators</div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-zinc-800/70 bg-black/20 p-4">
          <div className="text-[11px] text-zinc-500">Risk Level</div>
          <div className={`mt-1 text-sm font-bold ${risk ? riskToneClass : "text-zinc-300"}`}>{risk ? risk.riskLevel : "--"}</div>
          <div className="text-[11px] text-zinc-500 mt-2">Score: {risk ? `${risk.riskScore}/100` : "--"}</div>
        </div>

        <div className="rounded-2xl border border-zinc-800/70 bg-black/20 p-4">
          <div className="text-[11px] text-zinc-500">Concentration</div>
          <div className="mt-1 text-sm font-bold text-white">
            {risk?.concentration == null || !Number.isFinite(risk.concentration) ? "--" : `${(risk.concentration * 100).toFixed(0)}%`}
          </div>
          <div className="text-[11px] text-zinc-500 mt-2">Top holding weight</div>
        </div>

        <div className="rounded-2xl border border-zinc-800/70 bg-black/20 p-4">
          <div className="text-[11px] text-zinc-500">Volatility (proxy)</div>
          <div className="mt-1 text-sm font-bold text-white">
            {risk?.volatilityPct == null || !Number.isFinite(risk.volatilityPct) ? "--" : `${risk.volatilityPct.toFixed(2)}%`}
          </div>
          <div className="text-[11px] text-zinc-500 mt-2">From holdings daily P/L variance</div>
        </div>

        <div className="rounded-2xl border border-zinc-800/70 bg-black/20 p-4">
          <div className="text-[11px] text-zinc-500">Estimated Beta</div>
          <div className="mt-1 text-sm font-bold text-white">
            {risk?.beta == null || !Number.isFinite(risk.beta) ? "--" : risk.beta.toFixed(2)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-2">Unavailable unless computed</div>
        </div>

        <div className="rounded-2xl border border-zinc-800/70 bg-black/20 p-4 sm:col-span-2 xl:col-span-1">
          <div className="text-[11px] text-zinc-500">Volatility-adjusted view</div>
          <div className="mt-1 text-sm font-bold text-white">{risk ? "Ready" : "--"}</div>
          <div className="text-[11px] text-zinc-500 mt-2">Uses only available enriched portfolio fields</div>
        </div>
      </div>
    </GlassCard>
  );
}


