"use client";

import GlassCard from "@/components/ui/GlassCard";

export default function DashboardHeader() {
  return (
    <GlassCard className="p-5 mb-5 transition-all duration-300 hover:border-[#FACC15]/45">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="text-xs text-zinc-500 font-medium">Good Morning</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#FACC15] mt-1">Mihir 👋</h1>
          <p className="text-sm text-zinc-400 mt-2">
            Monitor markets, portfolio performance and opportunities in real time.
          </p>
        </div>
        <div className="text-sm text-zinc-500">
          <span className="font-semibold text-white/90">MarketMind</span>
          <span className="ml-2 text-[#FACC15] font-bold">Terminal</span>
        </div>
      </div>
    </GlassCard>
  );
}

