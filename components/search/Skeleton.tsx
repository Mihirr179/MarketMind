import React from "react";
import { SkeletonBlock } from "../ui/Skeleton";

export default function SkeletonPage() {
  return (
    <div className="w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-xl">
      <div className="flex justify-between items-start gap-6 mb-10">
        <div className="space-y-4">
          <SkeletonBlock className="h-16 w-56" />
          <SkeletonBlock className="h-10 w-40" />
          <SkeletonBlock className="h-10 w-72" />
        </div>
        <div className="space-y-4 text-right">
          <SkeletonBlock className="h-4 w-28 ml-auto" />
          <SkeletonBlock className="h-16 w-24 ml-auto" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-28" />
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <SkeletonBlock className="h-44" />
        <SkeletonBlock className="h-44" />
      </div>

      <div className="mt-10">
        <SkeletonBlock className="h-8 w-56 mb-4" />
        <SkeletonBlock className="h-80" />
      </div>

      <div className="mt-8">
        <SkeletonBlock className="h-16 w-64" />
      </div>
    </div>
  );
}

