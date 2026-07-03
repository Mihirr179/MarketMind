import React from "react";

export default function AIPlaceholder() {
  return (
    <section className="mb-10">
      <h3 className="text-2xl font-bold text-[#FACC15] mb-4">AI Stock Analysis</h3>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
        <div className="text-zinc-200/90 font-semibold">
          AI Stock Analysis
        </div>
        <p className="text-zinc-300 mt-2">
          This section will generate an AI research summary using Gemini.
        </p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-white/5 bg-black/10 p-4">
            <p className="text-zinc-300/90 text-sm">Summary</p>
            <div className="mt-3 h-5 w-3/4 rounded bg-white/10 animate-[skeleton-shimmer_1.3s_ease-in-out_infinite]" />
          </div>
          <div className="rounded-xl border border-white/5 bg-black/10 p-4">
            <p className="text-zinc-300/90 text-sm">Strengths</p>
            <div className="mt-3 space-y-2">
              <div className="h-4 w-11/12 rounded bg-white/10 animate-[skeleton-shimmer_1.3s_ease-in-out_infinite]" />
              <div className="h-4 w-9/12 rounded bg-white/10 animate-[skeleton-shimmer_1.3s_ease-in-out_infinite]" />
            </div>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/10 p-4">
            <p className="text-zinc-300/90 text-sm">Risks / Outlook</p>
            <div className="mt-3 space-y-2">
              <div className="h-4 w-10/12 rounded bg-white/10 animate-[skeleton-shimmer_1.3s_ease-in-out_infinite]" />
              <div className="h-4 w-8/12 rounded bg-white/10 animate-[skeleton-shimmer_1.3s_ease-in-out_infinite]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

