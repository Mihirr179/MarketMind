"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  LineChart,
  Wallet,
  Gauge,
  TrendingUp,
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

type Tone = "green" | "red" | "yellow";

function toneClasses(tone: Tone) {
  switch (tone) {
    case "green":
      return {
        text: "text-emerald-400",
        border: "border-emerald-400/30",
        bg: "bg-emerald-500/10",
      };
    case "red":
      return {
        text: "text-red-400",
        border: "border-red-400/30",
        bg: "bg-red-500/10",
      };
    default:
      return {
        text: "text-yellow-300",
        border: "border-yellow-400/30",
        bg: "bg-yellow-400/10",
      };
  }
}

function Badge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  const cls = toneClasses(tone);
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold ${cls.text} ${cls.border} ${cls.bg}`}
    >
      {children}
    </span>
  );
}

export default function TerminalMetricCards() {
  // Dummy values for sprint UI only.
  const portfolioValue = 54210;
  const todayPnL = 1245;
  const todayPnLPercent = 5.3;

  const marketOpen = true;
  const marketStatusText = marketOpen ? "OPEN" : "CLOSED";

  const fearGreedValue = 72;
  const fearGreedTone: Tone = "green";

  const pnlTone: Tone = todayPnL >= 0 ? "green" : "red";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Portfolio Value */}
      <GlassCard className="p-5 rounded-2xl transition-all duration-300 hover:border-[#FACC15]/45">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-zinc-400 font-medium">Portfolio Value</div>
            <div className="mt-2 flex items-baseline gap-3">
              <div className="text-3xl font-bold tabular-nums text-[#FACC15]">{portfolioValue.toLocaleString()}</div>
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className={pnlTone === "green" ? "text-emerald-400" : "text-red-400"}>
                {todayPnL >= 0 ? "+" : ""}
                {todayPnL.toLocaleString()}
              </span>
              <span className="text-zinc-500">({todayPnLPercent.toFixed(2)}%)</span>
            </div>
          </div>

          <div className="grid size-11 place-items-center rounded-xl border border-[#FACC15]/30 bg-[#FACC15]/10 text-[#FACC15]">
            <Wallet size={18} />
          </div>
        </div>

        <div className="mt-4 text-xs text-zinc-500 flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-black/20 px-3 py-1">
            <TrendingUp size={14} /> Live
          </span>
        </div>
      </GlassCard>

      {/* Today P/L */}
      <GlassCard className="p-5 rounded-2xl transition-all duration-300 hover:border-[#FACC15]/45">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-zinc-400 font-medium">Today&apos;s P/L</div>
            <div className="mt-3 flex items-baseline gap-3">
              <div
                className={`text-2xl font-bold tabular-nums ${
                  todayPnL >= 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {todayPnL >= 0 ? "+" : ""}
                {todayPnL.toLocaleString()}
              </div>
              <div
                className={`text-sm font-bold ${todayPnL >= 0 ? "text-emerald-300" : "text-red-300"}`}
              >
                ({todayPnLPercent.toFixed(2)}%)
              </div>
            </div>
          </div>

          <div className="grid size-11 place-items-center rounded-xl border border-zinc-800 bg-black/30">
            {todayPnL >= 0 ? <ArrowUpRight size={18} className="text-emerald-400" /> : <ArrowDownRight size={18} className="text-red-400" />}
          </div>
        </div>

        <div className="mt-4 h-16 rounded-2xl border border-zinc-800/70 bg-black/20 flex items-center justify-between px-4">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <LineChart size={14} /> Daily momentum
          </div>
          <div className={todayPnL >= 0 ? "text-emerald-300" : "text-red-300"}>
            {todayPnL >= 0 ? "+" : ""}
            {Math.abs(todayPnLPercent).toFixed(2)}%
          </div>
        </div>
      </GlassCard>

      {/* Market Status */}
      <GlassCard className="p-5 rounded-2xl transition-all duration-300 hover:border-[#FACC15]/45">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-zinc-400 font-medium">Market Status</div>
            <div className="mt-3 flex items-center gap-3">
              <div
                className={`text-2xl font-bold tracking-wider ${
                  marketOpen ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {marketStatusText}
              </div>
              <Badge tone={marketOpen ? "green" : "red"}>{marketOpen ? "OPEN" : "CLOSED"}</Badge>
            </div>
          </div>
          <div className="grid size-11 place-items-center rounded-xl border border-zinc-800 bg-black/30">
            <Gauge size={18} className={marketOpen ? "text-emerald-400" : "text-red-400"} />
          </div>
        </div>
        <div className="mt-4 text-xs text-zinc-500">
          Live trading sessions and signal readiness.
        </div>
      </GlassCard>

      {/* Fear & Greed */}
      <GlassCard className="p-5 rounded-2xl transition-all duration-300 hover:border-[#FACC15]/45">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-zinc-400 font-medium">Fear &amp; Greed</div>
            <div className="mt-2 flex items-baseline gap-3">
              <div className="text-3xl font-bold tabular-nums text-white">{fearGreedValue}</div>
              <div className="text-sm text-zinc-500">/ 100</div>
            </div>
            <div className="mt-3">
              <Badge tone={fearGreedTone}>Greed</Badge>
            </div>
          </div>

          <div className="grid size-11 place-items-center rounded-xl border border-zinc-800 bg-black/30">
            <TrendingUp size={18} className="text-[#FACC15]" />
          </div>
        </div>

        <div className="mt-4">
          <div className="h-2 rounded-full bg-white/5 overflow-hidden border border-zinc-800">
            <div
              className="h-full rounded-full bg-[#FACC15]"
              style={{ width: `${fearGreedValue}%`, boxShadow: "0 0 24px rgba(250,204,21,0.35)" }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500">
            <span>Fear</span>
            <span>Greed</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

