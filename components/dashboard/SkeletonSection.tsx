"use client";

import React from "react";

export default function SkeletonSection({
  title,
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <section className="rounded-2xl border border-zinc-800/70 bg-black/20 p-5">
      {title ? <div className="text-sm font-bold text-white/90">{title}</div> : null}
      {subtitle ? <div className="text-xs text-zinc-500 mt-1">{subtitle}</div> : null}
      <div className="mt-4 space-y-3">
        <div className="h-4 w-[60%] rounded bg-zinc-800 animate-pulse" />
        <div className="h-4 w-[90%] rounded bg-zinc-800 animate-pulse" />
        <div className="h-4 w-[70%] rounded bg-zinc-800 animate-pulse" />
        <div className="h-10 w-full rounded bg-zinc-800 animate-pulse" />
      </div>
    </section>
  );
}

