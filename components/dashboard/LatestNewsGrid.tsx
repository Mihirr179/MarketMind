"use client";

import GlassCard from "@/components/ui/GlassCard";


type NewsItem = {
  title: string;
  source?: {
    id?: string;
    name?: string;
  };
};

import AINewsInsights from "@/components/dashboard/AINewsInsights";
import NewsSentimentBadge, {
  type ImpactLevel,
  type NewsSentiment,
} from "@/components/dashboard/NewsSentimentBadge";

function formatPublishedAt(publishedAt?: string) {
  if (!publishedAt) return "";
  const d = new Date(publishedAt);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function computeImpactFromTitle(title?: string): ImpactLevel {
  const t = (title || "").toLowerCase();
  if (/(crash|collapse|bankrupt|fraud|scandal|crisis|collapse|war|attack)/.test(t)) return "High";
  if (/(cuts|rise|surge|downgrade|upgrade|inflation|jobs|rate|guidance)/.test(t)) return "Medium";
  return "Low";
}

function computeSentimentFromTitle(title?: string): NewsSentiment {
  const t = (title || "").toLowerCase();
  if (/(record|soars|beats|outperform|bullish|upgrade|surge)/.test(t)) return "Bullish";
  if (/(miss|falls|drops|lawsuit|downgrade|bearish|slump|weak)/.test(t)) return "Bearish";
  return "Neutral";
}

export default function LatestNewsGrid({
  items,
  loading,
}: {
  items: NewsItem[];
  loading: boolean;
}) {
  return (
    <GlassCard className="p-5 sm:p-6 rounded-2xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs text-zinc-400 font-medium">Latest Market News</div>
          <h2 className="text-lg font-semibold mt-1">Top Headlines</h2>
        </div>
        <div className="text-xs text-zinc-500">Live feed</div>
      </div>

      <div className="mt-4">
        <AINewsInsights items={items} />
      </div>

      <div className="mt-5">
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
          <div className="grid grid-cols-1 gap-3">
            {Array.isArray(items) && items.length ? (
              items.slice(0, 12).map((n, idx) => {
                const sentiment = computeSentimentFromTitle(n.title) ?? "Neutral";
                const impact = computeImpactFromTitle(n.title) ?? "Medium";
                return (
                  <article
                    key={`${n.source?.name || "Unknown"}-${idx}`}
                    className="rounded-2xl border border-zinc-800/70 bg-black/20 p-4 transition hover:border-[#FACC15]/40 hover:shadow-[0_0_30px_rgba(250,204,21,0.10)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs text-zinc-500 truncate">
                          {n.source?.name || "Unknown"}
                        </div>
                        <h3 className="mt-2 text-sm font-semibold text-white/95 leading-relaxed">
                          {n.title}
                        </h3>
                        <div className="mt-2 text-xs text-zinc-500">
                          {formatPublishedAt((n as { publishedAt?: string }).publishedAt) || ""}
                        </div>
                      </div>

                      <div className="shrink-0">
                        <NewsSentimentBadge sentiment={sentiment} impact={impact} />
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
                      </button>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="text-sm text-zinc-500">No news available.</div>
            )}
          </div>
        )}
      </div>


    </GlassCard>
  );
}


