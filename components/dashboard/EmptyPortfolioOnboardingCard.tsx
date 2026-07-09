"use client";

import React from "react";
import { Sparkles, PlusCircle, Search, BarChart3, ShieldCheck } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

export default function EmptyPortfolioOnboardingCard() {
  return (
    <GlassCard className="p-6 sm:p-7 rounded-2xl">
      <div className="flex flex-col gap-6 min-w-0">
        <div className="flex items-start gap-4">
          <div className="grid size-12 place-items-center rounded-2xl bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 shrink-0">
            <Sparkles size={18} />
          </div>

          <div className="min-w-0">
            <div className="text-xs text-zinc-400 font-medium">Welcome to MarketMind</div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mt-1 break-words">
              Your Portfolio is Empty
            </h2>
            <p className="mt-3 text-sm sm:text-[15px] text-zinc-300 leading-relaxed break-words">
              Start by adding your first investment to unlock a premium dashboard experience.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="flex flex-wrap gap-3">
            <FeatureRow icon={<BarChart3 size={16} />} label="Portfolio Performance" />
            <FeatureRow icon={<ShieldCheck size={16} />} label="Risk Analysis" />
            <FeatureRow icon={<PlusCircle size={16} />} label="Allocation Analytics" />
            <FeatureRow icon={<Sparkles size={16} />} label="AI Portfolio Advisor" />
          </div>

          <div className="rounded-2xl border border-zinc-800/70 bg-black/20 p-4 sm:p-5 min-w-0">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs text-zinc-400 font-medium">Next steps</div>
                <div className="mt-1 text-sm font-semibold text-white break-words">
                  Get started in seconds
                </div>
              </div>
              <span className="text-zinc-500">👋</span>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <ActionButton
                icon={<PlusCircle size={16} />}
                label="Add First Stock"
                onClick={() => window.dispatchEvent(new CustomEvent("marketmind:onboard:add-stock"))}
              />
              <ActionButton
                icon={<Search size={16} />}
                label="Search Stocks"
                onClick={() => window.dispatchEvent(new CustomEvent("marketmind:onboard:search"))}
              />
              <ActionButton
                icon={<BarChart3 size={16} />}
                label="Create Watchlist"
                onClick={() => window.dispatchEvent(new CustomEvent("marketmind:onboard:watchlist"))}
              />
            </div>

            <div className="mt-4 text-xs text-zinc-500 break-words">
              Tip: use the Search experience to find tickers, then add them to your portfolio.
            </div>
          </div>

          <div className="text-xs text-zinc-500 border-t border-zinc-800/70 pt-4">
            No holdings detected — this setup will update automatically once you add assets.
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

function FeatureRow({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-zinc-800/60 bg-black/20 px-4 py-3">
      <span className="text-[#FACC15]">{icon}</span>
      <div className="text-sm font-semibold text-white">{label}</div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-800/70 bg-black/20 px-4 py-3 text-sm font-bold text-white/95 transition hover:border-[#FACC15]/40 hover:shadow-[0_0_30px_rgba(250,204,21,0.12)]"
    >
      <span className="text-[#FACC15]">{icon}</span>
      {label}
    </button>
  );
}

