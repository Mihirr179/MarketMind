"use client";

import GlassCard from "@/components/ui/GlassCard";
import NewsSection from "@/components/dashboard/NewsSection";

type NewsItem = {
  title: string;
  source?: {
    id?: string;
    name?: string;
  };
};

export default function LatestNewsGrid({ items, loading }: { items: NewsItem[]; loading: boolean }) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs text-zinc-400 font-medium">Latest Market News</div>
          <h2 className="text-lg font-semibold mt-1">Top Headlines</h2>
        </div>
        <div className="text-xs text-zinc-500">Live feed</div>
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="rounded-2xl border border-zinc-800/70 bg-black/20 p-4">
            <div className="h-5 w-44 bg-white/5 rounded-md animate-[skeleton-shimmer_1.3s_ease-in-out_infinite]" />
            <div className="mt-3 space-y-3">
              <div className="h-16 bg-white/5 rounded-xl animate-[skeleton-shimmer_1.3s_ease-in-out_infinite]" />
              <div className="h-16 bg-white/5 rounded-xl animate-[skeleton-shimmer_1.3s_ease-in-out_infinite]" />
              <div className="h-16 bg-white/5 rounded-xl animate-[skeleton-shimmer_1.3s_ease-in-out_infinite]" />
            </div>
          </div>
        ) : (
          // Reuse existing component (keeps News API + UI intact).
          <div className="-mx-5">
            <NewsSection items={items} />
          </div>
        )}
      </div>
    </GlassCard>
  );
}

