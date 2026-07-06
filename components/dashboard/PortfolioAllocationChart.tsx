"use client";

import React, { useMemo, useState } from "react";
import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import GlassCard from "@/components/ui/GlassCard";

export type AllocationDatum = {
  name: string;
  value: number; // percentage 0..100
  color: string;
};

function formatPct(v: unknown) {
  const n = typeof v === "number" && Number.isFinite(v) ? v : 0;
  return `${n.toFixed(0)}%`;
}

type TooltipProps = {
  active?: boolean;
  payload?: Array<{ payload?: AllocationDatum }>;
};

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload as AllocationDatum | undefined;
  return (
    <div className="rounded-xl border border-zinc-800/60 bg-black/70 backdrop-blur px-3 py-2 text-xs text-zinc-200 shadow-lg">
      <div className="font-semibold text-white">{row?.name ?? "—"}</div>
      <div className="text-zinc-300">Allocation: {formatPct(row?.value)}</div>
    </div>
  );
}


export default function PortfolioAllocationChart({
  holdingsLabel = "Holdings",
  watchlistLabel = "Watchlist",
  allocations,
  loading = false,
}: {
  allocations?: { holdingsPct?: number; watchPct?: number; [k: string]: unknown } | null;
  holdingsLabel?: string;
  watchlistLabel?: string;
  loading?: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const data = useMemo<AllocationDatum[]>(() => {
    const h = typeof allocations?.holdingsPct === "number" && Number.isFinite(allocations.holdingsPct) ? allocations.holdingsPct : 72;
    const w = typeof allocations?.watchPct === "number" && Number.isFinite(allocations.watchPct) ? allocations.watchPct : 28;
    const sum = Math.max(1e-9, h + w);

    const hp = (h / sum) * 100;
    const wp = 100 - hp;

    return [
      { name: holdingsLabel, value: hp, color: "#FACC15" },
      { name: watchlistLabel, value: wp, color: "#27272A" },
    ];
  }, [allocations, holdingsLabel, watchlistLabel]);

  return (
    <GlassCard className="p-5 rounded-2xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs text-zinc-400 font-medium">Portfolio Allocation</div>
          <div className="text-sm font-semibold mt-1 text-white">Holdings vs Watchlist</div>
        </div>
        <div className="text-[11px] text-zinc-500">Hover for details</div>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="h-[240px] w-full">
            {loading ? (
              <div className="h-full w-full rounded-2xl bg-white/5 animate-[skeleton-shimmer_1.3s_ease-in-out_infinite]" />
            ) : (
              <ResponsiveContainer>
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={86}
                    stroke="transparent"
                    isAnimationActive
                    animationDuration={900}
                    onMouseEnter={(_, idx) => setActiveIndex(typeof idx === "number" ? idx : null)}
                    onMouseLeave={() => setActiveIndex(null)}
                  />

                  {/* Animated emphasis via overlay ring (Recharts cell typing varies by version) */}
                  <div className="sr-only" aria-hidden />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="-mt-[178px] relative flex items-center justify-center">
            <div className="rounded-2xl border border-zinc-800/70 bg-black/20 backdrop-blur px-4 py-3 text-center">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500">Mix</div>
              <div className="mt-1 text-sm font-bold text-white">Live Allocation</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {data.map((d) => (
            <div key={d.name} className="rounded-2xl border border-zinc-800/70 bg-black/20 p-4 transition-all duration-300 hover:border-[#FACC15]/35 hover:shadow-[0_0_30px_rgba(250,204,21,0.10)]">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full" style={{ background: d.color }} aria-hidden />
                  <div className="min-w-0">
                    <div className="text-xs text-zinc-400 truncate">{d.name}</div>
                    <div className="text-sm font-semibold text-white mt-0.5">{formatPct(d.value)}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

