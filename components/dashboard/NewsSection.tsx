"use client";

import { ArrowUpRight } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { useMemo } from "react";

type NewsItem = {
  title: string;
  source?: {
    id?: string;
    name?: string;
  };
};

export default function NewsSection({ items }: { items: NewsItem[] }) {
  const normalized = useMemo(() => (Array.isArray(items) ? items.slice(0, 4) : []), [items]);

  const sentimentBadge = (i: number) => {
    // demo sentiment badge without breaking API
    const buckets = [
      { text: "AI Bullish", cls: "text-emerald-300 border-emerald-400/30 bg-emerald-500/10" },
      { text: "AI Neutral", cls: "text-yellow-200 border-yellow-400/30 bg-yellow-400/10" },
      { text: "AI Bearish", cls: "text-red-300 border-red-400/30 bg-red-500/10" },
    ];
    return buckets[i % buckets.length];
  };

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs text-zinc-400 font-medium">News</div>
          <h2 className="text-lg font-semibold mt-1">Latest Headlines</h2>
        </div>
        <div className="text-xs text-zinc-500">Curated for you</div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3">
        {normalized.length === 0 ? (
          <div className="text-sm text-zinc-500">No news available.</div>
        ) : (
          normalized.map((n, idx) => {
            const badge = sentimentBadge(idx);
            const sourceName = n.source?.name || "Unknown";
            return (
              <article
                key={`${sourceName}-${idx}`}
                className="rounded-2xl border border-zinc-800/70 bg-black/20 p-4 hover:border-[#FACC15]/40 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="grid size-8 place-items-center rounded-xl border border-zinc-700/70 bg-[#18181B]/60 text-[11px] font-bold text-white/90">
                        {sourceName.slice(0, 2).toUpperCase()}
                      </span>
                      <div className="text-xs text-zinc-500 truncate">{sourceName}</div>
                    </div>

                    <h3 className="mt-2 text-sm font-semibold text-white/95 leading-relaxed">
                      {n.title}
                    </h3>
                  </div>
                  <div
                    className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-bold ${badge.cls}`}
                  >
                    {badge.text}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
                  <span>Just now</span>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 text-[#FACC15] font-bold hover:text-[#fde68a]"
                    onClick={() => window.open("/news", "_blank")}
                  >
                    Open
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </GlassCard>
  );
}

