"use client";

import React, { useMemo } from "react";

import GlassCard from "@/components/ui/GlassCard";

import PortfolioRiskCard from "@/components/dashboard/PortfolioRiskCard";
import PortfolioAllocationChart from "@/components/dashboard/PortfolioAllocationChart";
import PortfolioPerformanceCard from "@/components/dashboard/PortfolioPerformanceCard";
import AIPortfolioAdvisor from "@/components/dashboard/AIPortfolioAdvisor";

import EmptyPortfolioOnboardingCard from "@/components/dashboard/EmptyPortfolioOnboardingCard";

import { usePortfolioData } from "@/components/dashboard/PortfolioDataContext";

export default function PortfolioConditionalLayout() {

  const { data } = usePortfolioData();

  const holdingsCount = data?.holdingsCount ?? 0;
  const isEmpty = holdingsCount === 0;

  const portfolioLeft = useMemo(() => {
    if (isEmpty) return null;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 space-y-4">
            <PortfolioAllocationChart
              allocations={data?.allocation ?? null}
              loading={false}
            />
            <PortfolioPerformanceCard
              totalValue={data?.portfolioValue ?? undefined}
              todayPnL={data?.dailyPnL ?? undefined}
              todayPnLPct={data?.dailyPnLPct ?? undefined}
            />
          </div>
          <div className="space-y-4">
            <PortfolioRiskCard />
            <AIPortfolioAdvisor />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <GlassCard className="p-5 rounded-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs text-zinc-400 font-medium">
                  Top Performing Holding
                </div>
                <div className="text-sm font-semibold mt-1 text-white">
                  {data?.topHolding?.symbol ?? "--"}
                </div>
              </div>
              <div className="text-xs font-semibold text-emerald-400">▲</div>
            </div>
            <div className="mt-3 text-[11px] text-zinc-500">
              Best daily momentum
            </div>
          </GlassCard>

          <GlassCard className="p-5 rounded-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs text-zinc-400 font-medium">
                  Worst Performing Holding
                </div>
                <div className="text-sm font-semibold mt-1 text-white">
                  {data?.worstHolding?.symbol ?? "--"}
                </div>
              </div>
              <div className="text-xs font-semibold text-red-400">▼</div>
            </div>
            <div className="mt-3 text-[11px] text-zinc-500">
              Needs attention
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }, [data, isEmpty]);

  return (
    <div className="min-w-0 w-full h-auto">
      {isEmpty ? (
        <div className="min-w-0 overflow-hidden w-full h-auto rounded-2xl">
          <EmptyPortfolioOnboardingCard />
        </div>
      ) : (
        <div className="min-w-0 w-full h-auto overflow-hidden rounded-2xl">
          {portfolioLeft}
        </div>
      )}
    </div>
  );
}

