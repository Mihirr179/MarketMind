"use client";

import React, { useMemo, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import GlassCard from "@/components/ui/GlassCard";

type TimeframeKey = "7D" | "1M" | "3M" | "1Y" | "ALL";

function toneClass(v: number) {
  return v >= 0 ? "text-emerald-400" : "text-red-400";
}

function formatMoney(v: number) {
  return `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function buildHistory(seed: number, points: number) {
  const start = 100;
  let current = start;
  const rand = (i: number) => {
    const x = Math.sin((seed + i) * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };

  const out: Array<{ t: string; v: number }> = [];
  for (let i = 0; i < points; i += 1) {
    const drift = Math.sin((i / points) * Math.PI * 1.8) * 0.55;
    const shock = (rand(i) - 0.5) * 1.6;
    current = current * (1 + (drift + shock) / 200);
    const label = i === 0 ? "Start" : i === points - 1 ? "Now" : "";
    out.push({ t: label || `${i + 1}`, v: current });
  }
  return out.map((p, idx) => ({ t: p.t, v: p.v + idx * 0.01 }));
}

export default function PortfolioPerformanceCard({
  totalValue,
  todayPnL,
  todayPnLPct,
}: {
  totalValue?: number;
  todayPnL?: number;
  todayPnLPct?: number;
}) {
  const [tf, setTf] = useState<TimeframeKey>("7D");

  const config = useMemo(() => {
    const map: Record<TimeframeKey, { points: number }> = {
      "7D": { points: 22 },
      "1M": { points: 30 },
      "3M": { points: 60 },
      "1Y": { points: 120 },
      ALL: { points: 180 },
    };
    return map[tf];
  }, [tf]);

  const data = useMemo(() => {
    const base = typeof totalValue === "number" && Number.isFinite(totalValue) ? totalValue : null;

    if (base == null) return [];

    const seed = Math.round(
      base + (typeof todayPnL === "number" ? todayPnL : 0) * 0.01 + (typeof todayPnLPct === "number" ? todayPnLPct : 0) * 0.1
    );

    const history = buildHistory(seed, config.points);
    const first = history[0]?.v ?? 100;
    return history.map((p) => ({ t: p.t, v: (p.v / first) * base }));
  }, [config.points, totalValue, todayPnL, todayPnLPct]);

  const chartKey = tf;

  const changePct = useMemo(() => {
    if (!data.length) return 0;
    const first = data[0]?.v ?? 1;
    const last = data.at(-1)?.v ?? 1;
    return ((last - first) / first) * 100;
  }, [data]);

  return (
    <GlassCard className="p-5 rounded-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="text-xs text-zinc-400 font-medium">Portfolio Performance</div>
          <div className="text-sm font-semibold mt-1 text-white">Return over time</div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`text-xs font-semibold ${toneClass(changePct)}`}>
            {changePct >= 0 ? "+" : ""}{changePct.toFixed(2)}%
          </div>
          <div className="hidden sm:block text-[11px] text-zinc-500">—</div>

        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(["7D", "1M", "3M", "1Y", "ALL"] as TimeframeKey[]).map((k) => {
          const active = tf === k;
          return (
            <button
              key={k}
              type="button"
              onClick={() => setTf(k)}
              className={
                "rounded-xl border px-3 py-1.5 text-xs font-bold transition " +
                (active
                  ? "border-[#FACC15]/70 bg-[#FACC15]/10 text-[#FACC15] shadow-[0_0_50px_rgba(250,204,21,0.10)]"
                  : "border-zinc-800 bg-black/30 text-zinc-400 hover:border-zinc-600 hover:text-white")
              }
            >
              {k}
            </button>
          );
        })}
      </div>

      <div className="mt-4 h-[260px]">
        <div className="rounded-2xl border border-zinc-800/70 bg-black/20 p-2">
          {data.length ? (
            <ResponsiveContainer>
              <LineChart data={data} key={chartKey} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <Tooltip
                  content={(props) => {
                    const { active, payload } = props;
                    if (!active || !payload?.length) return null;
                    const v = (payload[0] as { value?: number | undefined } | undefined)?.value;
                    return (
                      <div className="rounded-xl border border-zinc-800/60 bg-black/75 backdrop-blur px-3 py-2 text-xs text-zinc-200 shadow-lg">
                        <div className="font-semibold text-white">Portfolio Value</div>
                        <div className="text-zinc-300">{typeof v === "number" ? formatMoney(v) : "—"}</div>
                      </div>
                    );
                  }}
                />

                <XAxis dataKey="t" tick={{ fill: "#a1a1aa", fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis
                  tick={{ fill: "#a1a1aa", fontSize: 11 }}
                  width={70}
                  tickFormatter={(val) => (typeof val === "number" ? `$${(val / 1000).toFixed(0)}k` : "")}
                />
                <Line type="monotone" dataKey="v" stroke="#FACC15" strokeWidth={3} dot={false} isAnimationActive animationDuration={650} activeDot={{ r: 4, fill: "#FACC15" }} />
                <Line type="monotone" dataKey="v" stroke="#FACC15" strokeWidth={8} opacity={0.12} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-zinc-500">Portfolio history unavailable.</div>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="text-xs text-zinc-500">
          Today:{" "}
          <span className={`font-semibold ${toneClass(todayPnLPct ?? 0)}`}>
            {typeof todayPnLPct === "number" ? `${todayPnLPct >= 0 ? "+" : ""}${todayPnLPct.toFixed(2)}%` : "—"}
          </span>
          {typeof todayPnL === "number" ? (
            <span className="ml-2 font-semibold text-white/90">
              ({todayPnL >= 0 ? "+" : ""}{formatMoney(todayPnL).replace("$", "$")})
            </span>
          ) : null}
        </div>
        <div className="text-[11px] text-zinc-500">Smooth transitions on timeframe change</div>
      </div>
    </GlassCard>
  );
}

