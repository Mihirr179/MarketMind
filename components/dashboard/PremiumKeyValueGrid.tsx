"use client";

import GlassCard from "@/components/ui/GlassCard";

export default function PremiumKeyValueGrid({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; value: string; tone?: "good" | "bad" | "neutral" }>;
}) {
  return (
    <GlassCard className="p-5">
      <div className="text-sm font-bold text-white/90">{title}</div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {items.map((it, idx) => {
          const toneCls =
            it.tone === "good"
              ? "text-emerald-300"
              : it.tone === "bad"
                ? "text-red-300"
                : "text-zinc-200";

          return (
            <div key={idx} className="rounded-xl border border-zinc-800/70 bg-black/20 p-3">
              <div className="text-[11px] text-zinc-500">{it.label}</div>
              <div className={`mt-1 text-sm font-bold tabular-nums ${toneCls}`}>{it.value}</div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

