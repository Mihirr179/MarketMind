"use client";

import { ArrowUpRight, Clock3, AlertTriangle, RotateCcw } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

export type NewsArticle = {
  source?: { id?: string; name?: string };
  publishedAt?: string;
  title?: string;
  impact?: string;
  sentiment?: string;
  url?: string;
};

function formatTime(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export default function NewsCardList({
  loading,
  error,
  items,
  onRetry,
  max = 8,
}: {
  loading: boolean;
  error: string | null;
  items: NewsArticle[];
  onRetry?: () => void;
  max?: number;
}) {
  const normalized = Array.isArray(items) ? items.slice(0, max) : [];

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs text-zinc-400 font-medium">News</div>
          <h2 className="text-lg font-semibold mt-1">Latest Articles</h2>
        </div>
        <div className="text-xs text-zinc-500">Live</div>
      </div>

      {loading ? (
        <div className="mt-4 grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-zinc-800/70 bg-black/20 p-4 animate-pulse">
              <div className="h-3 w-[45%] bg-zinc-800 rounded" />
              <div className="h-4 w-[90%] bg-zinc-800 rounded mt-3" />
              <div className="h-4 w-[60%] bg-zinc-800 rounded mt-2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5" size={16} />
            <div className="min-w-0">
              <div className="font-semibold">Failed to load news</div>
              <div className="text-red-200/80 mt-1">{error}</div>
              {onRetry ? (
                <button
                  type="button"
                  onClick={onRetry}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-100 hover:border-red-500/50"
                >
                  <RotateCcw size={14} /> Retry
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : normalized.length === 0 ? (
        <div className="mt-4 text-sm text-zinc-500">No news available.</div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3">
          {normalized.map((n, idx) => {
            const sourceName = n.source?.name || n.source?.id || "Unknown";
            const title = n.title || "";
            const impact = n.impact || "";
            const sentiment = n.sentiment || "";

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
                    <h3 className="mt-2 text-sm font-semibold text-white/95 leading-relaxed">{title}</h3>
                  </div>
                  <div className="shrink-0 text-[11px] font-bold text-zinc-400">
                    {impact || sentiment || ""}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
                  <span className="inline-flex items-center gap-2">
                    <Clock3 size={14} /> {formatTime(n.publishedAt)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (n.url) window.open(n.url, "_blank");
                      else window.open("/news", "_blank");
                    }}
                    className="inline-flex items-center gap-2 text-[#FACC15] font-bold hover:text-[#fde68a]"
                  >
                    Open
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}

