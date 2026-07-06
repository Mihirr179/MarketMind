"use client";

import React from "react";

export type NewsSentiment = "Bullish" | "Neutral" | "Bearish";
export type ImpactLevel = "High" | "Medium" | "Low";

type Props = {
  sentiment?: NewsSentiment;
  impact?: ImpactLevel;
};

function sentimentStyle(sentiment: NewsSentiment) {
  switch (sentiment) {
    case "Bullish":
      return {
        badgeCls:
          "text-emerald-300 border-emerald-400/30 bg-emerald-500/10",
        dotCls: "bg-emerald-400",
      };
    case "Bearish":
      return {
        badgeCls: "text-red-300 border-red-400/30 bg-red-500/10",
        dotCls: "bg-red-400",
      };
    case "Neutral":
    default:
      return {
        badgeCls: "text-yellow-200 border-yellow-400/30 bg-yellow-400/10",
        dotCls: "bg-yellow-300",
      };
  }
}

function impactStyle(impact: ImpactLevel) {
  switch (impact) {
    case "High":
      return {
        badgeCls: "text-red-300 border-red-400/30 bg-red-500/10",
      };
    case "Medium":
      return {
        badgeCls: "text-yellow-200 border-yellow-400/30 bg-yellow-400/10",
      };
    case "Low":
    default:
      return {
        badgeCls: "text-emerald-300 border-emerald-400/30 bg-emerald-500/10",
      };
  }
}

export default function NewsSentimentBadge({
  sentiment = "Neutral",
  impact = "Medium",
}: Props) {
  const s = sentimentStyle(sentiment);
  const i = impactStyle(impact);

  return (
    <div className="flex items-center gap-2">
      <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold ${s.badgeCls}`}>
        <span className={`size-2.5 rounded-full ${s.dotCls}`} aria-hidden />
        {sentiment}
      </span>
      <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold ${i.badgeCls}`}>
        Impact: {impact}
      </span>
    </div>
  );
}

