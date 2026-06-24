import React from "react";

export function SkeletonLine({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-4 w-full rounded-lg bg-white/5 ${className} animate-[skeleton-shimmer_1.3s_ease-in-out_infinite]`}
      aria-hidden="true"
    />
  );
}

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl bg-white/5 ${className} animate-[skeleton-shimmer_1.3s_ease-in-out_infinite]`}
      aria-hidden="true"
    />
  );
}

