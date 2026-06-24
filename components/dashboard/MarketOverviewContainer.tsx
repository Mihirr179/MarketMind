"use client";

import { useEffect, useState } from "react";
import MarketOverviewStrip from "@/components/dashboard/MarketOverviewStrip";

type MarketRow = {
  symbol: string;
  price: number | null;
  changePercent: number | null;
  changeAbs: number | null;
};

export default function MarketOverviewContainer() {
  const [rows, setRows] = useState<
    Record<string, { price?: number | null; changePercent?: number | null }>
  >({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // If your /api/market doesn\'t support index/crypto tickers,
        // the strip will still render with skeleton-like values.
        const symbols = "SPY,QQQ,DIA,^NSEI,^BSESN,BTC-USD,ETH-USD";
        const res = await fetch(`/api/market?symbols=${encodeURIComponent(symbols)}`);
        const data = (await res.json()) as MarketRow[];
        if (cancelled) return;

        if (Array.isArray(data)) {
          const next: Record<string, { price?: number | null; changePercent?: number | null }> = {};
          for (const r of data) {
            next[r.symbol] = {
              price: r.price,
              changePercent: r.changePercent,
            };
          }
          setRows(next);
        }
      } catch {
        // keep previous
      }
    }

    load();
    const id = window.setInterval(load, 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return <MarketOverviewStrip rows={rows} />;
}

