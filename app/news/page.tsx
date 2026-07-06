"use client";

import { useEffect, useState } from "react";


export default function NewsPage() {
  type NewsItem = {
    title: string;
    source?: {
      name?: string;
    };
    publishedAt?: string;
    url?: string;
  };

  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/news")
      .then((res) => res.json())
      .then((data: NewsItem[]) => {
        setNews(data || []);
        setLoading(false);
      })
      .catch(() => {
        setNews([]);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-8">
    
      <h1 className="text-5xl font-bold text-yellow-400 mb-8">
        Financial News
      </h1>

      {loading ? (
        <p>Loading news...</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {news.map((item, index) => (
            <div
              key={index}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-yellow-400 transition"
            >
              <h2 className="text-xl font-semibold mb-4">
                {item.title}
              </h2>

              <p className="text-zinc-400 mb-2">
                {item.source?.name}
              </p>

              <p className="text-zinc-500 text-sm mb-4">
                {item.publishedAt
  ? new Date(item.publishedAt).toLocaleDateString()
  : "N/A"}
              </p>

              <a
                href={item.url}
                target="_blank"
                className="text-yellow-400 hover:underline"
              >
                Read Full Article →
              </a>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}