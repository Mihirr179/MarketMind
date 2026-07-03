import React from "react";

const dummyNews = [
  {
    headline: "Market volatility rises as investors weigh new guidance",
    source: "MarketWire",
    published: "Today",
  },
  {
    headline: "Earnings preview: analysts expect stronger margins",
    source: "Street Journal",
    published: "Yesterday",
  },
  {
    headline: "Tech leaders rally while growth stocks outperform",
    source: "InvestNow",
    published: "2 days ago",
  },
];

export default function NewsPlaceholder() {
  return (
    <section className="mb-10">
      <h3 className="text-2xl font-bold text-[#FACC15] mb-4">Latest News</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {dummyNews.map((n) => (
          <div
            key={n.headline}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur"
          >
            <p className="text-zinc-200 font-semibold leading-snug">
              {n.headline}
            </p>
            <div className="mt-4 text-sm text-zinc-400 flex items-center justify-between">
              <span>{n.source}</span>
              <span className="text-zinc-300">{n.published}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

